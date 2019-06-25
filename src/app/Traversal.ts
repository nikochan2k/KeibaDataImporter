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
  priority: number;
  path: string;
  basename: string;
}

@Service()
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

  @Inject()
  private importer: Importer;

  constructor() {
    this.logger = getLogger(this);
  }

  public async traverse(entry: string) {
    const checked = this.checkPath(path.join(process.cwd(), entry)) || this.checkPath(entry);
    if (!checked) {
      this.logger.error('"' + entry + '"は対象外です');
    } else if (checked.stat.isDirectory()) {
      await this.traverseDir(checked.entry);
    } else if (checked.stat.isFile()) {
      const importFile = this.createImportFile(checked.entry);
      await this.importFile(importFile);
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
    for (let i = 0; i < Traversal.PRIORITIES.length; i++) {
      const pattern = Traversal.PRIORITIES[i];
      if (pattern.test(type)) {
        return i;
      }
    }
    return -1;
  }

  protected async traverseDir(lzhDir: string) {
    const pattern = path.join(lzhDir, "**/*.*");
    const matches = glob.sync(pattern, { nocase: true });
    const importFiles: ImportFile[] = [];
    for (let i = 0; i < matches.length; i++) {
      const filepath = matches[i];
      const importFile = this.createImportFile(filepath); 
      importFiles.push(importFile);
    }

    await this.importFiles(importFiles);
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
      const importFile = importFiles[i];
      await this.importFile(importFile);
    }
  }

  protected async importFile(importFile: ImportFile) {
    if(importFile.priority < 0){
      return;
    }
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