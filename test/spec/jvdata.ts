import * as fs from "node:fs";
import * as path from "node:path";
import { encodeSjis } from "../../src/app/util/Sjis";

const specDir = path.resolve(__dirname, "../../docs/jvdata-spec/spec");

/** 仕様書の 1 項目。pos は 1 始まり (子項目は親の中での位置) */
export interface JvdataField {
  name: string;
  pos: number;
  repeat: number | null;
  bytes: number | null;
  /** 繰り返し全体のバイト数 (親項目のみ) */
  total: number | null;
  /** 子項目の親の項目名 */
  parent?: string;
}

export interface JvdataSpec {
  /** レコード種別 ID (例: RA) */
  id: string;
  /** 見出し (例: ２．レース詳細) */
  title: string;
  fields: JvdataField[];
  /** レコード長 */
  size: number;
}

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
const clean = (s: string | undefined) => (s ?? "").replace(/^[\s　]+|[\s　]+$/g, "");

let cache: Map<string, JvdataSpec> | undefined;

/** b-data-format.csv のレコードフォーマットを、レコード種別 ID ごとに読み取ります */
export function parseJvdataSpec(id: string): JvdataSpec {
  if (!cache) {
    cache = new Map();
    const rows = parseCsv(fs.readFileSync(path.join(specDir, "b-data-format.csv"), "utf8"));
    let spec: JvdataSpec | undefined;
    let parent: JvdataField | undefined;
    for (const row of rows) {
      if (clean(row[5]) === "レコード長") {
        spec = { id: "", title: clean(row[1]), fields: [], size: num(row[7]) ?? 0 };
        parent = undefined;
        continue;
      }
      if (!spec) {
        continue;
      }
      const pos = num(row[5]);
      if (num(row[1]) !== null && pos !== null) {
        const field: JvdataField = {
          name: clean(row[4]),
          pos,
          repeat: num(row[6]),
          bytes: num(row[7]),
          total: num(row[8]),
        };
        spec.fields.push(field);
        parent = field.repeat ? field : undefined;
        if (field.name === "レコード種別ID") {
          const m = /"([A-Z0-9]{2})"/.exec(row[10]);
          spec.id = m?.[1] ?? "";
          cache.set(spec.id, spec);
        }
      } else if (parent && !clean(row[1]) && clean(row[2]) && /^\(\s*\d+\)$/.test(row[5] ?? "")) {
        spec.fields.push({
          name: clean(row[4]),
          pos: Number((row[5] as string).replace(/\D/g, "")),
          repeat: num(row[6]),
          bytes: num(row[7]),
          total: null,
          parent: parent.name,
        });
      }
    }
  }
  const spec = cache.get(id);
  if (!spec) {
    throw new Error(`仕様書に ${id} がありません`);
  }
  return spec;
}

export interface JvdataPut {
  parent?: string;
  index?: number;
  sub?: number;
  nth?: number;
}

/** 仕様書の項目名で位置を指定してレコードを作ります */
export class JvdataRecord {
  public readonly buffer: Buffer;
  private readonly spec: JvdataSpec;

  constructor(id: string) {
    this.spec = parseJvdataSpec(id);
    this.buffer = Buffer.alloc(this.spec.size, 0x20);
    this.buffer[this.spec.size - 2] = 0x0d;
    this.buffer[this.spec.size - 1] = 0x0a;
    this.buffer.write(id, 0, "ascii");
  }

  /**
   * 項目の 0 始まりの位置とバイト数。
   * parent: 繰り返しの項目の中の項目なら親の項目名、index: 繰り返しの何番目か (0 始まり)、
   * sub: 項目自体が繰り返しのとき (本賞金など) その何番目か、nth: 同じ名前の項目の何番目か。
   */
  public locate(name: string, opts: JvdataPut = {}) {
    const { parent, index = 0, sub = 0, nth = 0 } = opts;
    const fields = this.spec.fields.filter((f) => f.name === name && f.parent === parent);
    if (fields.length <= nth) {
      throw new Error(`仕様書の ${this.spec.id} に ${parent ?? ""}${name} がありません`);
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
  public set(name: string, value: string | number, opts: JvdataPut = {}) {
    const { at, bytes } = this.locate(name, opts);
    const text = typeof value === "number" ? String(value).padStart(bytes, "0") : value;
    const encoded = encodeSjis(text);
    if (bytes < encoded.length) {
      throw new Error(`${name} は ${bytes} バイトなのに ${encoded.length} バイト書こうとしました`);
    }
    encoded.copy(this.buffer, at);
    return this;
  }

  /** キー(開催年、開催月日、競馬場コード、開催回、開催日目、レース番号) */
  public key(
    nen: number,
    tsukihi: string,
    basho: string,
    kaiji: number,
    nichiji: number,
    race: number,
  ) {
    return this.set("開催年", nen)
      .set("開催月日", tsukihi)
      .set("競馬場コード", basho)
      .set("開催回[第N回]", kaiji)
      .set("開催日目[N日目]", nichiji)
      .set("レース番号", race);
  }
}

/** d-code-table.csv: コード表番号 (例: 2009) → コードの一覧 */
export function parseJvdataCodes() {
  const tables = new Map<string, { code: string; naiyou: string }[]>();
  const rows = parseCsv(fs.readFileSync(path.join(specDir, "d-code-table.csv"), "utf8"));
  let table: { code: string; naiyou: string }[] | undefined;
  for (const row of rows) {
    const m = /^(\d{4})\./.exec(clean(row[1]));
    if (m) {
      table = [];
      tables.set(m[1], table);
      continue;
    }
    if (!table) {
      continue;
    }
    // 先頭の行は「バイト数, 値, 内容」の見出し。バイト数の列があるのは最初のコードの行だけ
    const code = row[2] ?? "";
    if (code !== "" && !/^[(（\s]/.test(code) && clean(row[3]) !== "" && row[2] !== "値") {
      table.push({ code, naiyou: clean(row[3]) });
    }
  }
  return tables;
}
