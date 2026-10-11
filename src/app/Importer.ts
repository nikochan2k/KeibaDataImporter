import * as fs from "node:fs";
import { Inject, Injectable, type OnModuleInit, type Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { Logger } from "log4js";
import { ImportProgress } from "./ImportProgress";
import { getLogger } from "./LogUtil";
import { Bridge } from "./reader/Bridge";
import { DataToImport } from "./reader/DataToImport";
import { JravanChok } from "./reader/JRA/JRAVAN/JravanChok";
import { JravanDelc, JravanDelk, JravanDelu } from "./reader/JRA/JRAVAN/JravanDel";
import { JravanDen1 } from "./reader/JRA/JRAVAN/JravanDen1";
import { JravanDen2 } from "./reader/JRA/JRAVAN/JravanDen2";
import { JravanKisi } from "./reader/JRA/JRAVAN/JravanKisi";
import {
  JravanOds1,
  JravanOds3,
  JravanOds4,
  JravanOds5,
  JravanOds6,
} from "./reader/JRA/JRAVAN/JravanOds";
import { JravanSch1 } from "./reader/JRA/JRAVAN/JravanSch1";
import { JravanSei1 } from "./reader/JRA/JRAVAN/JravanSei1";
import { JravanSei2 } from "./reader/JRA/JRAVAN/JravanSei2";
import { JravanSeih } from "./reader/JRA/JRAVAN/JravanSeih";
import { JravanUmaj } from "./reader/JRA/JRAVAN/JravanUmaj";
import { JvData } from "./reader/JRA/JVData/JvData";
import { Bab } from "./reader/JRDB/Bab";
import { Bac } from "./reader/JRDB/Bac";
import { C$a } from "./reader/JRDB/C$a";
import { Cha } from "./reader/JRDB/Cha";
import { Cya } from "./reader/JRDB/Cya";
import { Cyb } from "./reader/JRDB/Cyb";
import { Hja } from "./reader/JRDB/Hja";
import { Hjc } from "./reader/JRDB/Hjc";
import { Joa } from "./reader/JRDB/Joa";
import { K$a } from "./reader/JRDB/K$a";
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
import { Zed } from "./reader/JRDB/Zed";
import { Zkb } from "./reader/JRDB/Zkb";
import { KolDenKd1 } from "./reader/KOL/KD1/KolDenKd1";
import { KolKetKd1 } from "./reader/KOL/KD1/KolKetKd1";
import { KolKisKd1 } from "./reader/KOL/KD1/KolKisKd1";
import { KolKyuKd1 } from "./reader/KOL/KD1/KolKyuKd1";
import { KolSei2Kd1 } from "./reader/KOL/KD1/KolSei2Kd1";
import { KolSeiKd1 } from "./reader/KOL/KD1/KolSeiKd1";
import { KolShuKd1 } from "./reader/KOL/KD1/KolShuKd1";
import { KolUmaKd1 } from "./reader/KOL/KD1/KolUmaKd1";
import { KolCom1Kd2 } from "./reader/KOL/KD2/KolCom1Kd2";
import { KolDen1Kd2 } from "./reader/KOL/KD2/KolDen1Kd2";
import { KolDen2Kd2 } from "./reader/KOL/KD2/KolDen2Kd2";
import { KolSei1Kd2 } from "./reader/KOL/KD2/KolSei1Kd2";
import { KolSei2Kd2 } from "./reader/KOL/KD2/KolSei2Kd2";
import { KolKet5Kd3 } from "./reader/KOL/KD3/KolKet5Kd3";
import { KolKod2Kd3 } from "./reader/KOL/KD3/KolKod2Kd3";
import { KolKod3Kd3 } from "./reader/KOL/KD3/KolKod3Kd3";
import { KolOds2Kd3 } from "./reader/KOL/KD3/KolOds2Kd3";
import { KolSei3Kd3 } from "./reader/KOL/KD3/KolSei3Kd3";
import { KolCom1 } from "./reader/KOL/KolCom1";
import { KolDen1 } from "./reader/KOL/KolDen1";
import { KolDen2 } from "./reader/KOL/KolDen2";
import { KolKet } from "./reader/KOL/KolKet";
import { KolKis } from "./reader/KOL/KolKis";
import { KolKod } from "./reader/KOL/KolKod";
import { KolKyu } from "./reader/KOL/KolKyu";
import { KolOds } from "./reader/KOL/KolOds";
import { KolSei1 } from "./reader/KOL/KolSei1";
import { KolSei2 } from "./reader/KOL/KolSei2";
import { KolShu } from "./reader/KOL/KolShu";
import { KolUma } from "./reader/KOL/KolUma";

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
  type: Type<DataToImport>;
  dataToImport?: DataToImport;
}

@Injectable()
export class Importer implements OnModuleInit {
  private logger: Logger;

  private readers: Reader[];

  @Inject()
  private bridge: Bridge;

  @Inject()
  private progress: ImportProgress;

