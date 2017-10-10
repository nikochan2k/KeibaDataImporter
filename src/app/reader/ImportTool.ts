import { Logger } from "log4js";
import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { readInt, readPositiveInt, readRaw } from "./Reader";
import { Tool } from "./Tool";
import { Kaisai } from "../entities/Kaisai";
import { Race } from "../entities/Race";
import { Shussouba } from "../entities/Shussouba";
import { ShussoubaJoutai, Kubun } from "../entities/ShussoubaJoutai";
import { Uma } from "../entities/Uma";
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
  uma?: Uma;
}

export abstract class ImportTool {

  protected logger: Logger;

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected tool: Tool;

  constructor() {
    this.logger = getLogger(this);
  }

  protected abstract getKaisaiInfo(buffer: Buffer): KaisaiInfo;

  /**
   * 年月日を示すIDを返します。
   * 年(7ビット)、月(4ビット)、日(5ビット)の計16ビットです。
   * @param {Buffer} buffer バッファ
   * @param {number} offset オフセット
   * @returns 年月日を示すID
   * @memberof ImportTool
   */
  public getDateId(buffer: Buffer, offset: number) {
    /* tslint:disable:triple-equals */
    const year = readInt(buffer, offset, 4);
    if (year == null) {
      return null;
    }
    const month = readInt(buffer, offset + 4, 2);
    if (month == null) {
      return null;
    }
    const day = readInt(buffer, offset + 6, 2);
    if (day == null) {
      return null;
    }
    /* tslint:enable:triple-equals */

    const id = year * (2 ** (4 + 5)) + month * (2 ** 5) + day;
    return id;
  }

  /**
   * 開催IDを返します。
   * 開催IDは年(7ビット)、回次(5ビット)、日次(5ビット)、場所(7ビット)の計24ビットです。
   * @protected
   * @param {KaisaiInfo} info 開催情報
   * @returns 開催ID
   * @memberof RaceTool
   */
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
    return this.entityManager.findOneById(Kaisai, id);
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

  /**
   * レースIDを返します。
   * レースIDは開催ID(24ビット)、レース番号(6ビット)の計30ビットです
   * @protected
   * @param {number} kaisaiId 開催ID
   * @param {number} raceBangou レース番号
   * @returns レースID
   * @memberof RaceTool
   */
  protected getRaceIdFrom(kaisaiId: number, raceBangou: number) {
    const id = kaisaiId * (2 ** 6) + raceBangou;
    return id;
  }

  /**
   * レースIDを返します。
   * レースIDは開催ID(24ビット)、レース番号(6ビット)の計30ビットです
   * @param {Buffer} buffer バッファ
   * @param {number} [kaisaiId] 開催ID
   * @returns レースID
   * @memberof RaceTool
   */
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
    return this.entityManager.findOneById(Race, id);
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

  /**
   * 出走馬IDを取得します。
   * 出走馬IDはレースID(30ビット)、馬番(6ビット)の計36ビットです。
   * @protected
   * @param {number} raceId レースID
   * @param {number} umaban 馬番
   * @returns 出走馬ID
   * @memberof RaceTool
   */
  protected getShussoubaIdFrom(raceId: number, umaban: number) {
    const id = raceId * (2 ** 6) + umaban;
    return id;
  }

  /**
   * 出走馬IDを取得します。
   * 出走馬IDはレースID(30ビット)、馬番(6ビット)の計36ビットです。
   * @param {Buffer} buffer バッファ
   * @param {number} umabanOffset 馬番のオフセット
   * @param {number} [raceId] レースID
   * @returns 出走馬ID
   * @memberof RaceTool
   */
  public getShussoubaId(buffer: Buffer, umabanOffset: number, raceId?: number) {
    if (!raceId) {
      raceId = this.getRaceId(buffer);
      if (!raceId) {
        return null;
      }
    }
    const umaban = readPositiveInt(buffer, umabanOffset, 2);
    if (!umaban) {
      this.logger.warn("不正な馬番です: " + readRaw(buffer, umabanOffset, 2));
      return null;
    }

    return this.getShussoubaIdFrom(raceId, umaban);
  }

  public getShussouba(buffer: Buffer, umabanOffset: number, raceId?: number) {
    const id = this.getShussoubaId(buffer, umabanOffset, raceId);
    if (!id) {
      return null;
    }
    return this.entityManager.findOneById(Shussouba, id);
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
    shussouba.Id = this.getShussoubaIdFrom(raceId, umaban);
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

  public async saveShussoubaJoutai(shussoubaId: number, kubun: Kubun, code: number) {
    const id = shussoubaId * (2 ** (4 + 10)) + kubun * (2 ** 10) + code;
    const toBe = new ShussoubaJoutai();
    toBe.Id = id;
    toBe.ShussoubaId = shussoubaId;
    toBe.Kubun = kubun;
    toBe.Code = code;

    const asIs = await this.entityManager.findOneById(ShussoubaJoutai, id);
    if (asIs) {
      return;
    }
    await this.entityManager.save(toBe);
  }

}