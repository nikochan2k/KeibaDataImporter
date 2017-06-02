import "reflect-metadata";
import * as fs from "fs";
import { Service, Container } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager} from "typeorm-typedi-extensions";
import { Logger } from "log4js";
import { getLogger } from "./LogUtil";
import { DataToImport } from "./reader/DataToImport";
import { KolUmaKd3 } from "./reader/KOL/KD3/KolUmaKd3";
import { KolSei1Kd3 } from "./reader/KOL/KD3/KolSei1Kd3";
import { KolSei2Kd3 } from "./reader/KOL/KD3/KolSei2Kd3";

export interface Entries {
  [basename: string]: string;
}

interface Readers {
  [basename: string]: () => DataToImport;
}

const readers: Readers = {
  "kol_uma.kd3": () => Container.get(KolUmaKd3),
  "kol_den1.kd3": null,
  "kol_den2.kd3": null,
  "kol_sei1.kd3": () => Container.get(KolSei1Kd3),
  "kol_sei2.kd3": () => Container.get(KolSei2Kd3),
  "kol_sei3.kd3": null,
};

@Service()
export class Importer {

  logger: Logger;

  @OrmEntityManager()
  entityManager: EntityManager;

  constructor() {
    this.logger = getLogger(this);
  }

  public async import(entries: Entries) {
    await this.entityManager.transaction(async () => {
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
          const reader = createReader();
          await reader.readAll(fd);
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
