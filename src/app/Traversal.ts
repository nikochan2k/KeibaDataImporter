import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as process from "node:process";
import * as unzipper from "unzipper";
import { Entries, importer } from "./Importer";
import { importProgress } from "./ImportProgress";
import type { Logger } from "./LogUtil";
import { getLogger } from "./LogUtil";
import * as ioutil from "./util/IOUtil";
import { LhaReader } from "./util/LHA";
import { yieldToEventLoop } from "./util/Yield";

interface ImportFile {
  priority: number;
  path: string;
  basename: string;
}

export class Traversal {
  private static PRIORITIES: RegExp[] = [
    // KD3厩舎データ
    /ekyu.*\.lzh$/i,
    /kol_kyu.kd3$/i,
    // JRDB調教師データ
    /cza.*\.(txt|lzh|zip)$/i,
    /csa.*\.(txt|lzh|zip)$/i,
    // KD3 騎手
    /dkis.*\.lzh$/i,
    // KD3騎手データ
    /kol_kis.kd3$/i,
    // JRDB騎手データ
    /kza.*\.(txt|lzh|zip)$/i,
    /ksa.*\.(txt|lzh|zip)$/i,
    // KD3種牡馬データ
    /gsyu.*\.lzh$/i,
    /kol_syu.kd3$/i,
    // KD3 3代血統図
    /fket.*\.lzh$/i,
    /kol_ket.kd3$/i,
    // KD3 5代血統図
    /fket5.*\.lzh$/i,
    /kol_ket5.kd3$/i,
    // KD3 出馬表＋馬（１日）
    /hb.*\.lzh$/i,
    // KD3 日曜重賞付出馬表＋馬（１日）
    /hz.*\.lzh$/i,
    // KD3競走馬データ
    /kol_uma.kd3$/i,
    // JRDB データパック
    /pac\d+\.(lzh|zip)$/i,
    // JRDB馬基本データ
    /ukc.*\.(txt|lzh|zip)$/i,
    // KD3出走馬レースデータ
    /kol_den1.kd3$/i,
    // JRDB開催データ
    /ka[ab].*\.(txt|lzh|zip)$/i,
    // JRDB番組データ
    /ba[bc].*\.(txt|lzh|zip)$/i,
    // JRDB前走データ
    /zec.*\.(txt|lzh|zip)$/i,
    // JRDB前走拡張データ
    /zkb.*\.(txt|lzh|zip)$/i,
    // KOL出馬表出走馬データ
    /kol_den2.kd3$/i,
    // KD3 コメントデータ（出馬用）
    /mb.*\.lzh$/i,
    // JRDB競走馬データ
    /ky[ghi].*\.(txt|lzh|zip)$/i,
    // JRDB競走馬拡張データ
    /kka.*\.(txt|lzh|zip)$/i,
    // JRDB情報データ
    /joa.*\.(txt|lzh|zip)$/i,
    // JRDB調教分析データ
    /cy[ab].*\.(txt|lzh|zip)$/i,
    // JRDB調教本追切データ
    /cha.*\.(txt|lzh|zip)$/i,
    // JRDB直前情報データ
    /tyb.*\.(txt|lzh|zip)$/i,
    // KD3 予想（前売り）オッズ（１日）
    /jb.*\.lzh$/i,
    // KOL予想オッズ（単勝・枠連・馬連）
    /kol_ods.kd3$/i,
    // KOL予想オッズ２（馬単・３連複）
    /kol_ods2.kd3$/i,
    // JRDB基準オッズデータ
    /oz.*\.(txt|lzh|zip)$/i,
    // JRDBワイド基準オッズデータ
    /ow.*\.(txt|lzh|zip)$/i,
    // JRDB馬単基準オッズデータ
    /ou.*\.(txt|lzh|zip)$/i,
    // 3連複基準オッズデータ
    /ot.*\.(txt|lzh|zip)$/i,
    // 3連単基準オッズデータ
    /ov.*\.(txt|lzh|zip)$/i,
    // KD3 成績＋馬（１日）
    /ib.*\.lzh$/i,
    // KD3競走成績レースデータ
    /kol_sei1.kd3$/i,
    // JRDB成績レースデータ
    /sr[ab].*\.(txt|lzh|zip)$/i,
    // KD3競走成績出走馬データ
    /kol_sei2.kd3$/i,
    // JRDB成績データ
    /se[cd].*\.(txt|lzh|zip)$/i,
    // KD3制裁その他データ
    /kol_sei3.kd3$/i,
    // JRDB成績拡張データ
    /skb.*\.(txt|lzh|zip)$/i,
    // JRDB払戻情報データ
    /hj[ac].*\.(txt|lzh|zip)$/i,
    // KD3 コメントデータ（成績用）
    /lb.*\.lzh$/i,
    // KD3騎手厩舎コメント／次走へのメモ
    /kol_com1.kd3$/i,
    // KD3 確定オッズ（１日）
    /kd.*\.lzh$/i,
    // KD3確定オッズ（単勝・枠連・馬連）
    /kol_kod.kd3$/i,
    // KD3確定オッズ（複勝・ワイド・馬単・３連複）
    /kol_kod2.kd3$/i,
    // KD3確定オッズ３（３連単）
    /kol_kod3.kd3$/i,
    // 圧縮ファイル
    /\.(lzh|zip)$/i,
  ];

