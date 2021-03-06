import * as fs from "fs";
import { Logger } from "log4js";
import { Container, Service, Inject } from "typedi";
import { getLogger } from "./LogUtil";
import { Bridge } from "./reader/Bridge";
import { DataToImport } from "./reader/DataToImport";
import { Bab } from "./reader/JRDB/Bab";
import { Bac } from "./reader/JRDB/Bac";
import { Cha } from "./reader/JRDB/Cha";
import { Cya } from "./reader/JRDB/Cya";
import { Cyb } from "./reader/JRDB/Cyb";
import { Hja } from "./reader/JRDB/Hja";
import { Hjc } from "./reader/JRDB/Hjc";
import { Joa } from "./reader/JRDB/Joa";
import { Kaa } from "./reader/JRDB/Kaa";
import { Kab } from "./reader/JRDB/Kab";
import { Kyg } from "./reader/JRDB/Kyg";
import { Kyh } from "./reader/JRDB/Kyh";
import { Kyi } from "./reader/JRDB/Kyi";
import { Ot } from "./reader/JRDB/Ot";
import { Ou } from "./reader/JRDB/Ou";
import { Ov } from "./reader/JRDB/Ov";
import { Ow } from "./reader/JRDB/Ow";
import { Oz } from "./reader/JRDB/Oz";
import { Sec } from "./reader/JRDB/Sec";
import { Sed } from "./reader/JRDB/Sed";
import { Skb } from "./reader/JRDB/Skb";
import { Sra } from "./reader/JRDB/Sra";
import { Srb } from "./reader/JRDB/Srb";
import { Tyb } from "./reader/JRDB/Tyb";
import { Ukc } from "./reader/JRDB/Ukc";
import { Zec } from "./reader/JRDB/Zec";
import { Zkb } from "./reader/JRDB/Zkb";
import { KolCom1Kd3 } from "./reader/KOL/KD3/KolCom1Kd3";
import { KolDen1Kd3 } from "./reader/KOL/KD3/KolDen1Kd3";
import { KolDen2Kd3 } from "./reader/KOL/KD3/KolDen2Kd3";
import { KolKet5Kd3 } from "./reader/KOL/KD3/KolKet5Kd3";
import { KolKetKd3 } from "./reader/KOL/KD3/KolKetKd3";
import { KolKisKd3 } from "./reader/KOL/KD3/KolKisKd3";
import { KolKod2Kd3 } from "./reader/KOL/KD3/KolKod2Kd3";
import { KolKod3Kd3 } from "./reader/KOL/KD3/KolKod3Kd3";
import { KolKodKd3 } from "./reader/KOL/KD3/KolKodKd3";
import { KolKyuKd3 } from "./reader/KOL/KD3/KolKyuKd3";
import { KolOds2Kd3 } from "./reader/KOL/KD3/KolOds2Kd3";
import { KolOdsKd3 } from "./reader/KOL/KD3/KolOdsKd3";
import { KolSei1Kd3 } from "./reader/KOL/KD3/KolSei1Kd3";
import { KolSei2Kd3 } from "./reader/KOL/KD3/KolSei2Kd3";
import { KolSei3Kd3 } from "./reader/KOL/KD3/KolSei3Kd3";
import { KolShuKd3 } from "./reader/KOL/KD3/KolShuKd3";
import { KolUmaKd3 } from "./reader/KOL/KD3/KolUmaKd3";
import { C$a } from "./reader/JRDB/C$a";
import { K$a } from "./reader/JRDB/K$a";

export interface Entries {
  [basename: string]: string;
}

interface Item {
  index: number;
  basename: string;
  dataFile: string;
  dataToImport: DataToImport;
}

interface Reader {
  pattern: RegExp;
  dataToImport: DataToImport;
}

@Service()
export class Importer {

  private logger: Logger;

  private readers: Reader[];

  @Inject()
  private bridge: Bridge;

