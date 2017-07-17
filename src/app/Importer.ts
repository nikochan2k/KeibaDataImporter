import * as fs from "fs";
import { Logger } from "log4js";
import { Container, Service } from "typedi";
import { getLogger } from "./LogUtil";
import { DataToImport } from "./reader/DataToImport";
import { KolDen1Kd3 } from "./reader/KOL/KD3/KolDen1Kd3";
import { KolDen2Kd3 } from "./reader/KOL/KD3/KolDen2Kd3";
import { KolSei1Kd3 } from "./reader/KOL/KD3/KolSei1Kd3";
import { KolSei2Kd3 } from "./reader/KOL/KD3/KolSei2Kd3";
import { KolSei3Kd3 } from "./reader/KOL/KD3/KolSei3Kd3";
import { KolKodKd3 } from "./reader/KOL/KD3/KolKodKd3";
import { KolKod2Kd3 } from "./reader/KOL/KD3/KolKod2Kd3";
import { KolKod3Kd3 } from "./reader/KOL/KD3/KolKod3Kd3";
import { KolUmaKd3 } from "./reader/KOL/KD3/KolUmaKd3";
import { Sra } from "./reader/JRDB/Sra";
import { Srb } from "./reader/JRDB/Srb";
import { Bridge } from "./reader/Bridge";

export interface Entries {
  [basename: string]: string;
}

interface Reader {
  pattern: RegExp;
  dataToImport: DataToImport;
}

@Service()
export class Importer {

  private logger: Logger;

  private readers: Reader[];

  constructor() {
    this.logger = getLogger(this);
    this.readers = [
      // KOL3
      { pattern: /kol_uma.kd3/, dataToImport: Container.get(KolUmaKd3) },
      { pattern: /kol_den1.kd3/, dataToImport: Container.get(KolDen1Kd3) },
      { pattern: /kol_den2.kd3/, dataToImport: Container.get(KolDen2Kd3) },
      { pattern: /kol_kod.kd3/, dataToImport: Container.get(KolKodKd3) },
      { pattern: /kol_kod2.kd3/, dataToImport: Container.get(KolKod2Kd3) },
      { pattern: /kol_kod3.kd3/, dataToImport: Container.get(KolKod3Kd3) },
      { pattern: /kol_sei1.kd3/, dataToImport: Container.get(KolSei1Kd3) },
      { pattern: /kol_sei2.kd3/, dataToImport: Container.get(KolSei2Kd3) },
      { pattern: /kol_sei3.kd3/, dataToImport: Container.get(KolSei3Kd3) },
      // JRDB
      { pattern: /sra\d+\.txt$/i, dataToImport: Container.get(Sra) },
      { pattern: /srb\d+\.txt$/i, dataToImport: Container.get(Srb) },
    ];
  }

  protected find(entries: Entries, reader: Reader) {
    const basenames = Object.keys(entries);
    for (let i = 0; i <= basenames.length; i++) {
      const basename = basenames[i];
      if (reader.pattern.test(basename)) {
        return { basename: basename, dataToImport: reader.dataToImport };
      }
    }
    return null;
  }

  public async import(entries: Entries) {
    const bridge: Bridge = { basename: null };
    for (let i = 0; i < this.readers.length; i++) {
      const reader = this.readers[i];
      const entry = this.find(entries, reader);
      if (!entry) {
        continue;
      }
      bridge.basename = entry.basename;
      const dataFile = entries[entry.basename];
      const dataToImport = entry.dataToImport;
      let fd: number;
      try {
        fd = fs.openSync(dataFile, "r");
        if (this.logger.isDebugEnabled) {
          this.logger.debug('"' + entry.basename + '"を取り込んでいます');
        }
        await dataToImport.readAll(fd, bridge);
      } catch (e) {
        this.logger.error(e.stack || e);
      }
      finally {
        fs.closeSync(fd);
      }
    }
  }
}
