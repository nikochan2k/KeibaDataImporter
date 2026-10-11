import { Module } from "@nestjs/common";
import { BanushiDao } from "./daos/BanushiDao";
import { ChoukyouDao } from "./daos/ChoukyouDao";
import { ChoukyoushiDao } from "./daos/ChoukyoushiDao";
import { HoubokusakiDao } from "./daos/HoubokusakiDao";
import { JinmeiDao } from "./daos/JinmeiDao";
import { KishuDao } from "./daos/KishuDao";
import { MeishouDao } from "./daos/MeishouDao";
import { RaceDao } from "./daos/RaceDao";
import { SeisanshaDao } from "./daos/SeisanshaDao";
import { TokubetsuMeiDao } from "./daos/TokubetsuMeiDao";
import { UmaDao } from "./daos/UmaDao";
import { Importer } from "./Importer";
import { ImportProgress } from "./ImportProgress";
import { Bridge } from "./reader/Bridge";
import { JravanChok } from "./reader/JRA/JRAVAN/JravanChok";
import { JravanDelc, JravanDelk, JravanDelu } from "./reader/JRA/JRAVAN/JravanDel";
import { JravanDen1 } from "./reader/JRA/JRAVAN/JravanDen1";
import { JravanDen2 } from "./reader/JRA/JRAVAN/JravanDen2";
import { JravanKaisaiTool } from "./reader/JRA/JRAVAN/JravanKaisaiTool";
import { JravanKisi } from "./reader/JRA/JRAVAN/JravanKisi";
import { JravanOddsHaitouTool } from "./reader/JRA/JRAVAN/JravanOddsHaitouTool";
import {
  JravanOds1,
  JravanOds3,
  JravanOds4,
  JravanOds5,
  JravanOds6,
} from "./reader/JRA/JRAVAN/JravanOds";
import { JravanRaceTool } from "./reader/JRA/JRAVAN/JravanRaceTool";
import { JravanSch1 } from "./reader/JRA/JRAVAN/JravanSch1";
import { JravanSei1 } from "./reader/JRA/JRAVAN/JravanSei1";
import { JravanSei2 } from "./reader/JRA/JRAVAN/JravanSei2";
import { JravanSeih } from "./reader/JRA/JRAVAN/JravanSeih";
import { JravanShussoubaTool } from "./reader/JRA/JRAVAN/JravanShussoubaTool";
import { JravanUmaj } from "./reader/JRA/JRAVAN/JravanUmaj";
import { JraTool } from "./reader/JRA/JraTool";
import { JvData } from "./reader/JRA/JVData/JvData";
import { JvdataCh } from "./reader/JRA/JVData/JvdataCh";
import { JvdataHr } from "./reader/JRA/JVData/JvdataHr";
import { JvdataKaisaiTool } from "./reader/JRA/JVData/JvdataKaisaiTool";
import { JvdataKs } from "./reader/JRA/JVData/JvdataKs";
import {
  JvdataO1,
  JvdataO2,
  JvdataO3,
  JvdataO4,
  JvdataO5,
  JvdataO6,
} from "./reader/JRA/JVData/JvdataOdds";
import { JvdataOddsHaitouTool } from "./reader/JRA/JVData/JvdataOddsHaitouTool";
import { JvdataRa } from "./reader/JRA/JVData/JvdataRa";
import { JvdataRaceTool } from "./reader/JRA/JVData/JvdataRaceTool";
import { JvdataSe } from "./reader/JRA/JVData/JvdataSe";
import { JvdataShussoubaTool } from "./reader/JRA/JVData/JvdataShussoubaTool";
import { JvdataUm } from "./reader/JRA/JVData/JvdataUm";
import { JvdataYs } from "./reader/JRA/JVData/JvdataYs";
import { Bab } from "./reader/JRDB/Bab";
import { Bac } from "./reader/JRDB/Bac";
import { C$a } from "./reader/JRDB/C$a";
import { Cha } from "./reader/JRDB/Cha";
import { Cya } from "./reader/JRDB/Cya";
import { Cyb } from "./reader/JRDB/Cyb";
import { Hja } from "./reader/JRDB/Hja";
import { Hjc } from "./reader/JRDB/Hjc";
import { Joa } from "./reader/JRDB/Joa";
import { JrdbKaisaiKaisaiTool } from "./reader/JRDB/JrdbKaisaiKaisaiTool";
import { JrdbKaisaiRaceTool } from "./reader/JRDB/JrdbKaisaiRaceTool";
import { JrdbKaisaiShussoubaTool } from "./reader/JRDB/JrdbKaisaiShussoubaTool";
import { JrdbKaisaiTool } from "./reader/JRDB/JrdbKaisaiTool";
import { JrdbOddsHaitouTool } from "./reader/JRDB/JrdbOddsHaitouTool";
import { JrdbRaceTool } from "./reader/JRDB/JrdbRaceTool";
import { JrdbShussoubaTool } from "./reader/JRDB/JrdbShussoubaTool";
import { JrdbTool } from "./reader/JRDB/JrdbTool";
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
import { KeikaTool } from "./reader/KeikaTool";
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
import { KolChoukyouTool } from "./reader/KOL/KolChoukyouTool";
import { KolCom1 } from "./reader/KOL/KolCom1";
import { KolDen1 } from "./reader/KOL/KolDen1";
import { KolDen2 } from "./reader/KOL/KolDen2";
import { KolKaisaiTool } from "./reader/KOL/KolKaisaiTool";
import { KolKet } from "./reader/KOL/KolKet";
import { KolKis } from "./reader/KOL/KolKis";
import { KolKod } from "./reader/KOL/KolKod";
import { KolKyu } from "./reader/KOL/KolKyu";
import { KolOddsHaitouTool } from "./reader/KOL/KolOddsHaitouTool";
import { KolOds } from "./reader/KOL/KolOds";
import { KolRaceTool } from "./reader/KOL/KolRaceTool";
import { KolSei1 } from "./reader/KOL/KolSei1";
import { KolSei2 } from "./reader/KOL/KolSei2";
import { KolShu } from "./reader/KOL/KolShu";
import { KolShussoubaTool } from "./reader/KOL/KolShussoubaTool";
import { KolTool } from "./reader/KOL/KolTool";
import { KolUma } from "./reader/KOL/KolUma";
import { KolUmaTool } from "./reader/KOL/KolUmaTool";
import { Tool } from "./reader/Tool";
import { Traversal } from "./Traversal";

