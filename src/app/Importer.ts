import * as fs from "node:fs";
import { Logger } from "log4js";
import type { ImportTarget } from "./api/types";
import { importProgress } from "./ImportProgress";
import { getLogger } from "./LogUtil";
import { bridge } from "./reader/Bridge";
import { DataToImport } from "./reader/DataToImport";
import { JravanChok } from "./reader/JRA/JRAVAN/JravanChok";
import { JravanDelc, JravanDelk, JravanDelu } from "./reader/JRA/JRAVAN/JravanDel";
import { JravanDen1 } from "./reader/JRA/JRAVAN/JravanDen1";
import { JravanDen2 } from "./reader/JRA/JRAVAN/JravanDen2";
import {
  JravanHyo1,
  JravanHyo2,
  JravanHyo3,
  JravanHyo4,
  JravanHyo5,
  JravanHyo6,
} from "./reader/JRA/JRAVAN/JravanHyo";
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
import { JravanTok1 } from "./reader/JRA/JRAVAN/JravanTok1";
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
import { yieldToEventLoop } from "./util/Yield";

export interface Entries {
  [basename: string]: string;
}

interface Item extends ImportTarget {
  index: number;
  basename: string;
  dataFile: string;
  dataToImport: DataToImport;
}

interface Reader extends ImportTarget {
  pattern: RegExp;
  type: new () => DataToImport;
  dataToImport?: DataToImport;
}

export class Importer {
  private logger: Logger;

  private readers: Reader[];

