import "reflect-metadata";
import { createConnection, Connection, EntityManager } from "typeorm";
import { Logger, getLogger } from "log4js";
import * as fs from "fs";
import { LOG_LEVEL, logging } from "./Constant";
import { DataReader } from "./reader/DataReader";
import { KolSei1Kd3 } from "./reader/KOL/KD3/KolSei1Kd3";
import { KolSei2Kd3 } from "./reader/KOL/KD3/KolSei2Kd3";

export interface Entries {
  [basename: string]: string;
}

interface Readers {
  [basename: string]: (entityManager: EntityManager, fd: number) => DataReader;
}

const readers: Readers = {
  "kol_uma.kd3": null,
  "kol_den1.kd3": null,
  "kol_den2.kd3": null,
  "kol_sei1.kd3": (entityManager: EntityManager, fd: number) => new KolSei1Kd3(entityManager, fd),
  "kol_sei2.kd3": (entityManager: EntityManager, fd: number) => new KolSei2Kd3(entityManager, fd),
  "kol_sei3.kd3": null,
};

export class Importer {

  private logger: Logger;
  private con: Connection;

  constructor() {
    this.constructLogger();
  }

  protected constructLogger() {
    this.logger = getLogger("import");
    this.logger.setLevel(LOG_LEVEL);
  }

  protected async constructConection() {
    if (!this.con) {
      this.con = await createConnection({
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
        await this.con.syncSchema(false);
      } catch (e) {
        this.logger.warn(e.stack || e);
      }
    }

    return this.con.createEntityManagerWithSingleDatabaseConnection();
  }

  public async import(entries: Entries) {
    const em = await this.constructConection();

    await em.transaction(async (entityManager) => {
      for (const basename in readers) {
        const dataFile = entries[basename];
        if (!dataFile) {
          continue;
        }
        const createReader = readers[basename];
        if (!createReader) {
          this.logger.debug('"' + basename + '" is not suppoted.');
          continue;
        }
        this.logger.debug('Reading "' + dataFile + "'");
        let fd: number;
        try {
          fd = fs.openSync(dataFile, "r");
          const reader = createReader(entityManager, fd);
          await reader.readAll();
        } catch (e) {
          this.logger.error(e.stack || e);
        }
        finally {
          fs.closeSync(fd);
        }
      }
    });
  }
}
