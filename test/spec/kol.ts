import "reflect-metadata";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as log4js from "log4js";
import { Container } from "typedi";
import { dataSource } from "../../src/app/DataSource";
import { Importer } from "../../src/app/Importer";
import {
  kd2Den1Layout,
  kd2Den2Layout,
  kd2Sei1Layout,
} from "../../src/app/reader/KOL/KD2/Kd2Layout";
import { KolLayout } from "../../src/app/reader/KOL/KolLayout";
import { decodeSjis, encodeSjis } from "../../src/app/util/Sjis";

export const kolDir = path.resolve(__dirname, "../../docs/kol-spec/KD3");

/** 仕様書の 1 項目 (アドレスは 0 始まり) */
export interface KolField {
  no: number;
  name: string;
  bytes: number;
  address: number;
  note: string;
}

export interface KolSpec {
  fields: KolField[];
  /** 項目表から計算したレコード長 */
  tableLength: number;
}

const plain = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/**
 * KD3 のデータ仕様書(HTML, Windows-932)から項目表を読み取ります。
 * 行は「(空か「新」) 項番 項目名 桁数 アドレス 規 備考」のセルの並びです。
 * 繰り返しの項目は先頭の 1 組だけが載っていて、途中の項番は飛んでいます。
 */
export function parseKolSpec(kind: string, gen: "KD3" | "KD2" = "KD3"): KolSpec {
  const html = decodeSjis(
    fs.readFileSync(path.join(kolDir, "..", gen, "spec", `kol_${kind}.html`)),
  );
  const fields: KolField[] = [];
  for (const row of html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []) {
    const cells = (row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || []).map(plain);
    if (cells.length > 1 && !/^\d+$/.test(cells[0]) && /^\d+$/.test(cells[1])) {
      cells.shift();
    }
    if (cells.length < 5 || !/^\d+$/.test(cells[0])) {
      continue;
    }
    if (!/^\d+$/.test(cells[2]) || !/^\d+$/.test(cells[3])) {
      continue;
    }
    fields.push({
      no: +cells[0],
      name: cells[1],
      bytes: +cells[2],
      address: +cells[3],
      note: cells[cells.length - 1],
    });
  }
  const last = fields[fields.length - 1];
  return { fields, tableLength: last ? last.address + last.bytes : 0 };
}

export type KolGen = "KD3" | "KD2";

/** 取り込み対象のファイル名の拡張子 */
const extOf = (gen: KolGen) => (gen === "KD2" ? "kd2" : "kd3");

/** KD3 の見本ファイルの一覧。同じ種別に複数ある場合がある(UMA, COM1) */
function kd3Samples(kind: string) {
  const dir = path.join(kolDir, kind);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir).map((f) => path.join(dir, f));
}

/** KD2 の仕様書にある種別 */
export const kd2Kinds = [
  "kyu",
  "kis",
  "syu",
  "uma",
  "ket",
  "den1",
  "den2",
  "ods",
  "sei1",
  "sei2",
  "com1",
  "kod",
];

/** KD3 の項目の位置が違う種別の、KD2 での位置。ここにない種別は、KD2 と KD3 でレコードの並びが同じ */
export const kd2Layouts: { [kind: string]: KolLayout } = {
  den1: kd2Den1Layout,
  den2: kd2Den2Layout,
  sei1: kd2Sei1Layout,
  // 予備フィールドの長さだけが違う
  sei2: new KolLayout([
    { from: 0, delta: 0 },
    { from: 436, delta: null },
    { from: 598, delta: -126 },
  ]),
  // 「前回出走時のコメント」がない
  com1: new KolLayout([
    { from: 0, delta: 0 },
    { from: 2011, delta: null },
    { from: 2971, delta: -960 },
  ]),
};

/** KD3 のレコードを、KD2 の並びに組み替える (KD2 の見本ファイルがないので、KD3 の見本から作る) */
export function toKd2Record(kind: string, record: Buffer) {
  const layout = kd2Layouts[kind];
  if (!layout) {
    return record;
  }
  const length = parseKolSpec(kind, "KD2").tableLength;
  const out = Buffer.alloc(length, 0x20);
  const segments = layout.segments;
  segments.forEach((segment, i) => {
    if (segment.delta === null) {
      return;
    }
    const to = i + 1 < segments.length ? segments[i + 1].from : record.length;
    record.copy(out, segment.from + segment.delta, segment.from, to);
  });
  return out;
}

