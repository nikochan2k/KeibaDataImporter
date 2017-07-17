import { Logger } from "log4js";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import {
  readPositiveInt,
  readRaw,
  readDouble
} from "./Reader";
import { Race } from "../entities/Race";
import { RaceLapTime } from "../entities/RaceLapTime";
import { Shussouba } from "../entities/Shussouba";
import { getLogger } from "../LogUtil";

export interface RaceInfo {
  basho: number;
  years: number;
  kaiji: number;
  nichiji: number;
  date?: number;
  month?: number;
  day?: number;
  raceBangou: number;
}

export abstract class RaceTool {

  protected logger: Logger;

  @OrmEntityManager()
  protected entityManager: EntityManager;

  constructor() {
    this.logger = getLogger(this);
  }

  protected abstract getRaceInfo(buffer: Buffer): RaceInfo;

  protected getRaceIdFromRaceInfo(info: RaceInfo) {
    let kaiji = info.kaiji || 0;
    let nichiji = info.nichiji || 0;
    if (kaiji === 0 && nichiji === 0) {
      kaiji = info.month;
      nichiji = info.day;
    }
    const id = info.years * (2 ** (5 + 5 + 7 + 6))
      + kaiji * (2 ** (5 + 7 + 6))
      + nichiji * (2 ** (7 + 6))
      + info.basho * (2 ** 6)
      + info.raceBangou;
    return id;
  }

  public getRaceId(buffer: Buffer) {
    const info = this.getRaceInfo(buffer);
    if (!info) {
      return null;
    }
    return this.getRaceIdFromRaceInfo(info);
  }

  public getRace(buffer: Buffer) {
    const info = this.getRaceInfo(buffer);
    if (!info) {
      return null;
    }
    const id = this.getRaceIdFromRaceInfo(info);
    return this.entityManager.getRepository(Race).findOneById(id);
  }

  public createRace(buffer: Buffer) {
    const info = this.getRaceInfo(buffer);
    if (!info) {
      return null;
    }
    const race = new Race();
    race.Id = this.getRaceIdFromRaceInfo(info);
    race.Basho = info.basho;
    race.Kaiji = info.kaiji;
    race.Nichiji = info.nichiji;
    race.RaceBangou = info.raceBangou;
    return race;
  }

  public createShussouba(buffer: Buffer, umabanOffset: number) {
    const raceId = this.getRaceId(buffer);
    if (raceId === null) {
      return null;
    }
    const umaban = readPositiveInt(buffer, umabanOffset, 2);
    if (!umaban) {
      this.logger.warn("不正な馬番です: " + readRaw(buffer, umabanOffset, 2));
      return null;
    }
    const shussouba = new Shussouba();
    shussouba.Id = raceId * (2 ** 6) + umaban;
    shussouba.RaceId = raceId;
    shussouba.Umaban = umaban;
    return shussouba;
  }

  public async getShussoubaInfo(buffer: Buffer, umabanOffset: number) {
    const race = await this.getRace(buffer);
    if (!race) {
      this.logger.warn("レースデータが存在しません: " + race.Id);
      return null;
    }

    const umaban = readPositiveInt(buffer, umabanOffset, 2);
    if (!umaban) {
      this.logger.warn("不正な馬番です: " + readRaw(buffer, umabanOffset, 2));
      return null;
    }

    const id = race.Id * (2 ** 6) + umaban;
    const shussouba = await this.entityManager.findOneById(Shussouba, id);
    return { race: race, shussouba: shussouba };
  }


  public normalizeNenrei(race: Race, shussouba: Shussouba) {
    if (race.Nengappi < 20010000) {
      shussouba.Nenrei--;
    }
  }

  public getChakujun(buffer, offset, length) {
    const chakujun = readPositiveInt(buffer, offset, length);
    if (1 <= chakujun && chakujun <= 28) {
      return chakujun;
    }
    return null;
  }

  public getJoukenFuka(...joukenFukaLists: number[][]) {
    let joukenFuka = 0;
    joukenFukaLists.forEach((joukenFukaList) => {
      if (joukenFukaList) {
        joukenFukaList.forEach((item) => {
          joukenFuka |= item;
        });
      }
    });
    return joukenFuka;
  }

  public async saveRaceLapTime(buffer: Buffer, offset: number, race: Race) {
    if (!race.Kyori) {
      this.logger.warn("距離が不明です: " + race.Id);
      return;
    }
    const end = Math.ceil(race.Kyori / 200.0);
    const odd = (race.Kyori % 200 !== 0);
    let shuuryouKyori = 0;
    for (let i = 0; i < end; i++ , offset += 3) {
      const lapTime = readDouble(buffer, offset, 3, 0.1);
      if (!lapTime) {
        continue;
      }
      const raceLapTime = new RaceLapTime();
      raceLapTime.Id = race.Id * (2 ** 5) + i;
      raceLapTime.RaceId = race.Id;
      raceLapTime.KaishiKyori = shuuryouKyori;
      shuuryouKyori = (i === 0 && odd) ? (race.Kyori % 200) : (shuuryouKyori + 200);
      raceLapTime.ShuuryouKyori = shuuryouKyori;
      raceLapTime.LapTime = lapTime;
      await this.entityManager.save(raceLapTime);
    }
  }

}