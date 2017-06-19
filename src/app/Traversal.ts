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

@Service()
export class Traversal {

  private logger: Logger;

  @Inject()
  private importer: Importer;

  constructor() {
    this.logger = getLogger(this);
  }

  public async traverse(dirName: string) {
    const lzhDir = this.checkDir(path.join(process.cwd(), dirName)) || this.checkDir(dirName);
    if (lzhDir) {
      await this.traverseLzhDir(lzhDir);
    } else {
      this.logger.error('"' + lzhDir + '" is not a directory.');
    }
  }

  protected checkDir(lzhDir: string): string {
    try {
      if (fs.statSync(lzhDir).isDirectory()) {
        return lzhDir;
      } else {
        this.logger.debug(lzhDir + " is not a directory.");
      }
    } catch (e) {
      this.logger.debug(e.stack || e);
    }
    return null;
  }

  protected async traverseLzhDir(lzhDir: string) {
    const pattern = path.join(lzhDir, "**/*.lzh");
    const matches = glob.sync(pattern);
    for (let i = 0; i < matches.length; i++) {
      const lzhFile = matches[i];
      await this.uncompressLzhFile(lzhFile);
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
      } else {
        this.logger.debug('"' + dir + '" was deleted');
      }
    });
  }
}