let kd2Dir: string | undefined;

/** KD2 形式に組み替えた見本ファイルの一覧。後始末は closeKolDb */
function kd2Samples(kind: string) {
  if (!kd2Layouts[kind]) {
    return kd3Samples(kind);
  }
  kd2Dir ??= fs.mkdtempSync(path.join(os.tmpdir(), "kol-kd2-"));
  const spec3 = parseKolSpec(kind).tableLength;
  return kd3Samples(kind).map((file) => {
    const data = fs.readFileSync(file);
    const out: Buffer[] = [];
    for (let i = 0; i + spec3 <= data.length; i += spec3) {
      out.push(toKd2Record(kind, data.subarray(i, i + spec3)));
    }
    const converted = path.join(kd2Dir as string, `${kind}_${path.basename(file)}`);
    fs.writeFileSync(converted, Buffer.concat(out));
    return converted;
  });
}

export function kolSamples(kind: string, gen: KolGen = "KD3") {
  return gen === "KD2" ? kd2Samples(kind) : kd3Samples(kind);
}

/** 取り込み順 (Importer の並びと同じ) */
export const kolKinds = [
  "kyu",
  "kis",
  "syu",
  "uma",
  "ket5",
  "den1",
  "den2",
  "ods",
  "ods2",
  "sei1",
  "sei2",
  "sei3",
  "com1",
  "kod",
  "kod2",
  "kod3",
];

/** その種別を取り込むときに、先に取り込んでおく必要がある種別 */
export const kolPrerequisites: { [kind: string]: string[] } = {
  den2: ["den1"],
  sei2: ["sei1", "uma"],
  sei3: ["sei1"],
  com1: ["sei1", "sei2"],
  ods: ["den1"],
  ods2: ["den1"],
  kod: ["sei1"],
  kod2: ["sei1"],
  kod3: ["sei1"],
};

export interface KolRead {
  /** 1 レコード内の絶対位置 (0 始まり) */
  offset: number;
  length: number;
  /** 呼び出し元 ("KolDen2.ts:55" の形) */
  caller: string;
}

export interface KolImportResult {
  /** 読んだ範囲 (同じ位置・長さは 1 回だけ) */
  reads: KolRead[];
  /** ERROR 以上のログ */
  errors: string[];
}

let ready = false;

/** メモリ上の DB を用意する (最初の 1 回だけ) */
async function setup() {
  if (ready) {
    return;
  }
  log4js.configure({
    appenders: { memory: { type: "recording" } },
    categories: { default: { appenders: ["memory"], level: "debug" } },
  });
  dataSource.setOptions({ database: ":memory:" });
  await dataSource.initialize();
  ready = true;
}

/** メモリ上の DB を閉じる。ほかのテストファイルが同じ DataSource を初期化できるようにする */
export async function closeKolDb() {
  // ほかのテストファイルのログが、このファイルの記録用の appender に溜まらないように、標準出力に戻す
  log4js.recording().reset();
  log4js.configure({
    appenders: { out: { type: "stdout" } },
    categories: { default: { appenders: ["out"], level: "debug" } },
  });
  if (ready) {
    await dataSource.destroy();
    ready = false;
  }
  if (kd2Dir) {
    fs.rmSync(kd2Dir, { recursive: true, force: true });
    kd2Dir = undefined;
  }
}

/** DB を空にして、前提になる種別だけを取り込む。DB はこの呼び出しのあとも残る */
export async function resetKolDb(kind: string, gen: KolGen = "KD3") {
  await setup();
  await dataSource.synchronize(true);
  const importer = Container.get(Importer);
  for (const pre of kolPrerequisites[kind] || []) {
    await importer.import({ [`kol_${pre}.${extOf(gen)}`]: kolSamples(pre, gen)[0] });
  }
}

/** DB を空にする。DB はこの呼び出しのあとも残る */
export async function emptyKolDb() {
  await setup();
  await dataSource.synchronize(true);
}

/**
 * 与えたレコードのファイルを実際の取り込み処理に通し、ERROR 以上のログを返します。
 * entries は「取り込み対象の名前 (kol_xxx.dat など) → ファイルの内容」。
 * 取り込み後の DB はそのまま残ります。
 */
