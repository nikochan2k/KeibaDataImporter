import * as path from "path";
import * as process from "process";
import * as fs from "fs";
import * as glob from "glob";
import * as tmp from "tmp";
import * as rimraf from "rimraf";
import { exec } from "child_process";
import { Container } from "typedi";
import { createConnection, useContainer } from "typeorm";
import { getLogger, logging } from "./LogUtil";
import { Entries, Importer } from "./Importer";

const logger = getLogger("app");

let arg = "";
if (3 <= process.argv.length) {
  arg = process.argv[2];
}

let importer: Importer;
buildConnection().then(() => {
  importer = Container.get(Importer);

  const lzhDir = checkDir(path.join(process.cwd(), arg)) || checkDir(arg);
  if (lzhDir) {
    traverseLzhDir(lzhDir);
  } else {
    logger.error('"' + lzhDir + '" is not a directory.');
  }
});

async function buildConnection() {
  useContainer(Container);
  const con = await createConnection({
    driver: {
      type: "sqlite",
      storage: "test.sqlite"
    },
    entities: [
      __dirname + "/entities/*.js"
    ],
    logging: logging,
    autoSchemaSync: false
  });

  try {
    await con.syncSchema(false);
  } catch (e) {
    logger.warn(e.stack || e);
  }
}

function checkDir(lzhDir: string): string {
  try {
    if (fs.statSync(lzhDir).isDirectory()) {
      return lzhDir;
    } else {
      logger.debug(lzhDir + " is not a directory.");
    }
  } catch (e) {
    logger.debug(e.stack || e);
  }
  return null;
}

function traverseLzhDir(lzhDir: string) {
  const pattern = path.join(lzhDir, "**/*.lzh");
  glob(pattern, (err, matches) => {
    if (err) {
      logger.warn(err.message, err);
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
      logger.warn(err.stack || err);
      return;
    }
    const cmd = 'lha xw="' + dataDir + '" "' + lzhFile + '"';
    exec(cmd, async (error, stdout, stderr) => {
      if (error || stderr) {
        if (error) logger.warn(error.stack);
        if (stderr) logger.warn(stderr);
        else if (stdout) logger.warn(stdout);
        rmdir(dataDir);
      } else {
        traverseDataDir(dataDir);
      }
    });
  });
}

function traverseDataDir(dataDir: string) {
  const entries: Entries = {};

  const pattern = path.join(dataDir, "*");
  glob(pattern, async (err, matches) => {
    if (err) {
      logger.warn(err.stack);
      return;
    }

    matches.forEach((dataFile) => {
      const basename = path.basename(dataFile);
      entries[basename] = dataFile;
    });

    try {
      await importer.import(entries);
    } finally {
      rmdir(dataDir);
    }
  });
}

function rmdir(dir: string) {
  rimraf(dir, (error) => {
    if (error) {
      logger.warn(error.stack);
    } else {
      logger.debug('"' + dir + '" was deleted');
    }
  });
}