  constructor(@Inject(ModuleRef) private moduleRef: ModuleRef) {
    this.logger = getLogger(this);
    this.readers = [
      // KD2/KD3 厩舎データ
      { pattern: /kol_kyu\.kd[23]$/i, type: KolKyu },
      // KD1 厩舎データ
      { pattern: /kol_kyu\.dat$/i, type: KolKyuKd1 },
      // JRA-VAN 調教師
      { pattern: /jracchok\.dat$/i, type: JravanChok },
      // JRA-VAN 抹消調教師
      { pattern: /jracdelc\.dat$/i, type: JravanDelc },
      // JRDB 調教師データ
      { pattern: /c[zs]a\d+\.txt$/i, type: C$a },
      // KD2/KD3 騎手データ
      { pattern: /kol_kis\.kd[23]$/i, type: KolKis },
      // KD1 騎手データ
      { pattern: /kol_kis\.dat$/i, type: KolKisKd1 },
      // JRA-VAN 騎手
      { pattern: /jrackisi\.dat$/i, type: JravanKisi },
      // JRA-VAN 抹消騎手
      { pattern: /jracdelk\.dat$/i, type: JravanDelk },
      // JRDB 騎手データ
      { pattern: /k[zs]a\d+\.txt$/i, type: K$a },
      // KD2/KD3 種牡馬データ
      { pattern: /kol_syu\.kd[23]$/i, type: KolShu },
      // KD1 種牡馬データ
      { pattern: /kol_syu\.dat$/i, type: KolShuKd1 },
      // KD2/KD3 競走馬データ
      { pattern: /kol_uma\.kd[23]$/i, type: KolUma },
      // KD1 競走馬データ
      { pattern: /kol_uma\.dat$/i, type: KolUmaKd1 },
      // JRA-VAN 競走馬
      { pattern: /jracumaj\.dat$/i, type: JravanUmaj },
      // JRA-VAN 抹消競走馬
      { pattern: /jracdelu\.dat$/i, type: JravanDelu },
      // JRA-VAN 年間スケジュール
      { pattern: /jracsch1\.dat$/i, type: JravanSch1 },
      // JRDB 馬基本データ
      { pattern: /ukc\d+\.txt$/i, type: Ukc },
      // KD2/KD3 3代血統図
      { pattern: /kol_ket\.kd[23]$/i, type: KolKet },
      // KD1 3代血統図
      { pattern: /kol_ket\.dat$/i, type: KolKetKd1 },
      // KD3 5代血統図
      { pattern: /kol_ket5\.kd3$/i, type: KolKet5Kd3 },
      // KD3 出走馬レースデータ
      { pattern: /kol_den1\.kd3$/i, type: KolDen1 },
      // KD2 出走馬レースデータ
      { pattern: /kol_den1\.kd2$/i, type: KolDen1Kd2 },
      // JRA-VAN 出馬表１
      { pattern: /jracden1\.dat$/i, type: JravanDen1 },
      // JRDB 開催データ
      { pattern: /kaa\d+\.txt$/i, type: Kaa },
      { pattern: /kab\d+\.txt$/i, type: Kab },
      // JRDB 番組データ
      { pattern: /bab\d+\.txt$/i, type: Bab },
      { pattern: /bac\d+\.txt$/i, type: Bac },
      // JRDB 前走データ
      { pattern: /zec\d+\.txt$/i, type: Zec },
      { pattern: /zed\d+\.txt$/i, type: Zed },
      // JRDB 前走拡張データ
      { pattern: /zkb\d+\.txt$/i, type: Zkb },
      // KD3 出馬表出走馬データ
      { pattern: /kol_den2\.kd3$/i, type: KolDen2 },
      // KD2 出馬表出走馬データ
      { pattern: /kol_den2\.kd2$/i, type: KolDen2Kd2 },
      // KD1 出馬表(レースと出走馬)
      { pattern: /kol_den\.dat$/i, type: KolDenKd1 },
      // JRA-VAN 出馬表２
      { pattern: /jracden2\.dat$/i, type: JravanDen2 },
      // JRDB 競走馬データ
      { pattern: /kyg\d+\.txt$/i, type: Kyg },
      { pattern: /kyh\d+\.txt$/i, type: Kyh },
      { pattern: /kyi\d+\.txt$/i, type: Kyi },
      // JRDB 情報データ
      { pattern: /joa\d+\.txt$/i, type: Joa },
      // JRDB 調教分析データ
      { pattern: /cya\d+\.txt$/i, type: Cya },
      { pattern: /cyb\d+\.txt$/i, type: Cyb },
      // JRDB 調教本追切データ
      { pattern: /cha\d+\.txt$/i, type: Cha },
      // JRDB 直前情報データ
      { pattern: /tyb\d+\.txt$/i, type: Tyb },
      // KD2/KD3 予想オッズ（単勝・枠連・馬連）
      { pattern: /kol_ods\.kd[23]$/i, type: KolOds },
      // KD3 予想オッズ２（馬単・３連複）
      { pattern: /kol_ods2\.kd3$/i, type: KolOds2Kd3 },
      // JRA-VAN オッズ（単勝・複勝・枠連）
      { pattern: /jracods1\.dat$/i, type: JravanOds1 },
      // JRA-VAN オッズ（馬連）
      { pattern: /jracods3\.dat$/i, type: JravanOds3 },
      // JRA-VAN オッズ（ワイド）
      { pattern: /jracods4\.dat$/i, type: JravanOds4 },
      // JRA-VAN オッズ（馬単）
      { pattern: /jracods5\.dat$/i, type: JravanOds5 },
      // JRA-VAN オッズ（3連複）
      { pattern: /jracods6\.dat$/i, type: JravanOds6 },
      // JRDB 基準オッズデータ
      { pattern: /oz\d+\.txt$/i, type: Oz },
      // JRDB ワイド基準オッズデータ
      { pattern: /ow\d+\.txt$/i, type: Ow },
      // JRDB 馬単基準オッズデータ
      { pattern: /ou\d+\.txt$/i, type: Ou },
      // JRDB 3連複基準オッズデータ
      { pattern: /ot\d+\.txt$/i, type: Ot },
      // JRDB 3連単基準オッズデータ

      { pattern: /ov\d+\.txt$/i, type: Ov },
      // KD3 競走成績レースデータ
      { pattern: /kol_sei1\.kd3$/i, type: KolSei1 },
      // KD2 競走成績レースデータ
      { pattern: /kol_sei1\.kd2$/i, type: KolSei1Kd2 },
      // JRA-VAN 成績１
      { pattern: /jracsei1\.dat$/i, type: JravanSei1 },
      // JRDB 成績レースデータ
      { pattern: /sra\d+\.txt$/i, type: Sra },
      { pattern: /srb\d+\.txt$/i, type: Srb },
      // KD3 競走成績出走馬データ
      { pattern: /kol_sei2\.kd3$/i, type: KolSei2 },
      // KD2 競走成績出走馬データ
      { pattern: /kol_sei2\.kd2$/i, type: KolSei2Kd2 },
      // KD1 競走成績(レースと出走馬)
      { pattern: /kol_sei\.dat$/i, type: KolSeiKd1 },
      // KD1 競走成績２(19〜28番の出走馬)
      { pattern: /kol_sei2\.dat$/i, type: KolSei2Kd1 },
      // JRA-VAN 成績２
      { pattern: /jracsei2\.dat$/i, type: JravanSei2 },
      // JRA-VAN 成績Ｈ（馬単・3連複の払戻金）
      { pattern: /jracseih\.dat$/i, type: JravanSeih },
      // JRDB 成績データ
      { pattern: /sec\d+\.txt$/i, type: Sec },
      { pattern: /sed\d+\.txt$/i, type: Sed },
      // KD3 制裁その他データ
      { pattern: /kol_sei3\.kd3$/i, type: KolSei3Kd3 },
      // JRDB 成績拡張データ
      { pattern: /skb\d+\.txt$/i, type: Skb },
      // JRDB 払戻情報データ
      { pattern: /hja\d+\.txt$/i, type: Hja },
      { pattern: /hjc\d+\.txt$/i, type: Hjc },
      // KD3 騎手厩舎コメント／次走へのメモ
      { pattern: /kol_com1\.kd3$/i, type: KolCom1 },
      // KD2 騎手厩舎コメント／次走へのメモ
      { pattern: /kol_com1\.kd2$/i, type: KolCom1Kd2 },
      // KD2/KD3 確定オッズ（単勝・枠連・馬連）
      { pattern: /kol_kod\.kd[23]$/i, type: KolKod },
      // KD3 確定オッズ（複勝・ワイド・馬単・３連複）
      { pattern: /kol_kod2\.kd3$/i, type: KolKod2Kd3 },
      // KD3 確定オッズ３（３連単）
      { pattern: /kol_kod3\.kd3$/i, type: KolKod3Kd3 },
      // JV-Data (JRA-VAN Data Lab.)。レコード種別は混ざっていてよい
      { pattern: /\.jvd$/i, type: JvData },
    ];
  }

  public onModuleInit() {
    for (const reader of this.readers) {
      reader.dataToImport = this.moduleRef.get(reader.type, { strict: false });
    }
  }

  public async import(entries: Entries) {
    const items: Item[] = [];
    for (const [basename, dataFile] of Object.entries(entries)) {
      const before = items.length;
      for (let i = 0; i < this.readers.length; i++) {
        const reader = this.readers[i];
        if (!reader.pattern.test(basename)) {
          continue;
        }
        items.push({
          index: i,
          basename: basename,
          dataFile: dataFile,
          dataToImport: reader.dataToImport,
        });
      }
      if (items.length === before) {
        this.progress.fileSkipped(basename, "ファイル名に対応する読み取り処理がありません");
      }
    }

    items.sort((a, b) => {
      const result = a.index - b.index;
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
          this.logger.info(`"${item.basename}"を取り込んでいます`);
        }
        this.progress.fileStarted(item.basename);
        await dataToImport.readAll(fd);
        this.progress.fileFinished(item.basename);
      } catch (e) {
        this.logger.error(e.stack || e);
        this.progress.fileFailed(item.basename, e?.message ?? String(e));
      } finally {
        delete this.bridge.basename;
        fs.closeSync(fd);
      }
    }
  }
}
