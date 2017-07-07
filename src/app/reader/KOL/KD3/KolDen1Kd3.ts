import { Inject, Service } from "typedi";
import * as $R from "../../../converters/Race";
import { Race } from "../../../entities/Race";
import { DataCache } from "../../DataCache";
import { DataToImport } from "../../DataToImport";
import { DataTool } from "../../DataTool";
import {
  readDate,
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace,
  readTime
} from "../../Reader";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolDen1Kd3 extends DataToImport {

  @Inject()
  private tool: DataTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 848;
  }

  protected async save(buffer: Buffer, cache: DataCache) {
    const race = await this.kolRaceTool.getRace(buffer);
    const dataSakuseiNengappi = readDate(buffer, 418, 8);
    if (race.KolShutsubahyouSakuseiNengappi) {
      if (dataSakuseiNengappi <= race.KolShutsubahyouSakuseiNengappi) {
        this.logger.info("既に最新の出走馬レースデータが格納されています: " + race.Id);
        return;
      }
    }

    race.KolShutsubahyouSakuseiNengappi = dataSakuseiNengappi;

    await this.saveRace(buffer, race);
    this.setYosouTenkai(buffer, race, cache);
  }

  protected async saveRace(buffer: Buffer, race: Race) {
    if (!race.KolSeisekiSakuseiNengappi) {
      race.Kyuujitsu = $R.kyuujitsu.toCodeFromKol(buffer, 20, 1);
      race.Youbi = $R.youbi.toCodeFromKol(buffer, 21, 1);
      race.ChuuouChihouGaikoku = $R.chuuouChihouGaikoku.toCodeFromKol(buffer, 22, 1);
      race.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 23, 1);
      race.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 24, 1);
      race.JuushouKaisuu = readPositiveInt(buffer, 25, 3);
      race.TokubetsuMei = this.tool.normalizeTokubetsuMei(buffer, 28, 30);
      race.TanshukuTokubetsuMei = readStrWithNoSpace(buffer, 58, 14);
      race.Grade = $R.grade.toCodeFromKol(buffer, 72, 1);
      race.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromKol(buffer, 74, 2);
      const betteiBareiHandiShousai = readStr(buffer, 76, 18);
      if (race.BetteiBareiHandi === null) {
        race.BetteiBareiHandi = $R.betteiBareiHandi2.toCodeFromKol(betteiBareiHandiShousai);
      }
      if (race.BetteiBareiHandi === null) {
        race.BetteiBareiHandiReigai = betteiBareiHandiShousai;
      }
      const joukenFuka1 = $R.joukenFuka1.toCodesFromKol(buffer, 94, 2);
      const joukenFuka2 = $R.joukenFuka2.toCodesFromKol(buffer, 96, 2);
      race.JoukenFuka = this.tool.getJoukenFuka(joukenFuka1, joukenFuka2);
      race.JoukenKei = $R.joukenKei.toCodeFromKol(buffer, 98, 1);
      race.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromKol(buffer, 99, 1);
      if (race.JoukenNenreiSeigen === null) {
        race.JoukenNenreiSeigen = $R.joukenNenreiSeigen2.toCodeFromKol(buffer, 98, 1);
      }
      race.Jouken1 = $R.jouken.toCodeFromKol(buffer, 100, 5);
      race.DirtShiba = $R.dirtShiba.toCodeFromKol(buffer, 105, 1);
      race.MigiHidari = $R.migiHidari.toCodeFromKol(buffer, 106, 1);
      race.UchiSoto = $R.uchiSoto.toCodeFromKol(buffer, 107, 1);
      race.Course = $R.course.toCodeFromKol(buffer, 108, 1);
      race.Kyori = readPositiveInt(buffer, 109, 4);
      const courceRecord = await this.kolRaceTool.getRecord(buffer, 114, 0);
      race.CourseRecordId = courceRecord && courceRecord.Id;
      const kyoriRecord = await this.kolRaceTool.getRecord(buffer, 167, 220);
      race.KyoriRecordId = kyoriRecord && kyoriRecord.Id;
      const raceRecord = await this.kolRaceTool.getRecord(buffer, 222, 275);
      race.RaceRecordId = raceRecord && raceRecord.Id;
      race.Shoukin1Chaku = readPositiveInt(buffer, 277, 9);
      race.Shoukin2Chaku = readPositiveInt(buffer, 286, 9);
      race.Shoukin3Chaku = readPositiveInt(buffer, 295, 9);
      race.Shoukin4Chaku = readPositiveInt(buffer, 304, 9);
      race.Shoukin5Chaku = readPositiveInt(buffer, 313, 9);
      race.FukaShou = readPositiveInt(buffer, 351, 9);
      race.MaeuriFlag = $R.maeuriFlag.toCodeFromKol(buffer, 331, 1);
      race.YoteiHassouJikan = readStr(buffer, 332, 5);
      race.Tousuu = readPositiveInt(buffer, 337, 2);
      race.TorikeshiTousuu = readInt(buffer, 339, 2);
    }

    race.SuiteiTimeRyou = readTime(buffer, 341, 4);
    race.SuiteiTimeOmoFuryou = readTime(buffer, 345, 4);
    race.YosouPace = $R.pace.toCodeFromKol(buffer, 349, 1);

    await this.entityManager.save(race);
  }

  protected setYosouTenkai(buffer: Buffer, race: Race, cache: DataCache) {
    [362, 374, 386, 398].forEach((offset, index) => {
      for (let i = 0; i < 4; i++) {
        const umaban = readInt(buffer, offset + i * 2, 2);
        if (1 <= umaban && umaban <= 28) {
          const shussoubaId = race.Id * 100 + umaban;
          cache.addYosouTenkai(shussoubaId, index + 1);
        }
      }
    });
  }

}