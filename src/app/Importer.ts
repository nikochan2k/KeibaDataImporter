import * as fs from "fs";
import { Logger } from "log4js";
import { Container, Service } from "typedi";
import { getLogger } from "./LogUtil";
import { Bridge } from "./reader/Bridge";
import { DataToImport } from "./reader/DataToImport";
import { Bab } from "./reader/JRDB/Bab";
import { Bac } from "./reader/JRDB/Bac";
import { Cha } from "./reader/JRDB/Cha";
import { Cya } from "./reader/JRDB/Cya";
import { Cyb } from "./reader/JRDB/Cyb";
import { Joa } from "./reader/JRDB/Joa";
import { Kaa } from "./reader/JRDB/Kaa";
import { Kab } from "./reader/JRDB/Kab";
import { Kyg } from "./reader/JRDB/Kyg";
import { Kyh } from "./reader/JRDB/Kyh";
import { Kyi } from "./reader/JRDB/Kyi";
import { Sra } from "./reader/JRDB/Sra";
import { Srb } from "./reader/JRDB/Srb";
import { Ukc } from "./reader/JRDB/Ukc";
import { KolDen1Kd3 } from "./reader/KOL/KD3/KolDen1Kd3";
import { KolDen2Kd3 } from "./reader/KOL/KD3/KolDen2Kd3";
import { KolKod2Kd3 } from "./reader/KOL/KD3/KolKod2Kd3";
import { KolKod3Kd3 } from "./reader/KOL/KD3/KolKod3Kd3";
import { KolKodKd3 } from "./reader/KOL/KD3/KolKodKd3";
import { KolSei1Kd3 } from "./reader/KOL/KD3/KolSei1Kd3";
import { KolSei2Kd3 } from "./reader/KOL/KD3/KolSei2Kd3";
import { KolSei3Kd3 } from "./reader/KOL/KD3/KolSei3Kd3";
import { KolUmaKd3 } from "./reader/KOL/KD3/KolUmaKd3";
import { C$a } from "./reader/JRDB/C$a";
import { K$a } from "./reader/JRDB/K$a";

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
      // KD3 厩舎データ
      // kol_kyu.kd3
      // JRDB 調教師データ
      { pattern: /c[zs]a\d+\.txt$/i, dataToImport: Container.get(C$a) },
      // KD3 騎手データ
      // kol_kis.kd3
      // JRDB 騎手データ
      { pattern: /k[zs]a\d+\.txt$/i, dataToImport: Container.get(K$a) },
      // KD3 種牡馬データ
      // kol_syu.kd3
      // KD3 競走馬データ
      { pattern: /kol_uma.kd3/, dataToImport: Container.get(KolUmaKd3) },
      // JRDB 馬基本データ
      { pattern: /ukc\d+\.txt$/i, dataToImport: Container.get(Ukc) },
      // KD3 3代血統図
      // kol_ket.kd3
      // KD3 5代血統図
      // kol_ket5.kd3
      // KD3 出走馬レースデータ
      { pattern: /kol_den1.kd3/, dataToImport: Container.get(KolDen1Kd3) },
      // KD3 特別登録レースデータ
      // kol_tok1.kd3
      // JRDB 開催データ
      { pattern: /kaa\d+\.txt$/i, dataToImport: Container.get(Kaa) },
      { pattern: /kab\d+\.txt$/i, dataToImport: Container.get(Kab) },
      // JRDB 番組データ
      { pattern: /bab\d+\.txt$/i, dataToImport: Container.get(Bab) },
      { pattern: /bac\d+\.txt$/i, dataToImport: Container.get(Bac) },
      // JRDB 前走データ
      // zec
      // JRDB 前走拡張データ
      // zkb
      // KD3 出馬表出走馬データ
      { pattern: /kol_den2.kd3/, dataToImport: Container.get(KolDen2Kd3) },
      // KD3 特別登録出走予定馬データ
      // kol_tok2.kd3
      // JRDB 競走馬データ
      { pattern: /kyg\d+\.txt$/i, dataToImport: Container.get(Kyg) },
      { pattern: /kyh\d+\.txt$/i, dataToImport: Container.get(Kyh) },
      { pattern: /kyi\d+\.txt$/i, dataToImport: Container.get(Kyi) },
      // JRDB 情報データ
      { pattern: /joa\d+\.txt$/i, dataToImport: Container.get(Joa) },
      // JRDB 調教分析データ
      { pattern: /cya\d+\.txt$/i, dataToImport: Container.get(Cya) },
      { pattern: /cyb\d+\.txt$/i, dataToImport: Container.get(Cyb) },
      // JRDB 調教本追切データ
      { pattern: /cha\d+\.txt$/i, dataToImport: Container.get(Cha) },
      // JRDB 直前情報データ
      // tyb
      // KD3 予想オッズ（単勝・枠連・馬連）
      // kol_ods.kd3
      // KD3 予想オッズ２（馬単・３連複）
      // kol_ods2.kd3
      // JRDB 基準オッズデータ
      // oz
      // JRDB ワイド基準オッズデータ
      // ow
      // JRDB 馬単基準オッズデータ
      // ou
      // JRDB 3連複基準オッズデータ
      // ot
      // JRDB 3連単基準オッズデータ
      // ov
      // KD3 競走成績レースデータ
      { pattern: /kol_sei1.kd3/, dataToImport: Container.get(KolSei1Kd3) },
      // JRDB 成績レースデータ
      { pattern: /sra\d+\.txt$/i, dataToImport: Container.get(Sra) },
      { pattern: /srb\d+\.txt$/i, dataToImport: Container.get(Srb) },
      // KD3 競走成績出走馬データ
      { pattern: /kol_sei2.kd3/, dataToImport: Container.get(KolSei2Kd3) },
      // JRDB 成績データ
      // sec
      // sed
      // KD3 制裁その他データ
      { pattern: /kol_sei3.kd3/, dataToImport: Container.get(KolSei3Kd3) },
      // JRDB 成績拡張データ
      // skb
      // JRDB 払戻情報データ
      // hja
      // hjc
      // KD3 騎手厩舎コメント／次走へのメモ
      // kol_com1.kd3
      // KD3 確定オッズ（単勝・枠連・馬連）
      { pattern: /kol_kod.kd3/, dataToImport: Container.get(KolKodKd3) },
      // KD3 確定オッズ（複勝・ワイド・馬単・３連複）
      { pattern: /kol_kod2.kd3/, dataToImport: Container.get(KolKod2Kd3) },
      // KD3 確定オッズ３（３連単）
      { pattern: /kol_kod3.kd3/, dataToImport: Container.get(KolKod3Kd3) },
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
