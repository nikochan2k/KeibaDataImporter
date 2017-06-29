import { Inject, Service } from "typedi";
import * as $R from "../../../converters/Race";
import { RaceDao } from "../../../daos/RaceDao";
import { Race } from "../../../entities/Race";
import { RaceClass } from "../../../entities/RaceClass";
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

  @Inject()
  private raceDao: RaceDao;

  protected getBufferLength() {
    return 848;
  }

  protected async save(buffer: Buffer, cache: DataCache) {
    const race = await this.kolRaceTool.getRace(buffer);
    const dataSakuseiNengappi = readDate(buffer, 418, 8);
    if (race.KolShutsubahyouSakuseiNengappi) {
      if (dataSakuseiNengappi <= race.KolShutsubahyouSakuseiNengappi) {
        this.logger.debug("既に最新の出走馬レースデータが格納されています: " + race.Id);
        return;
      } else {
        await this.kolRaceTool.deleteOldSeiseki(race);
      }
    }

    race.KolShutsubahyouSakuseiNengappi = dataSakuseiNengappi;

    await this.saveRace(buffer, race);
    await this.saveRaceShoukin(buffer, race);
    this.setYosouTenkai(buffer, race, cache);
  }

  protected async saveRace(buffer: Buffer, race: Race) {
    if (!race.KolSeisekiSakuseiNengappi) {
      race.Kyuujitsu = $R.kyuujitsu.toCodeFromKol(buffer, 20, 1);
      race.Youbi = $R.youbi.toCodeFromKol(buffer, 21, 1);
      race.RaceClassId = (await this.saveRaceClass(buffer)).Id;
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
      race.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromKol(buffer, 99, 1);
      if (race.JoukenNenreiSeigen === null) {
        race.JoukenNenreiSeigen = $R.joukenNenreiSeigen2.toCodeFromKol(buffer, 98, 1);
      }
      race.DirtShiba = $R.dirtShiba.toCodeFromKol(buffer, 105, 1);
      race.MigiHidari = $R.migiHidari.toCodeFromKol(buffer, 106, 1);
      race.UchiSoto = $R.uchiSoto.toCodeFromKol(buffer, 107, 1);
      race.Course = $R.course.toCodeFromKol(buffer, 108, 1);
      race.Kyori = readPositiveInt(buffer, 109, 4);
      race.CourseRecordId = (await this.kolRaceTool.getRecord(buffer, 114, 0)).Id;
      race.KyoriRecordId = (await this.kolRaceTool.getRecord(buffer, 167, 220)).Id;
      race.RaceRecordId = (await this.kolRaceTool.getRecord(buffer, 222, 275)).Id;
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

  protected saveRaceClass(buffer: Buffer) {
    const rc = new RaceClass();
    rc.KouryuuFlag = $R.kouryuuFlag.toCodeFromKol(buffer, 22, 1);
    rc.ChuuouChihouGaikoku = $R.chuuouChihouGaikoku.toCodeFromKol(buffer, 23, 1);
    rc.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 24, 1);
    rc.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 24, 1);
    rc.TokubetsuMei = this.tool.normalizeTokubetsuMei(buffer, 28, 30);
    rc.TanshukuTokubetsuMei = readStrWithNoSpace(buffer, 58, 14);
    rc.Grade = $R.grade.toCodeFromKol(buffer, 72, 1);
    rc.JoukenKei = $R.joukenKei.toCodeFromKol(buffer, 98, 1);
    rc.Jouken1 = $R.jouken.toCodeFromKol(buffer, 100, 5);
    return this.raceDao.saveRaceClass(rc);
  }

  protected async saveRaceShoukin(buffer: Buffer, race: Race) {
    await this.kolRaceTool.saveRaceShoukin(buffer, race, [
      { chakujun: 1, offset: 277, length: 9, fukashou: 0 },
      { chakujun: 2, offset: 286, length: 9, fukashou: 0 },
      { chakujun: 3, offset: 295, length: 9, fukashou: 0 },
      { chakujun: 4, offset: 304, length: 9, fukashou: 0 },
      { chakujun: 5, offset: 313, length: 9, fukashou: 0 },
      { chakujun: 1, offset: 351, length: 9, fukashou: 1 },
    ], 0);
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