  constructor() {
    this.logger = getLogger(this);
    this.readers = [
      // KD3 厩舎データ
      { pattern: /kol_kyu\.kd3$/i, dataToImport: Container.get(KolKyuKd3) },
      // JRDB 調教師データ
      { pattern: /c[zs]a\d+\.txt$/i, dataToImport: Container.get(C$a) },
      // KD3 騎手データ
      { pattern: /kol_kis\.kd3$/i, dataToImport: Container.get(KolKisKd3) },
      // JRDB 騎手データ
      { pattern: /k[zs]a\d+\.txt$/i, dataToImport: Container.get(K$a) },
      // KD3 種牡馬データ
      { pattern: /kol_syu\.kd3$/i, dataToImport: Container.get(KolShuKd3) },
      // KD3 競走馬データ
      { pattern: /kol_uma\.kd3$/i, dataToImport: Container.get(KolUmaKd3) },
      // JRDB 馬基本データ
      { pattern: /ukc\d+\.txt$/i, dataToImport: Container.get(Ukc) },
      // KD3 3代血統図
      { pattern: /kol_ket\.kd3$/i, dataToImport: Container.get(KolKetKd3) },
      // KD3 5代血統図
      { pattern: /kol_ket5\.kd3$/i, dataToImport: Container.get(KolKet5Kd3) },
      // KD3 出走馬レースデータ
      { pattern: /kol_den1\.kd3$/i, dataToImport: Container.get(KolDen1Kd3) },
      // JRDB 開催データ
      { pattern: /kaa\d+\.txt$/i, dataToImport: Container.get(Kaa) },
      { pattern: /kab\d+\.txt$/i, dataToImport: Container.get(Kab) },
      // JRDB 番組データ
      { pattern: /bab\d+\.txt$/i, dataToImport: Container.get(Bab) },
      { pattern: /bac\d+\.txt$/i, dataToImport: Container.get(Bac) },
      // JRDB 前走データ
      { pattern: /zec\d+\.txt$/i, dataToImport: Container.get(Zec) },
      // JRDB 前走拡張データ
      { pattern: /zkb\d+\.txt$/i, dataToImport: Container.get(Zkb) },
      // KD3 出馬表出走馬データ
      { pattern: /kol_den2\.kd3$/i, dataToImport: Container.get(KolDen2Kd3) },
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
      { pattern: /tyb\d+\.txt$/i, dataToImport: Container.get(Tyb) },
      // KD3 予想オッズ（単勝・枠連・馬連）
      { pattern: /kol_ods\.kd3$/i, dataToImport: Container.get(KolOdsKd3) },
      // KD3 予想オッズ２（馬単・３連複）
      { pattern: /kol_ods2\.kd3$/i, dataToImport: Container.get(KolOds2Kd3) },
      // JRDB 基準オッズデータ
      { pattern: /oz\d+\.txt$/i, dataToImport: Container.get(Oz) },
      // JRDB ワイド基準オッズデータ
      { pattern: /ow\d+\.txt$/i, dataToImport: Container.get(Ow) },
      // JRDB 馬単基準オッズデータ
      { pattern: /ou\d+\.txt$/i, dataToImport: Container.get(Ou) },
      // JRDB 3連複基準オッズデータ
      { pattern: /ot\d+\.txt$/i, dataToImport: Container.get(Ot) },
      // JRDB 3連単基準オッズデータ

      { pattern: /ov\d+\.txt$/i, dataToImport: Container.get(Ov) },
      // KD3 競走成績レースデータ
      { pattern: /kol_sei1\.kd3$/i, dataToImport: Container.get(KolSei1Kd3) },
      // JRDB 成績レースデータ
      { pattern: /sra\d+\.txt$/i, dataToImport: Container.get(Sra) },
      { pattern: /srb\d+\.txt$/i, dataToImport: Container.get(Srb) },
      // KD3 競走成績出走馬データ
      { pattern: /kol_sei2\.kd3$/i, dataToImport: Container.get(KolSei2Kd3) },
      // JRDB 成績データ
      { pattern: /sec\d+\.txt$/i, dataToImport: Container.get(Sec) },
      { pattern: /sed\d+\.txt$/i, dataToImport: Container.get(Sed) },
      // KD3 制裁その他データ
      { pattern: /kol_sei3\.kd3$/i, dataToImport: Container.get(KolSei3Kd3) },
      // JRDB 成績拡張データ
      { pattern: /seb\d+\.txt$/i, dataToImport: Container.get(Skb) },
      // JRDB 払戻情報データ
      { pattern: /hja\d+\.txt$/i, dataToImport: Container.get(Hja) },
      { pattern: /hjc\d+\.txt$/i, dataToImport: Container.get(Hjc) },
      // KD3 騎手厩舎コメント／次走へのメモ
      { pattern: /kol_com1\.kd3$/i, dataToImport: Container.get(KolCom1Kd3) },
      // KD3 確定オッズ（単勝・枠連・馬連）
      { pattern: /kol_kod\.kd3$/i, dataToImport: Container.get(KolKodKd3) },
      // KD3 確定オッズ（複勝・ワイド・馬単・３連複）
      { pattern: /kol_kod2\.kd3$/i, dataToImport: Container.get(KolKod2Kd3) },
      // KD3 確定オッズ３（３連単）
      { pattern: /kol_kod3\.kd3$/i, dataToImport: Container.get(KolKod3Kd3) },
    ];
  }

  public async import(entries: Entries) {
    const items: Item[] = [];
    for (let [basename, dataFile] of Object.entries(entries)) {
      for (let i = 0; i < this.readers.length; i++) {
        const reader = this.readers[i];
        if (!reader.pattern.test(basename)) {
          continue;
        }
        items.push({ index: i, basename: basename, dataFile: dataFile, dataToImport: reader.dataToImport })
      }
    }

    items.sort((a, b) => {
      let result = a.index - b.index;
      if (result !== 0) {
        return result;
      }
      if (a.basename < b.basename) {
        return -1;
      } else if (b.basename < a.basename) {
        return 1;
      }
      return 0;
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      this.bridge.basename = item.basename;
      const dataToImport = item.dataToImport;
      let fd: number;
      try {
        fd = fs.openSync(item.dataFile, "r");
        if (this.logger.isLevelEnabled("info")) {
          this.logger.info('"' + item.basename + '"を取り込んでいます');
        }
        await dataToImport.readAll(fd);
      } catch (e) {
        this.logger.error(e.stack || e);
      } finally {
        delete this.bridge.basename;
        fs.closeSync(fd);
      }
    }
  }
}
