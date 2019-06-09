import * as fs from "fs";
import * as glob from "glob";
import { Logger } from "log4js";
import * as path from "path";
import * as process from "process";
import "reflect-metadata";
import * as rimraf from "rimraf";
import * as tmp from "tmp";
import { Inject, Service } from "typedi";
import * as unzipper from "unzipper";
import { Entries, Importer } from "./Importer";
import { getLogger } from "./LogUtil";
import * as ioutil from "./util/IOUtil";
import { LhaReader } from "./util/LHA";

interface ImportFile {
  key: number;
  path: string;
  basename: string;
}

interface FileInfo {
  pattern: RegExp;
  priority: number;
}

@Service()
export class Traversal {

  private logger: Logger;

  @Inject()
  private importer: Importer;

  private fileInfos: FileInfo[] = [
    // KD3厩舎データ
    { pattern: /ekyu.*\.lzh$/i, priority: 1 },
    { pattern: /kol_kyu.kd3$/, priority: 2 },
    // JRDB調教師データ
    { pattern: /c[zs]a.*\.txt$/i, priority: 3 },
    // KD3 騎手
    { pattern: /dkis.*\.lzh$/i, priority: 4 },
    // KD3騎手データ
    { pattern: /kol_kis.kd3$/, priority: 5 },
    // JRDB騎手データ
    { pattern: /kza.*\.txt$/i, priority: 6 },
    { pattern: /ksa.*\.txt$/i, priority: 7 },
    // KD3種牡馬データ
    { pattern: /gsyu.*\.lzh$/i, priority: 8 },
    { pattern: /kol_syu.kd3$/, priority: 9 },
    // KD3 3代血統図
    { pattern: /fket.*\.lzh$/i, priority: 10 },
    { pattern: /kol_ket.kd3$/, priority: 11 },
    // KD3 5代血統図
    { pattern: /fket5.*\.lzh$/i, priority: 12 },
    { pattern: /kol_ket5.kd3$/, priority: 13 },
    // KD3 出馬表＋馬（１日）
    { pattern: /hb.*\.lzh$/i, priority: 14 },
    // KD3 日曜重賞付出馬表＋馬（１日）
    { pattern: /hz.*\.lzh$/i, priority: 15 },
    // KD3競走馬データ
    { pattern: /kol_uma.kd3$/, priority: 16 },
    // JRDB馬基本データ
    { pattern: /ukc.*\.txt$/i, priority: 17 },
    // KD3出走馬レースデータ
    { pattern: /kol_den1.kd3$/, priority: 18 },
    // JRDB開催データ
    { pattern: /ka[ab].*\.txt$/i, priority: 19 },
    // JRDB番組データ
    { pattern: /ba[bc].*\.txt$/i, priority: 20 },
    // JRDB前走データ
    { pattern: /zec.*\.txt$/i, priority: 21 },
    // JRDB前走拡張データ
    { pattern: /zkb.*\.txt$/i, priority: 22 },
    // KOL出馬表出走馬データ
    { pattern: /kol_den2.kd3$/, priority: 23 },
    // KD3 コメントデータ（出馬用）
    { pattern: /mb.*\.lzh$/i, priority: 24 },
    // JRDB競走馬データ
    { pattern: /ky[ghi].*\.txt$/i, priority: 25 },
    // JRDB競走馬拡張データ
    { pattern: /kka.*\.txt$/i, priority: 26 },
    // JRDB情報データ
    { pattern: /joa.*\.txt$/i, priority: 27 },
    // JRDB調教分析データ
    { pattern: /cy[ab].*\.txt$/i, priority: 28 },
    // JRDB調教本追切データ
    { pattern: /cha.*\.txt$/i, priority: 29 },
    // JRDB直前情報データ
    { pattern: /tyb.*\.txt$/i, priority: 30 },
    // KD3 予想（前売り）オッズ（１日）
    { pattern: /jb.*\.lzh$/i, priority: 31 },
    // KOL予想オッズ（単勝・枠連・馬連）
    { pattern: /kol_ods.kd3$/, priority: 32 },
    // KOL予想オッズ２（馬単・３連複）
    { pattern: /kol_ods2.kd3$/, priority: 33 },
    // JRDB基準オッズデータ
    { pattern: /oz.*\.txt$/i, priority: 34 },
    // JRDBワイド基準オッズデータ
    { pattern: /ow.*\.txt$/i, priority: 35 },
    // JRDB馬単基準オッズデータ
    { pattern: /ou.*\.txt$/i, priority: 36 },
    // 3連複基準オッズデータ
    { pattern: /ot.*\.txt$/i, priority: 37 },
    // 3連単基準オッズデータ
    { pattern: /ov.*\.txt$/i, priority: 38 },
    // KD3 成績＋馬（１日）
    { pattern: /ib.*\.lzh$/i, priority: 39 },
    // KD3競走成績レースデータ
    { pattern: /kol_sei1.kd3$/, priority: 40 },
    // JRDB成績レースデータ
    { pattern: /sr[ab].*\.txt$/i, priority: 41 },
    // KD3競走成績出走馬データ
    { pattern: /kol_sei2.kd3$/, priority: 42 },
    // JRDB成績データ
    { pattern: /se[cd].*\.txt$/i, priority: 43 },
    // KD3制裁その他データ
    { pattern: /kol_sei3.kd3$/, priority: 44 },
    // JRDB成績拡張データ
    { pattern: /skb.*\.txt$/i, priority: 45 },
    // JRDB払戻情報データ
    { pattern: /hj[ac].*\.txt$/i, priority: 46 },
    // KD3 コメントデータ（成績用）
    { pattern: /lb.*\.lzh$/i, priority: 47 },
    // KD3騎手厩舎コメント／次走へのメモ
    { pattern: /kol_com1.kd3$/, priority: 48 },
    // KD3 確定オッズ（１日）
    { pattern: /kd.*\.lzh$/i, priority: 49 },
    // KD3確定オッズ（単勝・枠連・馬連）
    { pattern: /kol_kod.kd3$/, priority: 50 },
    // KD3確定オッズ（複勝・ワイド・馬単・３連複）
    { pattern: /kol_kod2.kd3$/, priority: 51 },
    // KD3確定オッズ３（３連単）
    { pattern: /kol_kod3.kd3$/, priority: 52 },
    // 圧縮ファイル
    { pattern: /\.(lzh|zip)$/i, priority: 99 },
  ];

