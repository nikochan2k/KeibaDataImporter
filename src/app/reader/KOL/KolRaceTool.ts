import { Inject, Service } from "typedi";
import * as $C from "../../converters/Common";
import * as $R from "../../converters/Race";
import { MeishouDao } from "../../daos/MeishouDao";
import { RaceDao } from "../../daos/RaceDao";
import { UmaDao } from "../../daos/UmaDao";
import { Race } from "../../entities/Race";
import { RaceHassouJoukyou } from "../../entities/RaceHassouJoukyou";
import { RaceLapTime } from "../../entities/RaceLapTime";
import { Record } from "../../entities/Record";
import { ShussoubaHassouJoukyou } from "../../entities/ShussoubaHassouJoukyou";
import { Uma } from "../../entities/Uma";
import { KaisaiInfo, RaceTool } from "../RaceTool";
import {
  readDate,
  readDouble,
  readPositiveInt,
  readRaw,
  readStr,
  readStrWithNoSpace,
  readTime
} from "../Reader";

export interface RaceLapTimeInfo {
  Offset: number;
  Length: number;
  KaishiKyori: number;
  ShuuryouKyori: number;
}

@Service()
export class KolRaceTool extends RaceTool {

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private meishouDao: MeishouDao;

  @Inject()
  private raceDao: RaceDao;

  protected getKaisaiInfo(buffer: Buffer): KaisaiInfo {
    /* tslint:disable:triple-equals */
    const year = readPositiveInt(buffer, 2, 4);
    if (year == null) {
      return null;
    }
    const basho = $C.basho.toCodeFromKol(buffer, 0, 2);
    if (basho == null) {
      this.logger.warn("不正な場所です: " + readRaw(buffer, 0, 2));
      return null;
    }
    const kaiji = readPositiveInt(buffer, 6, 2);
    const nichiji = readPositiveInt(buffer, 8, 2);
    const nengappi = readDate(buffer, 12, 8);
    if (nengappi == null) {
      this.logger.warn("日付が不正です: " + readRaw(buffer, 12, 8));
      return null;
    }
    const month = readPositiveInt(buffer, 16, 2);
    if (month == null || 12 < month) {
      this.logger.warn("月が不正です: " + readRaw(buffer, 16, 2));
      return null;
    }
    const day = readPositiveInt(buffer, 18, 2);
    if (day == null || 31 < month) {
      this.logger.warn("日が不正です: " + readRaw(buffer, 18, 2));
      return null;
    }
    /* tslint:enable:triple-equals */
    return {
      basho: basho,
      kaiji: kaiji,
      nichiji: nichiji,
      nengappi: nengappi,
      year: year,
      month: month,
      day: day
    };
  }

  protected getRaceBangou(buffer: Buffer) {
    const raceBangou = readPositiveInt(buffer, 10, 2);
    if (raceBangou === null) {
      this.logger.warn("不正なレース番号です: " + readRaw(buffer, 10, 2));
      return null;
    }
    return raceBangou;
  }

  public async getRecord(buffer: Buffer, offset: number, bashoOffset: number) {
    const bamei = readStrWithNoSpace(buffer, offset + 12, 30);
    if (!bamei) {
      return null;
    }

    const record = new Record();
    const nengappi = readDate(buffer, offset, 8);
    record.Nengappi = nengappi;
    record.Time = readTime(buffer, offset + 8, 4);
    const uma = new Uma();
    uma.Bamei = bamei;
    record.UmaId = (await this.umaDao.saveUma(uma)).Id;
    record.Kinryou = readDouble(buffer, offset + 42, 3, 0.1);
    const tanshukuKishuMei = readStrWithNoSpace(buffer, offset + 45, 8);
    const meishou = await this.meishouDao.save(tanshukuKishuMei);
    record.TanshukuKishuMeiId = meishou.Id;
    record.Basho = $C.basho.toCodeFromKol(buffer, bashoOffset, 2);
    return this.raceDao.saveRecord(record);
  }

  public async saveRaceHassouJoukyou(buffer: Buffer, offset: number, race: Race) {
    for (let bangou = 1; bangou <= 6; bangou++ , offset += 80) {
      const hassouJoukyou = readStr(buffer, offset, 80);
      if (!hassouJoukyou) {
        continue;
      }

      const rhj = new RaceHassouJoukyou();
      rhj.Id = race.Id * (2 ** 3) + bangou;
      rhj.RaceId = race.Id;
      rhj.HassouJoukyou = hassouJoukyou;
      const comment = hassouJoukyou.replace(/(\([0-9]+\))+/, "");
      rhj.Ichi = $R.ichi.toCodeFromKol(comment);
      rhj.Joukyou = $R.joukyou.toCodeFromKol(comment);
      let execed: RegExpExecArray;
      execed = /([0-9.]+|半)馬身(半)?/.exec(comment);
      if (execed) {
        const bashinStr = execed[1];
        let bashin: number;
        if (bashinStr === "半") {
          bashin = 0.5;
        } else {
          bashin = Number.parseFloat(bashinStr);
          if (execed[2]) {
            bashin += 0.5;
          }
        }
        if (0 < bashin) {
          rhj.FuriBashin = bashin;
        }
      }
      if (!rhj.FuriBashin) {
        execed = /([0-9.]+)秒/.exec(comment);
        if (execed) {
          const byou = Number.parseFloat(execed[1]);
          if (0 < byou) {
            rhj.FuriByou = byou;
          }
        }
      }
      await this.entityManager.getRepository(RaceHassouJoukyou).save(rhj);

      const umabans = /(\([0-9]+\))+/.exec(hassouJoukyou);
      for (let i = 1; i < umabans.length; i++) {
        const temp = umabans[i];
        const umaban = Number.parseInt(temp.replace(/[\(\)]/, ""));
        if (0 < umaban) {
          const shj = new ShussoubaHassouJoukyou();
          shj.Id = rhj.Id * (2 ** 6) + umaban;
          shj.RaceHassouJoukyouId = rhj.Id;
          shj.ShussoubaId = race.Id * (2 ** 6) + umaban;
          await this.entityManager.getRepository(ShussoubaHassouJoukyou).save(shj);
        }
      }
    }
  }

  public async saveSpecialRaceLapTime(buffer: Buffer, race: Race, infos: RaceLapTimeInfo[]) {
    const raceLapTime = new RaceLapTime();
    raceLapTime.RaceId = race.Id;
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      raceLapTime.LapTime = readDouble(buffer, info.Offset, 3, 0.1);
      if (raceLapTime.LapTime) {
        raceLapTime.Id = race.Id * (2 ** 5) + i + 1;
        raceLapTime.KaishiKyori = info.KaishiKyori;
        raceLapTime.ShuuryouKyori = info.ShuuryouKyori;
        await this.entityManager.save(raceLapTime);
      }
    }
  }
}