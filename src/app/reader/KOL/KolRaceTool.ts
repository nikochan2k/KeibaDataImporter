import { Logger } from "log4js";
import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import * as $C from "../../converters/Common";
import * as $R from "../../converters/Race";
import { HaitouInfo } from "../../converters/RaceHaitou";
import { ShoukinInfo } from "../../converters/RaceShoukin";
import { KishuDao } from "../../daos/KishuDao";
import { RaceDao } from "../../daos/RaceDao";
import { UmaDao } from "../../daos/UmaDao";
import { Kishu } from "../../entities/Kishu";
import { Race } from "../../entities/Race";
import { RaceHaitou } from "../../entities/RaceHaitou";
import { RaceHassouJoukyou } from "../../entities/RaceHassouJoukyou";
import { RaceLapTime } from "../../entities/RaceLapTime";
import { RaceShoukin } from "../../entities/RaceShoukin";
import { Record } from "../../entities/Record";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaHassouJoukyou } from "../../entities/ShussoubaHassouJoukyou";
import { Uma } from "../../entities/Uma";
import { getLogger } from "../../LogUtil";
import { DataTool } from "../DataTool";
import {
  readDate,
  readDouble,
  readInt,
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
export class KolRaceTool {

  private logger: Logger;

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: DataTool;

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private kishuDao: KishuDao;

  @Inject()
  private raceDao: RaceDao;

  constructor() {
    this.logger = getLogger(this);
  }

  public async deleteOldShutsubahyou(race: Race) {
    await this.entityManager
      .createQueryBuilder(RaceShoukin, "rs")
      .delete()
      .where("rs.RaceId = :raceId")
      .andWhere("rs.Kakutei = 0")
      .setParameter("raceId", race.Id)
      .execute();
  }

  protected getRaceInfo(buffer: Buffer) {
    /* tslint:disable:triple-equals */
    const year = readPositiveInt(buffer, 12, 4);
    if (year == null) {
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
    const date = new Date(year, month - 1, day);
    const time = date.getTime();
    if (isNaN(time)) {
      this.logger.warn("不正な日付です");
      return null;
    }
    const days = (time / (24 * 60 * 60 * 1000)) | 0;
    const basho = $C.basho.toCodeFromKol(buffer, 0, 2);
    if (basho == null) {
      this.logger.warn("不正な場所です: " + readRaw(buffer, 0, 2));
      return null;
    }
    const raceBangou = readInt(buffer, 10, 2);
    if (raceBangou == null) {
      this.logger.warn("不正なレース番号です: " + readRaw(buffer, 10, 2));
      return null;
    }
    /* tslint:enable:triple-equals */
    return { days: days, basho: basho, raceBangou: raceBangou };
  }

  public getRaceId(buffer: Buffer) {
    const info = this.getRaceInfo(buffer);
    if (!info) {
      return null;
    }
    return this.tool.getRaceId(info.days, info.basho, info.raceBangou);
  }

  public async getRace(buffer: Buffer) {
    const info = this.getRaceInfo(buffer);
    if (!info) {
      return null;
    }
    const id = this.tool.getRaceId(info.days, info.basho, info.raceBangou);
    let race = await this.entityManager.getRepository(Race).findOneById(id);
    if (!race) {
      race = new Race();
      race.Id = id;
      race.Basho = info.basho;
      race.Kaiji = readPositiveInt(buffer, 6, 2);
      race.Nichiji = readPositiveInt(buffer, 8, 2);
      race.RaceBangou = info.raceBangou;
      race.Nengappi = readDate(buffer, 12, 8);
    }
    return race;
  }

  public async getShussoubaInfo(buffer: Buffer, umabanOffset: number) {
    const umaban = readPositiveInt(buffer, umabanOffset, 2);
    if (!umaban) {
      this.logger.warn("不正な馬番です: " + readRaw(buffer, umabanOffset, 2));
      return null;
    }

    const race = await this.getRace(buffer);
    /* tslint:disable:triple-equals */
    if (!race || race.Youbi == null) {
      this.logger.warn("レースデータが存在しません: " + race.Id);
      return null;
    }
    /* tslint:enable:triple-equals */

    const id = race.Id * 100 + umaban;
    let shussouba = await this.entityManager.findOneById(Shussouba, id);
    if (!shussouba) {
      shussouba = new Shussouba();
      shussouba.Id = id;
      shussouba.RaceId = race.Id;
      shussouba.Umaban = umaban;
    }
    return { race: race, shussouba: shussouba };
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
    const kishu = new Kishu();
    kishu.TanshukuKishuMei = readStrWithNoSpace(buffer, offset + 45, 8);
    kishu.FromDate = nengappi;
    kishu.ToDate = nengappi;
    kishu.TanshukuKishuMei = readStrWithNoSpace(buffer, offset + 45, 8);
    record.KishuId = (await this.kishuDao.saveKishu(kishu)).Id;
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
      rhj.Id = race.Id * 10 + bangou;
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
          shj.Id = rhj.Id * 100 + umaban;
          shj.RaceHassouJoukyouId = rhj.Id;
          shj.ShussoubaId = race.Id * 100 + umaban;
          await this.entityManager.getRepository(ShussoubaHassouJoukyou).save(shj);
        }
      }
    }
  }

  public async saveRaceLapTime(buffer: Buffer, race: Race, infos: RaceLapTimeInfo[]) {
    const raceLapTime = new RaceLapTime();
    raceLapTime.RaceId = race.Id;
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      raceLapTime.LapTime = readDouble(buffer, info.Offset, 3, 0.1);
      if (raceLapTime.LapTime) {
        raceLapTime.Id = race.Id * 100 + i + 1;
        raceLapTime.KaishiKyori = info.KaishiKyori;
        raceLapTime.ShuuryouKyori = info.ShuuryouKyori;
        await this.entityManager.save(raceLapTime);
      }
    }
  }

  public async saveRaceShoukin(buffer: Buffer, race: Race, infos: ShoukinInfo[],
    kakutei: number, mul?: number) {
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const shoukin = readPositiveInt(buffer, info.offset, info.length, mul);
      if (!shoukin) {
        continue;
      }
      const raceShoukin = new RaceShoukin();
      raceShoukin.Id = race.Id * 1000 + kakutei * 100 + info.fukashou * 10 + info.chakujun;
      raceShoukin.RaceId = race.Id;
      raceShoukin.Kakutei = kakutei;
      raceShoukin.Chakujun = info.chakujun;
      raceShoukin.Shoukin = shoukin;
      raceShoukin.Fukashou = info.fukashou;
      await this.entityManager.save(raceShoukin);
    }
  }

  public async saveRaceHaitou(buffer: Buffer, race: Race, infos: HaitouInfo[]) {
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const bangou1 = readPositiveInt(buffer, info.bangou1, info.bangou1Len);
      if (!bangou1) {
        continue;
      }
      const raceHaitou = new RaceHaitou();
      raceHaitou.Id = race.Id * 100 + info.baken * 10 + info.index;
      raceHaitou.RaceId = race.Id;
      raceHaitou.Baken = info.baken;
      raceHaitou.Bangou1 = bangou1;
      if (info.bangou2) {
        raceHaitou.Bangou2 = readPositiveInt(buffer, info.bangou2, info.bangou2Len);
      }
      if (info.bangou3) {
        raceHaitou.Bangou3 = readPositiveInt(buffer, info.bangou3, info.bangou3Len);
      }
      raceHaitou.Haitoukin = readPositiveInt(buffer, info.haitou, info.haitouLen);
      if (info.ninki) {
        raceHaitou.Ninki = readPositiveInt(buffer, info.ninki, info.ninkiLen);
      }
      await this.entityManager.save(raceHaitou);
    }
  }
}