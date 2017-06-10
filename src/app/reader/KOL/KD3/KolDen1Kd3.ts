import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import * as $C from "../../../converters/Common";
import * as $R from "../../../converters/Race";
import { Race } from "../../../entities/Race";
import { RaceClass } from "../../../entities/RaceClass";
import { DataToImport } from "../../DataToImport";
import { DataTool } from "../../DataTool";
import { DataCache } from "../../DataCache";
import {
  readDate,
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace,
  readTime
} from "../../Reader";
import { KolRaceTool } from "../KolRaceTool";
import { KolTool } from "../KolTool";

@Service()
export class KolDen1Kd3 extends DataToImport {

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: DataTool;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 848;
  }

  protected async save(buffer: Buffer, cache: DataCache) {
    const id = this.kolTool.getRaceId(buffer);
    if (!id) {
      return;
    }
    let race = await this.entityManager.findOneById(Race, id);
    const dataSakuseiNengappi = readDate(buffer, 418, 8);
    if (race) {
      if (race.KolShutsubahyouSakuseiNengappi) {
        if (dataSakuseiNengappi <= race.KolShutsubahyouSakuseiNengappi) {
          this.logger.debug("既に最新の出走馬レースデータが格納されています: " + id);
          return;
        } else {
          await this.kolRaceTool.deleteOldSeiseki(race);
        }
      }
    } else {
      race = new Race();
      race.Id = id;
    }

    race.KolShutsubahyouSakuseiNengappi = dataSakuseiNengappi;

    await this.saveRace(buffer, race);
    await this.saveRaceShoukin(buffer, race);
    this.setYosouTenkai(buffer, race, cache);
  }

  protected async saveRace(buffer: Buffer, race: Race) {
    if (!race.KolSeisekiSakuseiNengappi) {
      race.Basho = $C.basho.toCodeFromKol(buffer, 0, 2);
      race.Nen = readPositiveInt(buffer, 2, 4);
      race.Kaiji = readPositiveInt(buffer, 6, 2);
      race.Nichiji = readPositiveInt(buffer, 8, 2);
      race.RaceBangou = readPositiveInt(buffer, 10, 2);
      race.Nengappi = readDate(buffer, 12, 8);
      race.Kyuujitsu = $R.kyuujitsu.toCodeFromKol(buffer, 20, 1);
      race.Youbi = $R.youbi.toCodeFromKol(buffer, 21, 1);
      const raceClass = await this.saveRaceClass(buffer);
      race.RaceClass = raceClass;
      race.DirtShiba = $R.dirtShiba.toCodeFromKol(buffer, 105, 1);
      race.MigiHidari = $R.migiHidari.toCodeFromKol(buffer, 106, 1);
      race.UchiSoto = $R.uchiSoto.toCodeFromKol(buffer, 107, 1);
      race.Course = $R.course.toCodeFromKol(buffer, 108, 1);
      race.Kyori = readPositiveInt(buffer, 109, 4);
      race.CourseRecord = await this.kolRaceTool.getRecord(buffer, 114, 0);
      race.KyoriRecord = await this.kolRaceTool.getRecord(buffer, 167, 220);
      race.RaceRecord = await this.kolRaceTool.getRecord(buffer, 222, 275);
      race.MaeuriFlag = $R.maeuriFlag.toCodeFromKol(buffer, 331, 1);
      race.YoteiHassouJikan = readStr(buffer, 332, 5);
      race.Tousuu = readPositiveInt(buffer, 337, 2);
      race.TorikeshiTousuu = readInt(buffer, 339, 2);
    }

    race.SuiteiTimeRyou = readTime(buffer, 341, 4);
    race.SuiteiTimeOmoFuryou = readTime(buffer, 345, 4);
    race.YosouPace = $R.pace.toCodeFromKol(buffer, 349, 1);

    await this.entityManager.persist(race);
  }

  protected async saveRaceClass(buffer: Buffer) {
    const rc = new RaceClass();
    rc.KouryuuFlag = $R.kouryuuFlag.toCodeFromKol(buffer, 22, 1);
    rc.ChuuouChihouGaikoku = $R.chuuouChihouGaikoku.toCodeFromKol(buffer, 23, 1);
    rc.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 24, 1);
    rc.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 24, 1);
    rc.TokubetsuMei = this.tool.normalizeTokubetsuMei(buffer, 28, 30);
    rc.TanshukuTokubetsuMei = readStrWithNoSpace(buffer, 58, 14);
    rc.Grade = $R.grade.toCodeFromKol(buffer, 72, 1);
    rc.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromKol(buffer, 74, 2);
    rc.BetteiBareiHandiShousai = readStr(buffer, 76, 18);
    const joukenFuka1 = $R.joukenFuka1.toCodesFromKol(buffer, 94, 2);
    const joukenFuka2 = $R.joukenFuka2.toCodesFromKol(buffer, 96, 2);
    rc.JoukenFuka = this.tool.getJoukenFuka(joukenFuka1, joukenFuka2);
    rc.JoukenKei = $R.JoukenKei.toCodeFromKol(buffer, 98, 1);
    rc.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromKol(buffer, 99, 1);
    rc.Jouken1 = $R.jouken.toCodeFromKol(buffer, 100, 5);
    const raceClass = await this.tool.saveRaceClass(rc);
    return raceClass;
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