/** 取り込み処理(リーダー、ツール、DAO)をまとめたモジュール */
@Module({
  providers: [
    Importer,
    ImportProgress,
    Traversal,
    BanushiDao,
    ChoukyouDao,
    ChoukyoushiDao,
    HoubokusakiDao,
    JinmeiDao,
    KishuDao,
    MeishouDao,
    RaceDao,
    SeisanshaDao,
    TokubetsuMeiDao,
    UmaDao,
    Bridge,
    JravanChok,
    JravanDelc,
    JravanDelk,
    JravanDelu,
    JravanDen1,
    JravanDen2,
    JravanKaisaiTool,
    JravanKisi,
    JravanOddsHaitouTool,
    JravanOds1,
    JravanOds3,
    JravanOds4,
    JravanOds5,
    JravanOds6,
    JravanRaceTool,
    JravanSch1,
    JravanSei1,
    JravanSei2,
    JravanSeih,
    JravanShussoubaTool,
    JravanUmaj,
    JvData,
    JvdataCh,
    JvdataHr,
    JvdataKaisaiTool,
    JvdataKs,
    JvdataO1,
    JvdataO2,
    JvdataO3,
    JvdataO4,
    JvdataO5,
    JvdataO6,
    JvdataOddsHaitouTool,
    JvdataRa,
    JvdataRaceTool,
    JvdataSe,
    JvdataShussoubaTool,
    JvdataUm,
    JvdataYs,
    JraTool,
    Bab,
    Bac,
    C$a,
    Cha,
    Cya,
    Cyb,
    Hja,
    Hjc,
    Joa,
    JrdbKaisaiKaisaiTool,
    JrdbKaisaiRaceTool,
    JrdbKaisaiShussoubaTool,
    JrdbKaisaiTool,
    JrdbOddsHaitouTool,
    JrdbRaceTool,
    JrdbShussoubaTool,
    JrdbTool,
    K$a,
    Kaa,
    Kab,
    Kyg,
    Kyh,
    Kyi,
    Ot,
    Ou,
    Ov,
    Ow,
    Oz,
    Sec,
    Sed,
    Skb,
    Sra,
    Srb,
    Tyb,
    Ukc,
    Zec,
    Zed,
    Zkb,
    KolDenKd1,
    KolKetKd1,
    KolKisKd1,
    KolKyuKd1,
    KolSei2Kd1,
    KolSeiKd1,
    KolShuKd1,
    KolUmaKd1,
    KolCom1Kd2,
    KolDen1Kd2,
    KolDen2Kd2,
    KolSei1Kd2,
    KolSei2Kd2,
    KolKet5Kd3,
    KolKod2Kd3,
    KolKod3Kd3,
    KolOds2Kd3,
    KolSei3Kd3,
    KolChoukyouTool,
    KolCom1,
    KolDen1,
    KolDen2,
    KolKaisaiTool,
    KolKet,
    KolKis,
    KolKod,
    KolKyu,
    KolOddsHaitouTool,
    KolOds,
    KolRaceTool,
    KolSei1,
    KolSei2,
    KolShu,
    KolShussoubaTool,
    KolTool,
    KolUma,
    KolUmaTool,
    KeikaTool,
    Tool,
  ],
  exports: [Importer, ImportProgress, Traversal],
})
export class ImporterModule {}
