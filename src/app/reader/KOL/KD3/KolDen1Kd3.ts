import { Inject, Service } from "typedi";
import * as $R from "../../../converters/Race";
import { Race } from "../../../entities/Race";
import { Bridge } from "../../Bridge";
import { KolBridge } from "../KolBridge";
import { DataToImport } from "../../DataToImport";
import { Tool } from "../../Tool";
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
  private tool: Tool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 848;
  }

  protected setup(bridge: Bridge) {
    const kolBridge = <KolBridge>bridge;
    kolBridge.yosouTenkaiMap = new Map<number, number>();
  }

  public async save(buffer: Buffer, bridge: Bridge) {
    const asIs = await this.kolRaceTool.getRace(buffer);
    if (asIs) {
      const dataSakuseiNengappi = readDate(buffer, 418, 8);
      if (dataSakuseiNengappi <= asIs.KolShutsubahyouSakuseiNengappi) {
        this.logger.info("既に最新の出走馬レースデータが格納されています: " + asIs.Id);
        return;
      }
    }

    const race = await this.saveRace(buffer, asIs);
    if (!race) {
      return;
    }
    this.setYosouTenkai(buffer, race, <KolBridge>bridge);
  }

  protected async saveRace(buffer: Buffer, asIs: Race) {
    let toBe = this.kolRaceTool.createRace(buffer);
    if (!toBe) {
      return null;
    }
    if (!asIs || !asIs.KolSeisekiSakuseiNengappi) {
      toBe.Nengappi = readDate(buffer, 12, 8);
      toBe.Kyuujitsu = $R.kyuujitsu.toCodeFromKol(buffer, 20, 1);
      toBe.Youbi = $R.youbi.toCodeFromKol(buffer, 21, 1);
      toBe.ChuuouChihouGaikoku = $R.chuuouChihouGaikoku.toCodeFromKol(buffer, 22, 1);
      toBe.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 23, 1);
      toBe.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 24, 1);
      toBe.JuushouKaisuu = readPositiveInt(buffer, 25, 3);
      toBe.TokubetsuMei = this.tool.normalizeTokubetsuMei(buffer, 28, 30);
      toBe.TanshukuTokubetsuMei = readStrWithNoSpace(buffer, 58, 14);
      toBe.Grade = $R.grade.toCodeFromKol(buffer, 72, 1);
      toBe.Grade += $R.jpnFlag.toCodeFromKol(buffer, 73, 1);
      toBe.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromKol(buffer, 74, 2);
      const betteiBareiHandiShousai = readStr(buffer, 76, 18);
      if (toBe.BetteiBareiHandi === null) {
        toBe.BetteiBareiHandi = $R.betteiBareiHandi2.toCodeFromKol(betteiBareiHandiShousai);
      }
      if (toBe.BetteiBareiHandi === null) {
        toBe.BetteiBareiHandiReigai = betteiBareiHandiShousai;
      }
      const joukenFuka1 = $R.joukenFuka1.toCodesFromKol(buffer, 94, 2);
      const joukenFuka2 = $R.joukenFuka2.toCodesFromKol(buffer, 96, 2);
      const joukenKei = $R.joukenKei.toCodesFromKol(buffer, 98, 1);
      toBe.JoukenFuka = this.kolRaceTool.getJoukenFuka(joukenFuka1, joukenFuka2, joukenKei);
      toBe.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromKol(buffer, 99, 1);
      if (toBe.JoukenNenreiSeigen === null) {
        toBe.JoukenNenreiSeigen = $R.joukenNenreiSeigen2.toCodeFromKol(buffer, 98, 1);
      }
      toBe.Jouken1 = $R.jouken.toCodeFromKol(buffer, 100, 5);
      toBe.DirtShiba = $R.dirtShiba.toCodeFromKol(buffer, 105, 1);
      toBe.MigiHidari = $R.migiHidari.toCodeFromKol(buffer, 106, 1);
      toBe.UchiSoto = $R.uchiSoto.toCodeFromKol(buffer, 107, 1);
      toBe.Course = $R.course.toCodeFromKol(buffer, 108, 1);
      toBe.Kyori = readPositiveInt(buffer, 109, 4);
      const courceRecord = await this.kolRaceTool.getRecord(buffer, 114, 0);
      toBe.CourseRecordId = courceRecord && courceRecord.Id;
      const kyoriRecord = await this.kolRaceTool.getRecord(buffer, 167, 220);
      toBe.KyoriRecordId = kyoriRecord && kyoriRecord.Id;
      const raceRecord = await this.kolRaceTool.getRecord(buffer, 222, 275);
      toBe.RaceRecordId = raceRecord && raceRecord.Id;
      toBe.Shoukin1Chaku = readPositiveInt(buffer, 277, 9);
      toBe.Shoukin2Chaku = readPositiveInt(buffer, 286, 9);
      toBe.Shoukin3Chaku = readPositiveInt(buffer, 295, 9);
      toBe.Shoukin4Chaku = readPositiveInt(buffer, 304, 9);
      toBe.Shoukin5Chaku = readPositiveInt(buffer, 313, 9);
      toBe.FukaShou = readPositiveInt(buffer, 351, 9);
      toBe.MaeuriFlag = $R.maeuriFlag.toCodeFromKol(buffer, 331, 1);
      toBe.YoteiHassouJikan = readStr(buffer, 332, 5);
      toBe.Tousuu = readPositiveInt(buffer, 337, 2);
      toBe.TorikeshiTousuu = readInt(buffer, 339, 2);
    }

    toBe.SuiteiTimeRyou = readTime(buffer, 341, 4);
    toBe.SuiteiTimeOmoFuryou = readTime(buffer, 345, 4);
    toBe.YosouPace = $R.pace.toCodeFromKol(buffer, 349, 1);
    toBe.KolShutsubahyouSakuseiNengappi = readDate(buffer, 418, 8);

    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, false);
      if (updateSet) {
        await this.entityManager
          .createQueryBuilder()
          .update(Race, updateSet)
          .where("Id = :id")
          .setParameter("id", asIs.Id)
          .execute();
      }
      toBe = asIs;
    } else {
      toBe = await this.entityManager.save(toBe);
    }

    return toBe;
  }

  protected setYosouTenkai(buffer: Buffer, race: Race, bridge: KolBridge) {
    [362, 374, 386, 398].forEach((offset, index) => {
      for (let i = 0; i < 4; i++) {
        const umaban = readInt(buffer, offset + i * 2, 2);
        if (1 <= umaban && umaban <= 28) {
          const shussoubaId = race.Id * (2 ** 6) + umaban;
          bridge.yosouTenkaiMap.set(shussoubaId, index + 1);
        }
      }
    });
  }

}