  constructor() {
    this.logger = getLogger(this);
  }

  public async traverse(entry: string) {
    const checked = this.checkPath(path.join(process.cwd(), entry)) || this.checkPath(entry);
    if (!checked) {
      this.logger.error('"' + entry + '"は対象外です');
    } else if (checked.stat.isDirectory()) {
      await this.traverseLzhDir(checked.entry);
    } else if (checked.stat.isFile() && /.lzh$/i.test(checked.entry)) {
      await this.uncompressLzhFile(checked.entry);
    } else {
      this.logger.error('"' + entry + '"は対象外です');
    }
  }

  protected checkPath(entry: string) {
    try {
      return { stat: fs.statSync(entry), entry: entry };
    } catch (e) {
      return null;
    }
  }

  protected getPriority(type: string) {
    for (let i = 0; i < this.fileInfos.length; i++) {
      const fileInfo = this.fileInfos[i];
      if (fileInfo.pattern.test(type)) {
        return fileInfo.priority;
      }
    }
    return 0;
  }

  protected async traverseLzhDir(lzhDir: string) {
    const pattern = path.join(lzhDir, "**/*.*");
    const matches = glob.sync(pattern, { nocase: true });
    const importFiles: ImportFile[] = [];
    for (let i = 0; i < matches.length; i++) {
      const filepath = matches[i];
      const basename = path.basename(filepath);
      const priority = this.getPriority(basename);
      const execed = /(^|\D)(\d{2})(\d{2})(\d{2})\D/i.exec(basename);
      let importFile: ImportFile;
      if (execed) {
        const yy = parseInt(execed[2]);
        let yyyy: number;
        if (70 <= yy) {
          yyyy = 1900 + yy;
        } else {
          yyyy = 2000 + yy;
        }
        const mm = parseInt(execed[3]);
        const dd = parseInt(execed[4]);
        const key = yyyy * 1000000 + mm * 10000 + dd * 100 + priority;
        importFile = { key: key, path: filepath, basename: basename };
      } else {
        importFile = { key: priority, path: filepath, basename: basename };
      }
      importFiles.push(importFile);
    }

    importFiles.sort((a, b) => {
      if (a.key !== b.key) {
        return a.key - b.key;
      } else if (a.basename < b.basename) {
        return -1;
      } else {
        return 1;
      }
    });

    for (let i = 0; i < importFiles.length; i++) {
      const importFile = importFiles[i];
      const filepath = importFile.path;
      const basename = importFile.basename;
      if (this.logger.isLevelEnabled("info")) {
        this.logger.info('"' + basename + '"を解凍しています。');
      }
      if (/\.lzh$/i.test(basename)) {
        await this.uncompressLzhFile(importFile.path);
      } else if (/\.zip$/i.test(basename)) {
        await this.uncompressZipFile(importFile.path);
      } else if (/\.(txt|kd3)$/i.test(basename)) {
        const entries: Entries = {};
        entries[basename] = filepath;
        await this.importer.import(entries);
      } else {
        if (this.logger.isLevelEnabled("info")) {
          this.logger.info('"' + basename + '"は取り込み対象ファイルではありません。');
        }
      }
    }
  }

  protected async uncompressZipFile(zipFile: string) {
    const dataDir = tmp.dirSync();
    await fs.createReadStream(zipFile)
      .pipe(unzipper.Extract({ path: dataDir.name }))
      .promise();
    await this.traverseDataDir(dataDir.name);
  }

  protected async uncompressLzhFile(lzhFile: string) {
    const dataDir = tmp.dirSync();
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
    await this.traverseDataDir(dataDir.name);
  }

  protected async traverseDataDir(dataDir: string) {
    const entries: Entries = {};

    const pattern = path.join(dataDir, "*");
    const pathes = glob.sync(pattern);
    pathes.forEach((dataFile) => {
      const basename = path.basename(dataFile);
      entries[basename] = dataFile;
    });

    try {
      await this.importer.import(entries);
    } finally {
      this.rmdir(dataDir);
    }
  }

  protected rmdir(dir: string) {
    rimraf(dir, (error) => {
      if (error) {
        this.logger.warn(error.stack);
      }
    });
  }
}