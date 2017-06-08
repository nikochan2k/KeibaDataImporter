import * as fs from "fs";
import { Logger } from "log4js";
import { Container, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { getLogger } from "./LogUtil";
import { DataToImport } from "./reader/DataToImport";
import { KolSei1Kd3 } from "./reader/KOL/KD3/KolSei1Kd3";
import { KolSei2Kd3 } from "./reader/KOL/KD3/KolSei2Kd3";
import { KolUmaKd3 } from "./reader/KOL/KD3/KolUmaKd3";
import { DataCache } from "./reader/DataCache";

export interface Entries {
  [basename: string]: string;
}

interface Readers {
  [basename: string]: DataToImport;
}

@Service()
export class Importer {

  private logger: Logger;

  @OrmEntityManager()
  private entityManager: EntityManager;

  private readers: Readers;

  constructor() {
    this.logger = getLogger(this);
    this.readers = {
      "kol_uma.kd3": Container.get(KolUmaKd3),
      "kol_den1.kd3": null,
      "kol_den2.kd3": null,
      "kol_sei1.kd3": Container.get(KolSei1Kd3),
      "kol_sei2.kd3": Container.get(KolSei2Kd3),
      "kol_sei3.kd3": null,
    };
  }

  public async import(entries: Entries) {
    await this.entityManager.query("PRAGMA journal_mode = WAL");
    await this.entityManager.transaction(async () => {
      const cache = new DataCache();
      for (const basename in this.readers) {
        const dataFile = entries[basename];
        if (!dataFile) {
          continue;
        }
        const dataToImport = this.readers[basename];
        if (!dataToImport) {
          this.logger.debug('"' + basename + '" is not suppoted.');
          continue;
        }
        this.logger.debug('Reading "' + dataFile + "'");
        let fd: number;
        try {
          fd = fs.openSync(dataFile, "r");
          await dataToImport.readAll(fd, cache);
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
