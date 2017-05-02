import * as path from "path";
import * as process from "process";
import * as fs from "fs";
import * as glob from "glob";
import * as tmp from "tmp";
import * as rimraf from "rimraf";
import * as log4js from "log4js";
import { exec } from "child_process";
import {Constant} from "./Constant";
import {Importer} from "./Importer"

const log = log4js.getLogger("app");
log.setLevel(Constant.LOG_LEVEL);

let arg = "";
if (3 <= process.argv.length) {
  arg = process.argv[2];
}

const importer = new Importer();

const lzhDir = checkDir(path.join(process.cwd(), arg)) || checkDir(arg);
if (lzhDir) {
  traverseLzhDir(lzhDir)
} else {
  log.error('"' + lzhDir + '" is not a directory.');
}

function checkDir(lzhDir: string): string {
  try {
    if (fs.statSync(lzhDir).isDirectory()) {
      return lzhDir;
    } else {
      log.debug(lzhDir + " is not a directory.")
    }
  } catch (e) {
    log.debug(e)
  }
  return null;
}

function traverseLzhDir(lzhDir: string) {
  const pattern = path.join(lzhDir, "**/*.lzh");
  glob(pattern, (err, matches) => {
    if (err) {
      log.warn(err.message);
      return;
    }

    matches.forEach((lzhFile) => {
      uncompressLzhFile(lzhFile);
    });
  });
}

function uncompressLzhFile(lzhFile: string) {
  tmp.dir((err, dataDir) => {
    if (err) {
      log.warn(err);
      return;
    }
    const cmd = 'lha xw="' + dataDir + '" "' + lzhFile + '"';
    exec(cmd, (error, stdout, stderr) => {
      if (error || stderr) {
        if (error) log.warn(error.message);
        if (stderr) log.warn(stderr)
        else if (stdout) log.warn(stdout);
        rmdir(dataDir);
      } else {
        traverseDataDir(dataDir)
      }
    });
  });
}

function traverseDataDir(dataDir: string) {
  const pattern = path.join(dataDir, "*");
  glob(pattern, (err, matches) => {
    try {
      if (err) {
        log.warn(err.message);
        return;
      }

      matches.sort().forEach((dataFile) => {
        importer.importDataFile(dataFile);
      });
    } finally {
      rmdir(dataDir);
    }
  });
}

function rmdir(dir: string) {
  rimraf(dir, (error) => {
    if (error) {
      log.warn(error.message);
    } else {
      log.debug('"' + dir + '" was deleted');
    }
  })
}