  constructor() {
    this.logger = getLogger(this);
    this.readers = [
      { pattern: /kol_kyu\.kd[23]$/i, type: KolKyu, source: "KOL", kind: "厩舎データ" },
      { pattern: /kol_kyu\.dat$/i, type: KolKyuKd1, source: "KOL", kind: "厩舎データ" },
      { pattern: /jracchok\.dat$/i, type: JravanChok, source: "JRA-VAN", kind: "調教師" },
      { pattern: /jracdelc\.dat$/i, type: JravanDelc, source: "JRA-VAN", kind: "抹消調教師" },
      { pattern: /c[zs]a\d+\.txt$/i, type: C$a, source: "JRDB", kind: "調教師データ" },
      { pattern: /kol_kis\.kd[23]$/i, type: KolKis, source: "KOL", kind: "騎手データ" },
      { pattern: /kol_kis\.dat$/i, type: KolKisKd1, source: "KOL", kind: "騎手データ" },
      { pattern: /jrackisi\.dat$/i, type: JravanKisi, source: "JRA-VAN", kind: "騎手" },
      { pattern: /jracdelk\.dat$/i, type: JravanDelk, source: "JRA-VAN", kind: "抹消騎手" },
      { pattern: /k[zs]a\d+\.txt$/i, type: K$a, source: "JRDB", kind: "騎手データ" },
      { pattern: /kol_syu\.kd[23]$/i, type: KolShu, source: "KOL", kind: "種牡馬データ" },
      { pattern: /kol_syu\.dat$/i, type: KolShuKd1, source: "KOL", kind: "種牡馬データ" },
      { pattern: /kol_uma\.kd[23]$/i, type: KolUma, source: "KOL", kind: "競走馬データ" },
      { pattern: /kol_uma\.dat$/i, type: KolUmaKd1, source: "KOL", kind: "競走馬データ" },
      { pattern: /jracumaj\.dat$/i, type: JravanUmaj, source: "JRA-VAN", kind: "競走馬" },
      { pattern: /jracdelu\.dat$/i, type: JravanDelu, source: "JRA-VAN", kind: "抹消競走馬" },
      { pattern: /jracsch1\.dat$/i, type: JravanSch1, source: "JRA-VAN", kind: "年間スケジュール" },
      { pattern: /ukc\d+\.txt$/i, type: Ukc, source: "JRDB", kind: "馬基本データ" },
      { pattern: /kol_ket\.kd[23]$/i, type: KolKet, source: "KOL", kind: "3代血統図" },
      { pattern: /kol_ket\.dat$/i, type: KolKetKd1, source: "KOL", kind: "3代血統図" },
      { pattern: /kol_ket5\.kd3$/i, type: KolKet5Kd3, source: "KOL", kind: "5代血統図" },
      { pattern: /kol_den1\.kd3$/i, type: KolDen1, source: "KOL", kind: "出走馬レースデータ" },
      { pattern: /kol_den1\.kd2$/i, type: KolDen1Kd2, source: "KOL", kind: "出走馬レースデータ" },
      { pattern: /jractok1\.dat$/i, type: JravanTok1, source: "JRA-VAN", kind: "特別登録馬" },
      { pattern: /jracden1\.dat$/i, type: JravanDen1, source: "JRA-VAN", kind: "出馬表１" },
      { pattern: /kaa\d+\.txt$/i, type: Kaa, source: "JRDB", kind: "開催データ" },
      { pattern: /kab\d+\.txt$/i, type: Kab, source: "JRDB", kind: "開催データ" },
      { pattern: /bab\d+\.txt$/i, type: Bab, source: "JRDB", kind: "番組データ" },
      { pattern: /bac\d+\.txt$/i, type: Bac, source: "JRDB", kind: "番組データ" },
      { pattern: /zec\d+\.txt$/i, type: Zec, source: "JRDB", kind: "前走データ" },
      { pattern: /zed\d+\.txt$/i, type: Zed, source: "JRDB", kind: "前走データ" },
      { pattern: /zkb\d+\.txt$/i, type: Zkb, source: "JRDB", kind: "前走拡張データ" },
      { pattern: /kol_den2\.kd3$/i, type: KolDen2, source: "KOL", kind: "出馬表出走馬データ" },
      { pattern: /kol_den2\.kd2$/i, type: KolDen2Kd2, source: "KOL", kind: "出馬表出走馬データ" },
      { pattern: /kol_den\.dat$/i, type: KolDenKd1, source: "KOL", kind: "出馬表(レースと出走馬)" },
      { pattern: /jracden2\.dat$/i, type: JravanDen2, source: "JRA-VAN", kind: "出馬表２" },
      { pattern: /kyg\d+\.txt$/i, type: Kyg, source: "JRDB", kind: "競走馬データ" },
      { pattern: /kyh\d+\.txt$/i, type: Kyh, source: "JRDB", kind: "競走馬データ" },
      { pattern: /kyi\d+\.txt$/i, type: Kyi, source: "JRDB", kind: "競走馬データ" },
      { pattern: /joa\d+\.txt$/i, type: Joa, source: "JRDB", kind: "情報データ" },
      { pattern: /cya\d+\.txt$/i, type: Cya, source: "JRDB", kind: "調教分析データ" },
      { pattern: /cyb\d+\.txt$/i, type: Cyb, source: "JRDB", kind: "調教分析データ" },
      { pattern: /cha\d+\.txt$/i, type: Cha, source: "JRDB", kind: "調教本追切データ" },
      { pattern: /tyb\d+\.txt$/i, type: Tyb, source: "JRDB", kind: "直前情報データ" },
      {
        pattern: /kol_ods\.kd[23]$/i,
        type: KolOds,
        source: "KOL",
        kind: "予想オッズ（単勝・枠連・馬連）",
      },
      {
        pattern: /kol_ods2\.kd3$/i,
        type: KolOds2Kd3,
        source: "KOL",
        kind: "予想オッズ２（馬単・３連複）",
      },
      {
        pattern: /jracods1\.dat$/i,
        type: JravanOds1,
        source: "JRA-VAN",
        kind: "オッズ（単勝・複勝・枠連）",
      },
      { pattern: /jracods3\.dat$/i, type: JravanOds3, source: "JRA-VAN", kind: "オッズ（馬連）" },
      { pattern: /jracods4\.dat$/i, type: JravanOds4, source: "JRA-VAN", kind: "オッズ（ワイド）" },
      { pattern: /jracods5\.dat$/i, type: JravanOds5, source: "JRA-VAN", kind: "オッズ（馬単）" },
      { pattern: /jracods6\.dat$/i, type: JravanOds6, source: "JRA-VAN", kind: "オッズ（3連複）" },
      {
        pattern: /jrachyo1\.dat$/i,
        type: JravanHyo1,
        source: "JRA-VAN",
        kind: "票数（単勝・複勝・枠連）",
      },
      {
        pattern: /jrachyo2\.dat$/i,
        type: JravanHyo2,
        source: "JRA-VAN",
        kind: "票数（19〜28番の単勝・複勝）",
      },
      { pattern: /jrachyo3\.dat$/i, type: JravanHyo3, source: "JRA-VAN", kind: "票数（馬連）" },
      { pattern: /jrachyo4\.dat$/i, type: JravanHyo4, source: "JRA-VAN", kind: "票数（ワイド）" },
      { pattern: /jrachyo5\.dat$/i, type: JravanHyo5, source: "JRA-VAN", kind: "票数（馬単）" },
      { pattern: /jrachyo6\.dat$/i, type: JravanHyo6, source: "JRA-VAN", kind: "票数（3連複）" },
      { pattern: /oz\d+\.txt$/i, type: Oz, source: "JRDB", kind: "基準オッズデータ" },
      { pattern: /ow\d+\.txt$/i, type: Ow, source: "JRDB", kind: "ワイド基準オッズデータ" },
      { pattern: /ou\d+\.txt$/i, type: Ou, source: "JRDB", kind: "馬単基準オッズデータ" },
      { pattern: /ot\d+\.txt$/i, type: Ot, source: "JRDB", kind: "3連複基準オッズデータ" },
      { pattern: /ov\d+\.txt$/i, type: Ov, source: "JRDB", kind: "3連単基準オッズデータ" },
      { pattern: /kol_sei1\.kd3$/i, type: KolSei1, source: "KOL", kind: "競走成績レースデータ" },
      { pattern: /kol_sei1\.kd2$/i, type: KolSei1Kd2, source: "KOL", kind: "競走成績レースデータ" },
      { pattern: /jracsei1\.dat$/i, type: JravanSei1, source: "JRA-VAN", kind: "成績１" },
      { pattern: /sra\d+\.txt$/i, type: Sra, source: "JRDB", kind: "成績レースデータ" },
      { pattern: /srb\d+\.txt$/i, type: Srb, source: "JRDB", kind: "成績レースデータ" },
      { pattern: /kol_sei2\.kd3$/i, type: KolSei2, source: "KOL", kind: "競走成績出走馬データ" },
      { pattern: /kol_sei2\.kd2$/i, type: KolSei2Kd2, source: "KOL", kind: "競走成績出走馬データ" },
      {
        pattern: /kol_sei\.dat$/i,
        type: KolSeiKd1,
        source: "KOL",
        kind: "競走成績(レースと出走馬)",
      },
      {
        pattern: /kol_sei2\.dat$/i,
        type: KolSei2Kd1,
        source: "KOL",
        kind: "競走成績２(19〜28番の出走馬)",
      },
      { pattern: /jracsei2\.dat$/i, type: JravanSei2, source: "JRA-VAN", kind: "成績２" },
      {
        pattern: /jracseih\.dat$/i,
        type: JravanSeih,
        source: "JRA-VAN",
        kind: "成績Ｈ（馬単・3連複の払戻金）",
      },
      { pattern: /sec\d+\.txt$/i, type: Sec, source: "JRDB", kind: "成績データ" },
      { pattern: /sed\d+\.txt$/i, type: Sed, source: "JRDB", kind: "成績データ" },
      { pattern: /kol_sei3\.kd3$/i, type: KolSei3Kd3, source: "KOL", kind: "制裁その他データ" },
      { pattern: /skb\d+\.txt$/i, type: Skb, source: "JRDB", kind: "成績拡張データ" },
      { pattern: /hja\d+\.txt$/i, type: Hja, source: "JRDB", kind: "払戻情報データ" },
      { pattern: /hjc\d+\.txt$/i, type: Hjc, source: "JRDB", kind: "払戻情報データ" },
      {
        pattern: /kol_com1\.kd3$/i,
        type: KolCom1,
        source: "KOL",
        kind: "騎手厩舎コメント／次走へのメモ",
      },
      {
        pattern: /kol_com1\.kd2$/i,
        type: KolCom1Kd2,
        source: "KOL",
        kind: "騎手厩舎コメント／次走へのメモ",
      },
      {
        pattern: /kol_kod\.kd[23]$/i,
        type: KolKod,
        source: "KOL",
        kind: "確定オッズ（単勝・枠連・馬連）",
      },
      {
        pattern: /kol_kod2\.kd3$/i,
        type: KolKod2Kd3,
        source: "KOL",
        kind: "確定オッズ（複勝・ワイド・馬単・３連複）",
      },
      {
        pattern: /kol_kod3\.kd3$/i,
        type: KolKod3Kd3,
        source: "KOL",
        kind: "確定オッズ３（３連単）",
      },
      { pattern: /\.jvd$/i, type: JvData, source: "JV-Data", kind: "レコード種別混在" },
    ];
    for (const reader of this.readers) {
      reader.dataToImport = new reader.type();
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
          source: reader.source,
          kind: reader.kind,
        });
      }
      if (items.length === before) {
        importProgress.fileSkipped(basename, "ファイル名に対応する読み取り処理がありません");
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
      if (importProgress.stopReason) {
        break;
      }
      const item = items[i];
      const target: ImportTarget = { source: item.source, kind: item.kind };
      await yieldToEventLoop();
      bridge.basename = item.basename;
      const dataToImport = item.dataToImport;
      let fd: number;
      try {
        fd = fs.openSync(item.dataFile, "r");
        importProgress.fileStarted(item.basename, target);
        await dataToImport.readAll(fd);
        importProgress.fileFinished(item.basename, target);
      } catch (e) {
        this.logger.error(e.stack || e);
        importProgress.fileFailed(item.basename, e?.message ?? String(e), target);
      } finally {
        delete bridge.basename;
        fs.closeSync(fd);
      }
    }
  }
}

export const importer = new Importer();
