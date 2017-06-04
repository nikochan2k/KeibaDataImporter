import { exec } from "child_process";
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

  public traverse(dirName: string) {
    const lzhDir = this.checkDir(path.join(process.cwd(), dirName)) || this.checkDir(dirName);
    if (lzhDir) {
      this.traverseLzhDir(lzhDir);
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

  protected traverseLzhDir(lzhDir: string) {
    const pattern = path.join(lzhDir, "**/*.lzh");
    glob(pattern, (err, matches) => {
      if (err) {
        this.logger.warn(err.message, err);
        return;
      }

      matches.forEach((lzhFile) => {
        this.uncompressLzhFile(lzhFile);
      });
    });
  }

  protected uncompressLzhFile(lzhFile: string) {
    tmp.dir((err, dataDir) => {
      if (err) {
        this.logger.warn(err.stack || err);
        return;
      }
      const cmd = 'lha xw="' + dataDir + '" "' + lzhFile + '"';
      exec(cmd, async (error, stdout, stderr) => {
        if (error || stderr) {
          if (error) this.logger.warn(error.stack);
          if (stderr) this.logger.warn(stderr);
          else if (stdout) this.logger.warn(stdout);
          this.rmdir(dataDir);
        } else {
          this.traverseDataDir(dataDir);
        }
      });
    });
  }

  protected traverseDataDir(dataDir: string) {
    const entries: Entries = {};

    const pattern = path.join(dataDir, "*");
    glob(pattern, async (err, matches) => {
      if (err) {
        this.logger.warn(err.stack);
        return;
      }

      matches.forEach((dataFile) => {
        const basename = path.basename(dataFile);
        entries[basename] = dataFile;
      });

      try {
        await this.importer.import(entries);
      } finally {
        this.rmdir(dataDir);
      }
    });
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