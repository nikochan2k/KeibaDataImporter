import { Logger } from "log4js";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import {
  readPositiveInt,
  readRaw,
  readDouble
} from "./Reader";
import { Kaisai } from "../entities/Kaisai";
import { Race } from "../entities/Race";
import { RaceLapTime } from "../entities/RaceLapTime";
import { Shussouba } from "../entities/Shussouba";
import { getLogger } from "../LogUtil";

export interface KaisaiInfo {
  basho: number;
  kaiji: number;
  nichiji: number;
  nengappi?: number;
  year: number;
  month?: number;
  day?: number;
}

export interface ShussoubaInfo {
  kaisai: Kaisai;
  race: Race;
  shussouba: Shussouba;
}

export abstract class RaceTool {

  protected logger: Logger;

  @OrmEntityManager()
  protected entityManager: EntityManager;

  constructor() {
    this.logger = getLogger(this);
  }

  protected abstract getKaisaiInfo(buffer: Buffer): KaisaiInfo;

  protected getKaisaiIdFrom(info: KaisaiInfo) {
    let kaiji = info.kaiji || 0;
    let nichiji = info.nichiji || 0;
    if (kaiji === 0 && nichiji === 0) {
      kaiji = info.month;
      nichiji = info.day;
    }
    const years = info.year - 1970;
    const id = years * (2 ** (5 + 5 + 7))
      + kaiji * (2 ** (5 + 7))
      + nichiji * (2 ** 7)
      + info.basho;
    return id;
  }

  public getKaisaiId(buffer: Buffer) {
    const info = this.getKaisaiInfo(buffer);
    if (!info) {
      return null;
    }
    const id = this.getKaisaiIdFrom(info);
    return id;
  }

  public getKaisai(buffer: Buffer) {
    const id = this.getKaisaiId(buffer);
    return this.entityManager.getRepository(Kaisai).findOneById(id);
  }

  public createKaisai(buffer: Buffer) {
    const info = this.getKaisaiInfo(buffer);
    if (!info) {
      return null;
    }
    const kaisai = new Kaisai();
    kaisai.Id = this.getKaisaiIdFrom(info);
    kaisai.Basho = info.basho;
    kaisai.Kaiji = info.kaiji;
    kaisai.Nichiji = info.nichiji;
    kaisai.Nen = info.year;
    kaisai.Nengappi = info.nengappi;
    return kaisai;
  }

  protected abstract getRaceBangou(buffer: Buffer): number;

  protected getRaceIdFrom(kaisaiId: number, raceBangou: number) {
    const id = kaisaiId * (2 ** 6) + raceBangou;
    return id;
  }

  public getRaceId(buffer: Buffer, kaisaiId?: number) {
    if (!kaisaiId) {
      kaisaiId = this.getKaisaiId(buffer);
      if (!kaisaiId) {
        return null;
      }
    }
    const raceBagou = this.getRaceBangou(buffer);
    if (!raceBagou) {
      return null;
    }
    return this.getRaceIdFrom(kaisaiId, raceBagou);
  }

  public getRace(buffer: Buffer, kaisaiId?: number) {
    const id = this.getRaceId(buffer, kaisaiId);
    if (!id) {
      return null;
    }
    return this.entityManager.getRepository(Race).findOneById(id);
  }

  public createRace(buffer: Buffer, kaisaiId?: number) {
    if (!kaisaiId) {
      kaisaiId = this.getKaisaiId(buffer);
      if (!kaisaiId) {
        return null;
      }
    }
    const raceBangou = this.getRaceBangou(buffer);
    if (!raceBangou) {
      return null;
    }
    const race = new Race();
    race.Id = this.getRaceIdFrom(kaisaiId, raceBangou);
    race.KaisaiId = kaisaiId;
    race.RaceBangou = raceBangou;
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

  public async getShussoubaInfo(buffer: Buffer, umabanOffset: number): Promise<ShussoubaInfo> {
    const kaisai = await this.getKaisai(buffer);
    if (!kaisai) {
      const kaisaiId = this.getKaisaiId(buffer);
      this.logger.warn("開催データが存在しません: " + kaisaiId);
      return null;
    }

    const race = await this.getRace(buffer, kaisai.Id);
    if (!race) {
      const raceId = this.getRaceId(buffer);
      this.logger.warn("レースデータが存在しません: " + raceId);
      return null;
    }

    const umaban = readPositiveInt(buffer, umabanOffset, 2);
    if (!umaban) {
      this.logger.warn("不正な馬番です: " + readRaw(buffer, umabanOffset, 2));
      return null;
    }

    const id = race.Id * (2 ** 6) + umaban;
    const shussouba = await this.entityManager.findOneById(Shussouba, id);
    return { kaisai: kaisai, race: race, shussouba: shussouba };
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