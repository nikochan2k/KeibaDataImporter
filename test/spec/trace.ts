import "reflect-metadata";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as log4js from "log4js";
import { Codes } from "../../src/app/converters/Codes";
import { dataSource } from "../../src/app/DataSource";
import { importer } from "../../src/app/Importer";
import { Sed } from "../../src/app/reader/JRDB/Sed";
import { base, record, setFileDate } from "../helpers";
import { specOf } from "./docs";
import { parseSpec, specDir } from "./specs";

export interface Read {
  /** 読んだバッファ(レコード)の長さ */
  recordLength: number;
  offset: number;
  length: number;
  /** 呼び出し元 ("Tyb.ts:55" の形) */
  caller: string;
}

/** コード表にない値(空白を除く)。見本ファイルの種類、呼び出し元、読んだ文字列 */
export interface Unmapped {
  prefix: string;
  caller: string;
  value: string;
}

/** 見本ファイル名の英字部分(小文字)ごとの、取り込み時に読んだ範囲 */
export type Reads = Map<string, Read[]>;

/** 見本ファイルの一覧(仕様書に付いている実データの抜粋)。 */
export function sampleFiles() {
  const result: { [basename: string]: string } = {};
  for (const d of fs.readdirSync(specDir)) {
    const dir = path.join(specDir, d);
    if (!fs.statSync(dir).isDirectory()) {
      continue;
    }
    for (const f of fs.readdirSync(dir)) {
      if (/^[A-Za-z]+\d{6}\.txt$/.test(f)) {
        result[f] = path.join(dir, f);
      }
    }
  }
  return result;
}

/**
 * 見本ファイルの末尾が CR LF でなく LF だけ(TYB・HJC の見本)のときは、仕様書どおりの CR LF にそろえた複製を返す。
 * 元のファイルは書き換えない。
 */
function normalizeLineEnd(basename: string, file: string, tmp: string) {
  const prefix = basename.match(/^[A-Za-z]+/)[0].toLowerCase();
  const doc = specOf[prefix];
  if (!doc) {
    return file;
  }
  const length = parseSpec(doc).tableLength;
  const data = fs.readFileSync(file);
  if (data.length % length === 0) {
    return file;
  }
  const lines = data
    .toString("latin1")
    .split(/\r?\n/)
    .filter((l) => l.length > 0);
  const out = path.join(tmp, basename);
  fs.writeFileSync(out, Buffer.from(lines.map((l) => `${l}\r\n`).join(""), "latin1"));
  return out;
}

/**
 * 直前情報(TYB)は、出走馬がすでにあることが前提なので、見本のレースキーと馬番から SED のレコードを作って先に取り込む。
 */
async function seedShussoubaForTyb(file: string, basename: string) {
  const m = basename.match(/(\d{2})(\d{2})(\d{2})\.txt$/);
  const date = `20${m[1]}${m[2]}${m[3]}`;
  setFileDate(+`20${m[1]}`, +m[2], +m[3]);
  const data = fs.readFileSync(file);
  const sed = new Sed();
  for (let i = 0; i * 128 < data.length; i++) {
    const rec = data.subarray(i * 128, (i + 1) * 128);
    const key = rec.toString("latin1", 0, 8);
    const umaban = rec.toString("latin1", 8, 10);
    await sed.save(
      record([...base, [1, key], [9, umaban], [11, String(10000000 + i)], [19, date]], 376),
    );
  }
}

/**
 * 見本ファイルを実際の取り込み処理に通し、Reader が読んだ(offset, length)を記録します。
 * Reader の読み取りはすべて Buffer.prototype.copy を通るので、そこで捕まえます。
 */
export async function importSamples(onlyPrefixes?: string[], excludePrefixes: string[] = []) {
  log4js.configure({
    appenders: { memory: { type: "recording" } },
    categories: { default: { appenders: ["memory"], level: "debug" } },
  });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jrdb-spec-"));
  dataSource.setOptions({ database: ":memory:" });
  await dataSource.initialize();
  await dataSource.synchronize();

  const reads: Reads = new Map();
  let current: string | null = null;
  const originalCopy = Buffer.prototype.copy;
  (Buffer.prototype as { copy: unknown }).copy = function (
    this: Buffer,
    target: Buffer,
    ts?: number,
    ss?: number,
    se?: number,
  ) {
    if (
      current !== null &&
      ss !== undefined &&
      se !== undefined &&
      target.length === se - ss &&
      64 <= this.length
    ) {
      const stack = new Error().stack.split("\n").slice(2);
      const frame =
        stack.find((l) => /reader\/JRDB\//.test(l)) || stack.find((l) => /reader\//.test(l)) || "";
      const m = frame.match(/([^/]+\.ts):(\d+)/);
      const list = reads.get(current) || [];
      list.push({
        recordLength: this.length,
        offset: ss,
        length: se - ss,
        caller: m ? `${m[1]}:${m[2]}` : "?",
      });
      reads.set(current, list);
    }
    return originalCopy.call(this, target, ts, ss, se);
  };

  // コード表にない値の記録(Codes は未定義のコードを黙って null にするので、ここで捕まえる)
  const unmapped: Unmapped[] = [];
  const originalToCodeFrom = (Codes.prototype as unknown as { toCodeFrom: unknown }).toCodeFrom;
  (Codes.prototype as unknown as { toCodeFrom: unknown }).toCodeFrom = function (
    this: Codes,
    key: string,
    str: string,
  ) {
    const code = originalToCodeFrom.call(this, key, str);
    if (current !== null && code === null && str !== null && str.trim() !== "") {
      const stack = new Error().stack.split("\n").slice(2);
      const frame = stack.find((l) => /reader\//.test(l)) || "";
      const m = frame.match(/([^/]+\.ts):(\d+)/);
      unmapped.push({ prefix: current, caller: m ? `${m[1]}:${m[2]}` : "?", value: str });
    }
    return code;
  };

  const files = sampleFiles();
  try {
    for (const [basename, file] of Object.entries(files)) {
      const prefix = basename.match(/^[A-Za-z]+/)[0].toLowerCase();
      if ((onlyPrefixes && !onlyPrefixes.includes(prefix)) || excludePrefixes.includes(prefix)) {
        continue;
      }
      current = null;
      if (prefix === "tyb") {
        await seedShussoubaForTyb(normalizeLineEnd(basename, file, tmp), basename);
      }
      current = prefix;
      await importer.import({ [basename]: normalizeLineEnd(basename, file, tmp) });
    }
  } finally {
    current = null;
    (Buffer.prototype as { copy: unknown }).copy = originalCopy;
    (Codes.prototype as unknown as { toCodeFrom: unknown }).toCodeFrom = originalToCodeFrom;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  const logs = log4js
    .recording()
    .replay()
    .map((e) => ({
      level: e.level.levelStr as string,
      category: e.categoryName as string,
      message: e.data.map(String).join(" "),
    }));
  return { reads, logs, unmapped };
}