export async function importKolFiles(entries: { [basename: string]: Buffer }) {
  await setup();
  log4js.recording().reset();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kol-files-"));
  try {
    const files: { [basename: string]: string } = {};
    for (const [basename, content] of Object.entries(entries)) {
      files[basename] = path.join(dir, basename);
      fs.writeFileSync(files[basename], content);
    }
    await Container.get(Importer).import(files);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  return log4js
    .recording()
    .replay()
    .filter((e) => ["ERROR", "FATAL"].includes(e.level.levelStr))
    .map((e) => e.data.map(String).join(" "));
}

/**
 * 見本ファイルを実際の取り込み処理に通し、Reader が読んだ (offset, length) を記録します。
 * Reader の読み取りはすべて Buffer.prototype.copy を通るので、そこで捕まえます。
 * 出走馬データなどはレコードの一部を slice して読むので、親のレコード上の位置に直します。
 * 取り込み後の DB はそのまま残ります。
 */
export async function importKolKind(kind: string, gen: KolGen = "KD3"): Promise<KolImportResult> {
  await resetKolDb(kind, gen);
  log4js.recording().reset();

  const reads: KolRead[] = [];
  const seen = new Set<string>();
  const originalCopy = Buffer.prototype.copy;
  (Buffer.prototype as { copy: unknown }).copy = function (
    this: Buffer,
    target: Buffer,
    ts?: number,
    ss?: number,
    se?: number,
  ) {
    if (ss !== undefined && se !== undefined && target.length === se - ss) {
      const key = `${this.byteOffset + ss}:${se - ss}`;
      if (!seen.has(key)) {
        seen.add(key);
        const stack = (new Error().stack || "").split("\n").slice(2);
        const frame = stack.find((l) => /reader\/KOL\//.test(l)) || "";
        const m = frame.match(/([^/]+\.ts):(\d+)/);
        reads.push({ offset: this.byteOffset + ss, length: se - ss, caller: m ? m[0] : "?" });
      }
    }
    return originalCopy.call(this, target, ts, ss, se);
  };

  const importer = Container.get(Importer);
  try {
    for (const file of kolSamples(kind, gen)) {
      // 見本ファイルは同じ種別に複数あるので、取り込み対象の名前(kol_xxx.kd3)は種別から決める
      await importer.import({ [`kol_${kind}.${extOf(gen)}`]: file });
    }
  } finally {
    (Buffer.prototype as { copy: unknown }).copy = originalCopy;
  }
  const errors = log4js
    .recording()
    .replay()
    .filter((e) => ["ERROR", "FATAL"].includes(e.level.levelStr))
    .map((e) => e.data.map(String).join(" "));
  return { reads, errors };
}

/** 仕様書の項目表が省略している範囲を含めて、読んでよい範囲かどうか */
export function isInsideSpec(spec: KolSpec, offset: number, length: number, elided: boolean) {
  const end = offset + length;
  if (spec.fields.some((f) => f.address <= offset && end <= f.address + f.bytes)) {
    return true;
  }
  if (!elided) {
    return false;
  }
  // 項目表に載っていない範囲 (繰り返しの途中) の内側
  let prev = 0;
  for (const f of spec.fields) {
    if (prev < f.address && prev <= offset && end <= f.address) {
      return true;
    }
    prev = Math.max(prev, f.address + f.bytes);
  }
  return false;
}

/** 見本ファイルのレコード(改行を含む)を取り出す */
export function kolRecords(kind: string, recordLength: number) {
  const records: Buffer[] = [];
  for (const file of kolSamples(kind)) {
    const data = fs.readFileSync(file);
    for (let i = 0; i + recordLength <= data.length; i += recordLength) {
      records.push(Buffer.from(data.subarray(i, i + recordLength)));
    }
  }
  return records;
}

/** レコードの (address, bytes) を Windows-932 の文字列で返す。前後の空白は除く */
export function field(record: Buffer, address: number, bytes: number) {
  return decodeSjis(record.subarray(address, address + bytes)).trim();
}

/** レコードの (address) に Windows-932 の文字列を書き込む。残りは空白で埋める */
export function put(record: Buffer, address: number, bytes: number, value: string) {
  record.fill(0x20, address, address + bytes);
  encodeSjis(value).copy(record, address, 0, bytes);
}