  private logger: Logger;

  /** 解凍と取り込み(読み取り + DB 書き込み)に使った時間 (ミリ秒) の合計。どちらが遅いかを見るための計測 */
  private timings = { uncompress: 0, import: 0 };

  constructor() {
    this.logger = getLogger(this);
  }

  public async traverse(entry: string) {
    const checked = this.resolveEntry(entry);
    this.timings = { uncompress: 0, import: 0 };
    try {
      if (checked.stat.isDirectory()) {
        await this.traverseDir(checked.entry);
      } else {
        await this.importFile(this.createImportFile(checked.entry));
      }
    } finally {
      this.logTimings();
    }
  }

  /** 取り込む対象のファイル数 (zip / lzh / 単独のデータファイル)。importFile が取り込むものだけを数える */
  public async countFiles(entry: string) {
    const checked = this.resolveEntry(entry);
    if (checked.stat.isDirectory()) {
      const importFiles = await this.listImportFiles(checked.entry, true);
      return importFiles.filter((importFile) => importFile.priority >= 0).length;
    }
    return this.createImportFile(checked.entry).priority >= 0 ? 1 : 0;
  }

  protected resolveEntry(entry: string) {
    const checked = this.checkPath(path.join(process.cwd(), entry)) || this.checkPath(entry);
    if (!checked) {
      throw new Error(`"${entry}"は見つかりません`);
    }
    if (!checked.stat.isDirectory() && !checked.stat.isFile()) {
      throw new Error(`"${entry}"はファイルでもディレクトリでもありません`);
    }
    return checked;
  }

  protected checkPath(entry: string) {
    try {
      return { stat: fs.statSync(entry), entry: entry };
    } catch (_e) {
      return null;
    }
  }

  protected getPriority(type: string) {
    for (let i = 0; i < Traversal.PRIORITIES.length; i++) {
      const pattern = Traversal.PRIORITIES[i];
      if (pattern.test(type)) {
        return i;
      }
    }
    return -1;
  }

  protected async traverseDir(lzhDir: string) {
    await this.importFiles(await this.listImportFiles(lzhDir));
  }

  protected logTimings() {
    const { uncompress, import: imported } = this.timings;
    const total = uncompress + imported;
    if (total === 0) {
      return;
    }
    const percent = (ms: number) => ((ms / total) * 100).toFixed(1);
    this.logger.info(
      `所要時間: 解凍 ${(uncompress / 1000).toFixed(1)}秒 (${percent(uncompress)}%), ` +
        `取り込み ${(imported / 1000).toFixed(1)}秒 (${percent(imported)}%)`,
    );
  }

