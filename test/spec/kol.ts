import "reflect-metadata";
import * as fs from "node:fs";
import * as path from "node:path";
import * as iconv from "iconv-lite";
import * as log4js from "log4js";
import { Container } from "typedi";
import { dataSource } from "../../src/app/DataSource";
import { Importer } from "../../src/app/Importer";

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
export function parseKolSpec(kind: string): KolSpec {
  const html = iconv.decode(
    fs.readFileSync(path.join(kolDir, "spec", `kol_${kind}.html`)),
    "Windows932",
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

/** 見本ファイルの一覧。同じ種別に複数ある場合がある(UMA, COM1) */
export function kolSamples(kind: string) {
  const dir = path.join(kolDir, kind);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir).map((f) => path.join(dir, f));
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
  /** 呼び出し元 ("KolDen2Kd3.ts:55" の形) */
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
}

/** DB を空にして、前提になる種別だけを取り込む。DB はこの呼び出しのあとも残る */
export async function resetKolDb(kind: string) {
  await setup();
  await dataSource.synchronize(true);
  const importer = Container.get(Importer);
  for (const pre of kolPrerequisites[kind] || []) {
    await importer.import({ [`kol_${pre}.kd3`]: kolSamples(pre)[0] });
  }
}

/**
 * 見本ファイルを実際の取り込み処理に通し、Reader が読んだ (offset, length) を記録します。
 * Reader の読み取りはすべて Buffer.prototype.copy を通るので、そこで捕まえます。
 * 出走馬データなどはレコードの一部を slice して読むので、親のレコード上の位置に直します。
 * 取り込み後の DB はそのまま残ります。
 */
export async function importKolKind(kind: string): Promise<KolImportResult> {
  await resetKolDb(kind);
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
    for (const file of kolSamples(kind)) {
      // 見本ファイルは同じ種別に複数あるので、取り込み対象の名前(kol_xxx.kd3)は種別から決める
      await importer.import({ [`kol_${kind}.kd3`]: file });
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
  return iconv.decode(record.subarray(address, address + bytes), "Windows932").trim();
}

/** レコードの (address) に Windows-932 の文字列を書き込む。残りは空白で埋める */
export function put(record: Buffer, address: number, bytes: number, value: string) {
  record.fill(0x20, address, address + bytes);
  iconv.encode(value, "Windows932").copy(record, address, 0, bytes);
}
