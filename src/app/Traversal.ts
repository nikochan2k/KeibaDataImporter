import { execSync } from "child_process";
import * as fs from "fs";
import * as glob from "glob";
import { Logger } from "log4js";
import * as path from "path";
import * as process from "process";
import "reflect-metadata";
import * as rimraf from "rimraf";
import * as tmp from "tmp";
import { Service, Inject } from "typedi";
import { Entries, Importer } from "./Importer";
import { getLogger } from "./LogUtil";

interface ImportFile {
  key: number;
  path: string;
}

@Service()
export class Traversal {

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

  protected async traverseLzhDir(lzhDir: string) {
    const pattern = path.join(lzhDir, "**/*.lzh");
    const matches = glob.sync(pattern, { nocase: true });
    const importFiles: ImportFile[] = [];
    for (let i = 0; i < matches.length; i++) {
      const lzhFile = matches[i];
      const basename = path.basename(lzhFile);
      const execed = /(\w{2})(\d{2})(\d{2})(\d{2})\.lzh/i.exec(basename);
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
        let no: number;
        if (/dkis/i.test(type)) {
          no = 1;
        } else if (/ekyu/i.test(type)) {
          no = 2;
        } else if (/fket/i.test(type)) {
          no = 3;
        } else if (/gsyu/i.test(type)) {
          no = 4;
        } else if (/hb/i.test(type)) {
          no = 5;
        } else if (/hz/i.test(type)) {
          no = 6;
        } else if (/mb/i.test(type)) {
          no = 7;
        } else if (/jb/i.test(type)) {
          no = 8;
        } else if (/kd/i.test(type)) {
          no = 9;
        } else if (/ib/i.test(type)) {
          no = 10;
        } else if (/lb/i.test(type)) {
          no = 11;
        } else {
          no = 0;
        }
        const key = yyyy * 1000000 + mm * 10000 + dd * 100 + no;
        importFiles.push({ key: key, path: lzhFile });
      } else {
        importFiles.push({ key: 0, path: lzhFile });
      }
    }

    importFiles.sort((a, b) => {
      return a.key - b.key;
    });

    for (let i = 0; i < importFiles.length; i++) {
      const importFile = importFiles[i];
      if (this.logger.isInfoEnabled) {
        const basename = path.basename(importFile.path);
        this.logger.info('"' + basename + '"を取り込んでいます');
      }
      await this.uncompressLzhFile(importFile.path);
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