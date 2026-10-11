import * as fs from "node:fs";
import * as path from "node:path";
import * as iconv from "iconv-lite";

export const jravanSpecFile = path.resolve(
  __dirname,
  "../../docs/jra-van-spec/spec/a-data-format.csv",
);

/** 仕様書の 1 項目。pos は 1 始まり (子項目は親の中での位置) */
export interface JravanField {
  name: string;
  pos: number;
  repeat: number | null;
  bytes: number | null;
  /** 繰り返し全体のバイト数 (親項目のみ) */
  total: number | null;
  /** 子項目の親の項目名 */
  parent?: string;
}

export interface JravanSpec {
  /** 見出しの名前 (例: 出馬表１) */
  title: string;
  fields: JravanField[];
  /** レコード長 (レコード区切の終わり) */
  size: number;
}

/** 蓄積系データの見出し → 取り込み処理のレコード長に使うファイル名 */
export const jravanSections = {
  特別登録馬: "JracTok1",
  出馬表１: "JracDen1",
  出馬表２: "JracDen2",
  成績１: "JracSei1",
  成績２: "JracSei2",
  成績Ｈ: "JracSeih",
  票数１: "JracHyo1",
  票数２: "JracHyo2",
  票数３: "JracHyo3",
  票数４: "JracHyo4",
  票数５: "JracHyo5",
  票数６: "JracHyo6",
  オッズ１: "JracOds1",
  オッズ３: "JracOds3",
  オッズ４: "JracOds4",
  オッズ５: "JracOds5",
  オッズ６: "JracOds6",
  競走馬: "JracUmaj",
  騎手: "JracKisi",
  調教師: "JracChok",
  抹消競走馬: "JracDelu",
  抹消騎手: "JracDelk",
  抹消調教師: "JracDelc",
  年間スケジュール: "JracSch1",
};

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        cell += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") {
      cell += c;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const num = (s: string | undefined) => (s && /^\s*\d+\s*$/.test(s) ? Number(s) : null);
const clean = (s: string) => s.replace(/^[\s　]+|[\s　]+$/g, "");

let cache: Map<string, JravanSpec> | undefined;

/** 仕様書 (a-data-format.csv) の蓄積系データの項目表を読み取ります */
export function parseJravanSpec(title: string): JravanSpec {
  if (!cache) {
    cache = new Map();
    const rows = parseCsv(fs.readFileSync(jravanSpecFile, "utf8"));
    let spec: JravanSpec | undefined;
    let parent: JravanField | undefined;
    for (const row of rows) {
      const header = clean(row[0]).match(/^\d+ (\S+)$/);
      if (header && !row[1] && !row[2]) {
        spec = { title: header[1], fields: [], size: 0 };
        cache.set(header[1], spec);
        parent = undefined;
        continue;
      }
      if (!spec) {
        continue;
      }
      const pos = num(row[3]);
      if (num(row[0]) !== null && pos !== null) {
        const field: JravanField = {
          name: clean(row[2]),
          pos,
          repeat: num(row[4]),
          bytes: num(row[5]),
          total: num(row[6]),
        };
        spec.fields.push(field);
        parent = field.repeat ? field : undefined;
        if (field.name === "レコード区切" || field.name === "レコード区切り") {
          spec.size = pos + 1;
        }
      } else if (parent && !row[0] && row[1] && /^\(\s*\d+\)$/.test(row[3] ?? "")) {
        spec.fields.push({
          name: clean(row[2]),
          pos: Number(row[3].replace(/\D/g, "")),
          repeat: num(row[4]),
          bytes: num(row[5]),
          total: null,
          parent: parent.name,
        });
      }
    }
  }
  const spec = cache.get(title);
  if (!spec) {
    throw new Error(`仕様書に ${title} がありません`);
  }
  return spec;
}

/** 仕様書の項目名で位置を指定してレコードを作ります */
export class JravanRecord {
  public readonly buffer: Buffer;
  private readonly spec: JravanSpec;

  constructor(title: string) {
    this.spec = parseJravanSpec(title);
    this.buffer = Buffer.alloc(this.spec.size, 0x20);
    this.buffer[this.spec.size - 2] = 0x0d;
    this.buffer[this.spec.size - 1] = 0x0a;
  }

  /**
   * 項目の 0 始まりの位置とバイト数。
   * parent: 繰り返しの項目の中の項目なら親の項目名、index: 繰り返しの何番目か (0 始まり)、
   * sub: 項目自体が繰り返しのとき (コーナー通過順など) その何番目か、nth: 同じ名前の項目の何番目か。
   */
  public locate(name: string, opts: JravanPut = {}) {
    const { parent, index = 0, sub = 0, nth = 0 } = opts;
    const fields = this.spec.fields.filter((f) => f.name === name && f.parent === parent);
    if (fields.length <= nth) {
      throw new Error(`仕様書の ${this.spec.title} に ${parent ?? ""}${name} がありません`);
    }
    const field = fields[nth];
    const bytes = field.bytes ?? 0;
    if (!parent) {
      return { at: field.pos - 1 + (index + sub) * bytes, bytes };
    }
    const p = this.spec.fields.find((f) => f.name === parent && !f.parent);
    if (!p?.repeat || !p.total) {
      throw new Error(`${parent} は繰り返しの項目ではありません`);
    }
    const stride = p.total / p.repeat;
    return { at: p.pos - 1 + index * stride + field.pos - 1 + sub * bytes, bytes };
  }

  /** 数値は 0 埋め、文字列は右を空白埋め */
  public set(name: string, value: string | number, opts: JravanPut = {}) {
    const { at, bytes } = this.locate(name, opts);
    const text = typeof value === "number" ? String(value).padStart(bytes, "0") : value;
    const encoded = iconv.encode(text, "Windows932");
    if (bytes < encoded.length) {
      throw new Error(`${name} は ${bytes} バイトなのに ${encoded.length} バイト書こうとしました`);
    }
    encoded.copy(this.buffer, at);
    return this;
  }
}

export interface JravanPut {
  parent?: string;
  index?: number;
  sub?: number;
  nth?: number;
}