  /** ディレクトリ配下のファイルを列挙する。数えるだけのときは非同期で、イベントループを止めない */
  protected async listImportFiles(lzhDir: string, async = false) {
    const entries = async
      ? await fs.promises.readdir(lzhDir, { recursive: true, withFileTypes: true })
      : fs.readdirSync(lzhDir, { recursive: true, withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && /^[^.].*\./.test(entry.name))
      .map((entry) => this.createImportFile(path.join(entry.parentPath, entry.name)));
  }

  protected createImportFile(filepath: string) {
    const basename = path.basename(filepath);
    const priority = this.getPriority(basename);
    const importFile: ImportFile = { priority: priority, path: filepath, basename: basename };
    return importFile;
  }

  protected async importFiles(importFiles: ImportFile[]) {
    importFiles.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      } else if (a.basename < b.basename) {
        return -1;
      } else {
        return 1;
      }
    });

    for (let i = 0; i < importFiles.length; i++) {
      if (importProgress.stopReason) {
        break;
      }
      const importFile = importFiles[i];
      await this.importFile(importFile);
    }
  }

  protected async importFile(importFile: ImportFile) {
    if (importFile.priority < 0) {
      importProgress.fileSkipped(importFile.basename, "取り込み対象のファイル名ではありません");
      return;
    }
    const filepath = importFile.path;
    const basename = importFile.basename;
    importProgress.entryStarted(basename);
    try {
      await yieldToEventLoop();
      await this.importEntry(filepath, basename);
    } catch (e) {
      // 壊れた zip / lzh でジョブ全体を止めず、エラーとして残して次へ進む
      this.logger.error(e.stack || e);
      importProgress.fileFailed(basename, e?.message ?? String(e));
    } finally {
      importProgress.entryProcessed(basename);
    }
  }

  protected async importEntry(filepath: string, basename: string) {
    if (/\.lzh$/i.test(basename)) {
      await this.uncompressLzhFile(filepath);
    } else if (/\.zip$/i.test(basename)) {
      await this.uncompressZipFile(filepath);
    } else if (/\.(txt|kd3)$/i.test(basename)) {
      const entries: Entries = {};
      entries[basename] = filepath;
      const begin = performance.now();
      try {
        await importer.import(entries);
      } finally {
        this.timings.import += performance.now() - begin;
      }
    } else {
      importProgress.fileSkipped(basename, "取り込み対象のファイル形式ではありません");
    }
  }

  protected async uncompressZipFile(zipFile: string) {
    const dataDir = { name: fs.mkdtempSync(path.join(os.tmpdir(), "keiba-")) };
    const begin = performance.now();
    await fs
      .createReadStream(zipFile)
      .pipe(unzipper.Extract({ path: dataDir.name }))
      .promise();
    this.timings.uncompress += performance.now() - begin;
    await this.traverseDataDir(dataDir.name);
  }

  protected async uncompressLzhFile(lzhFile: string) {
    const dataDir = { name: fs.mkdtempSync(path.join(os.tmpdir(), "keiba-")) };
    const begin = performance.now();
    const buf = fs.readFileSync(lzhFile);
    const view = ioutil.toUint8Array(buf);
    const lhaReader = new LhaReader(view);
    for (const key in lhaReader.entries) {
      const header = lhaReader.entries[key];
      const bytes = lhaReader.extractSync(key);
      const buffer = ioutil.toBuffer(bytes);
      const filepath = path.join(dataDir.name, header.filename);
      fs.writeFileSync(filepath, buffer);
    }
    this.timings.uncompress += performance.now() - begin;
    await this.traverseDataDir(dataDir.name);
  }

  protected async traverseDataDir(dataDir: string) {
    const entries: Entries = {};

    for (const basename of fs.readdirSync(dataDir)) {
      if (!basename.startsWith(".")) {
        entries[basename] = path.join(dataDir, basename);
      }
    }

    const begin = performance.now();
    try {
      await importer.import(entries);
    } finally {
      this.timings.import += performance.now() - begin;
      this.rmdir(dataDir);
    }
  }

  protected rmdir(dir: string) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn(error.stack);
    }
  }
}

export const traversal = new Traversal();
