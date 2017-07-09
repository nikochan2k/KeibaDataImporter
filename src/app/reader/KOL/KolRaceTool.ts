import { Logger } from "log4js";
import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import * as $C from "../../converters/Common";
import * as $R from "../../converters/Race";
import { KishuDao } from "../../daos/KishuDao";
import { RaceDao } from "../../daos/RaceDao";
import { UmaDao } from "../../daos/UmaDao";
import { Kishu } from "../../entities/Kishu";
import { Race } from "../../entities/Race";
import { RaceHassouJoukyou } from "../../entities/RaceHassouJoukyou";
import { RaceLapTime } from "../../entities/RaceLapTime";
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

  public createRace(buffer: Buffer) {
    const info = this.getRaceInfo(buffer);
    if (!info) {
      return null;
    }
    const race = new Race();
    race.Id = this.tool.getRaceId(info.days, info.basho, info.raceBangou);
    race.Basho = info.basho;
    race.Kaiji = readPositiveInt(buffer, 6, 2);
    race.Nichiji = readPositiveInt(buffer, 8, 2);
    race.RaceBangou = info.raceBangou;
    race.Nengappi = readDate(buffer, 12, 8);
    return race;
  }

  public getRace(buffer: Buffer) {
    const info = this.getRaceInfo(buffer);
    if (!info) {
      return null;
    }
    const id = this.tool.getRaceId(info.days, info.basho, info.raceBangou);
    return this.entityManager.getRepository(Race).findOneById(id);
  }

  public createShussouba(buffer: Buffer, umabanOffset: number) {
    const umaban = readPositiveInt(buffer, umabanOffset, 2);
    if (!umaban) {
      this.logger.warn("不正な馬番です: " + readRaw(buffer, umabanOffset, 2));
      return null;
    }
    const raceId = this.getRaceId(buffer);
    const shussouba = new Shussouba();
    shussouba.Id = raceId * (2 ** 6) + umaban;
    shussouba.RaceId = raceId;
    shussouba.Umaban = umaban;
    return shussouba;
  }

  public async getShussoubaInfo(buffer: Buffer, umabanOffset: number) {
    const umaban = readPositiveInt(buffer, umabanOffset, 2);
    if (!umaban) {
      this.logger.warn("不正な馬番です: " + readRaw(buffer, umabanOffset, 2));
      return null;
    }

    const race = await this.getRace(buffer);
    if (!race) {
      this.logger.warn("レースデータが存在しません: " + race.Id);
      return null;
    }

    const id = race.Id * (2 ** 6) + umaban;
    const shussouba = await this.entityManager.findOneById(Shussouba, id);
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

  public async saveRaceLapTime(buffer: Buffer, race: Race, infos: RaceLapTimeInfo[]) {
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