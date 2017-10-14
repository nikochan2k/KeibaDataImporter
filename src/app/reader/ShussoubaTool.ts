import { Logger } from "log4js";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { readPositiveInt, readRaw } from "./Reader";
import { Race } from "../entities/Race";
import { Shussouba } from "../entities/Shussouba";
import { ShussoubaJoutai, Kubun } from "../entities/ShussoubaJoutai";
import { Uma } from "../entities/Uma";
import { getLogger } from "../LogUtil";


export interface ShussoubaInfo {
  race: Race;
  shussouba: Shussouba;
  uma?: Uma;
}

export abstract class ShussoubaTool {

  protected logger: Logger;

  @OrmManager()
  protected entityManager: EntityManager;

  constructor() {
    this.logger = getLogger(this);
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
  public getShussoubaId(buffer: Buffer, umabanOffset: number, raceId: number) {
    const umaban = readPositiveInt(buffer, umabanOffset, 2);
    if (!umaban) {
      this.logger.warn("不正な馬番です: " + readRaw(buffer, umabanOffset, 2));
      return null;
    }

    return this.getShussoubaIdFrom(raceId, umaban);
  }

  public getShussouba(buffer: Buffer, umabanOffset: number, raceId: number) {
    const id = this.getShussoubaId(buffer, umabanOffset, raceId);
    if (!id) {
      return null;
    }
    return this.entityManager.findOneById(Shussouba, id);
  }

  public createShussouba(buffer: Buffer, umabanOffset: number, raceId: number) {
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

  public async getShussoubaInfo(buffer: Buffer, umabanOffset: number, race: Race): Promise<ShussoubaInfo> {
    const umaban = readPositiveInt(buffer, umabanOffset, 2);
    if (!umaban) {
      this.logger.warn("不正な馬番です: " + readRaw(buffer, umabanOffset, 2));
      return null;
    }

    const id = race.Id * (2 ** 6) + umaban;
    const shussouba = await this.entityManager.findOneById(Shussouba, id);
    return { race: race, shussouba: shussouba };
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