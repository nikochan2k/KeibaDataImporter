import { execSync } from "child_process";
import * as fs from "fs";
import * as glob from "glob";
import { Logger } from "log4js";
import * as path from "path";
import * as process from "process";
import "reflect-metadata";
import * as rimraf from "rimraf";
import * as tmp from "tmp";
import { Inject, Service } from "typedi";
import { Entries, Importer } from "./Importer";
import { getLogger } from "./LogUtil";

interface ImportFile {
  key: number;
  path: string;
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
    // KOL3
    { pattern: /dkis/, priority: 1 },
    { pattern: /ekyu/, priority: 2 },
    { pattern: /fket/, priority: 3 },
    { pattern: /gsyu/, priority: 4 },
    { pattern: /hb/, priority: 5 },
    { pattern: /hz/, priority: 6 },
    { pattern: /mb/, priority: 7 },
    { pattern: /jb/, priority: 8 },
    { pattern: /kd/, priority: 9 },
    { pattern: /ib/, priority: 10 },
    { pattern: /lb/, priority: 11 },
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

  protected getFileInfo(type: string) {
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
      const execed = /(\D+)(\d{2})(\d{2})(\d{2})\.([^.]+)$/i.exec(basename);
      if (execed) {
        const type = execed[1];
        const yy = parseInt(execed[2]);
        let yyyy: number;
        if (70 <= yy) {
          yyyy = 1900 + yy;
        } else {
          yyyy = 2000 + yy;
        }
        const mm = parseInt(execed[3]);
        const dd = parseInt(execed[4]);
        const priority = this.getFileInfo(type);
        const key = yyyy * 1000000 + mm * 10000 + dd * 100 + priority;
        importFiles.push({ key: key, path: filepath });
      } else {
        importFiles.push({ key: 0, path: filepath });
      }
    }

    importFiles.sort((a, b) => {
      return a.key - b.key;
    });

    for (let i = 0; i < importFiles.length; i++) {
      const importFile = importFiles[i];
      const filepath = importFile.path;
      const basename = path.basename(filepath);
      if (this.logger.isInfoEnabled) {
        this.logger.info('"' + basename + '"を取り込んでいます');
      }
      if (/\.lzh$/.test(basename)) {
        await this.uncompressLzhFile(importFile.path);
      } else if (/\.(txt|kd3)$/.test(basename)) {
        const entries: Entries = {};
        entries[basename] = filepath;
        await this.importer.import(entries);
      } else {
        if (this.logger.isInfoEnabled) {
          this.logger.info('"' + basename + '"は取り込み対象ファイルではありません。');
        }
      }
    }
  }

  protected async uncompressLzhFile(lzhFile: string) {
    const dataDir = tmp.dirSync();
    const cmd = 'lha xw="' + dataDir.name + '" "' + lzhFile + '"';
    execSync(cmd);
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