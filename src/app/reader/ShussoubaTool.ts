import { Logger } from "log4js";
import { findOneBy, upsert } from "../db/helpers";
import { Race } from "../entities/Race";
import { Shussouba } from "../entities/Shussouba";
import { Kubun, ShussoubaJoutai } from "../entities/ShussoubaJoutai";
import { Uma } from "../entities/Uma";
import { getLogger } from "../LogUtil";
import { readPositiveInt, readRaw } from "./Reader";

export interface ShussoubaInfo {
  race: Race;
  shussouba: Shussouba;
  uma?: Uma;
}

export interface RaceShussoubaId {
  raceId: number;
  shussoubaId: number;
  umaban: number;
}

export abstract class ShussoubaTool {
  protected logger: Logger;

  constructor() {
    this.logger = getLogger(this);
  }

  /**
   * 出走馬IDを取得します。
   * 出走馬IDはレースID(28ビット)、馬番(6ビット)の計34ビットです。
   * @protected
   * @param {number} raceId レースID
   * @param {number} umaban 馬番
   * @returns 出走馬ID
   * @memberof RaceTool
   */
  protected getShussoubaIdFrom(raceId: number, umaban: number) {
    const id = raceId * 2 ** 6 + umaban;
    return id;
  }

  protected abstract getRaceId(buffer: Buffer): number;

  /**
   * レースIDと出走馬IDを取得します。
   * 出走馬IDはレースID(28ビット)、馬番(6ビット)の計34ビットです。
   * @param {Buffer} buffer バッファ
   * @param {number} umabanOffset 馬番のオフセット
   * @param {number} [raceId] レースID
   * @returns 出走馬ID
   * @memberof RaceTool
   */
  public getRaceShussoubaId(
    buffer: Buffer,
    umabanOffset: number,
    raceId?: number,
  ): RaceShussoubaId {
    raceId = raceId || this.getRaceId(buffer);
    if (!raceId) {
      this.logger.warn(`レースIDがありません: ${raceId}`);
      return null;
    }
    let umaban = readPositiveInt(buffer, umabanOffset, 2);
    if (umaban == null) {
      this.logger.debug(`不正な馬番です: ${readRaw(buffer, umabanOffset, 2)}`);
      umaban = 0;
    }

    const shussoubaId = this.getShussoubaIdFrom(raceId, umaban);
    return {
      raceId: raceId,
      shussoubaId: shussoubaId,
      umaban: umaban,
    };
  }

  public getShussouba(buffer: Buffer, umabanOffset: number, raceId?: number) {
    const rsId = this.getRaceShussoubaId(buffer, umabanOffset, raceId);
    if (!rsId) {
      return null;
    }
    return findOneBy(Shussouba, { Id: rsId.shussoubaId });
  }

  public createShussouba(buffer: Buffer, umabanOffset: number, raceId?: number) {
    const rsId = this.getRaceShussoubaId(buffer, umabanOffset, raceId);
    if (!rsId) {
      return null;
    }
    const shussouba = {} as Shussouba;
    shussouba.Id = rsId.shussoubaId;
    shussouba.RaceId = rsId.raceId;
    shussouba.Umaban = rsId.umaban;
    return shussouba;
  }

  public async getShussoubaInfo(
    buffer: Buffer,
    umabanOffset: number,
    raceId?: number,
  ): Promise<ShussoubaInfo> {
    const rsId = this.getRaceShussoubaId(buffer, umabanOffset, raceId);
    if (!rsId) {
      return null;
    }

    const race = await findOneBy(Race, { Id: rsId.raceId });
    if (!race) {
      return null;
    }

    const id = rsId.raceId * 2 ** 6 + rsId.umaban;
    const shussouba = await findOneBy(Shussouba, { Id: id });
    return { race: race, shussouba: shussouba };
  }

  public async saveShussoubaJoutai(shussoubaId: number, kubun: Kubun, code: number) {
    const id = shussoubaId * 2 ** (4 + 10) + kubun * 2 ** 10 + code;
    const toBe = {} as ShussoubaJoutai;
    toBe.Id = id;
    toBe.ShussoubaId = shussoubaId;
    toBe.Kubun = kubun;
    toBe.Code = code;

    upsert(ShussoubaJoutai, toBe);
  }
}
