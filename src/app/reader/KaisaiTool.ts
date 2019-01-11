import { Logger } from "log4js";
import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { Tool } from "./Tool";
import { Kaisai } from "../entities/Kaisai";
import { getLogger } from "../LogUtil";

export interface KaisaiInfo {
  basho: number;
  nen: number;
  gatsu: number;
  nichi: number;
  kaiji?: number;
  nichiji?: number;
}

export abstract class KaisaiTool {

  protected logger: Logger;

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  private tool: Tool;

  constructor() {
    this.logger = getLogger(this);
  }

  protected abstract getKaisaiInfo(buffer: Buffer): KaisaiInfo;

  /**
   * 開催IDを返します。
   * 開催IDは場所(7ビット)、1970年1月1日からの経過日数(15ビット)の計22ビットです。
   * @protected
   * @param {KaisaiInfo} info 開催情報
   * @returns 開催ID
   * @memberof KaisaiTool
   */
  protected generateKaisaiId(info: KaisaiInfo) {
    const daysFrom1970 = this.tool.getDaysFrom1970With(info.nen, info.gatsu, info.nichi);
    const id = daysFrom1970 * (2 ** 7) + info.basho;
    return id;
  }

  protected generateKaisaiKeyWith(nen: number, kaiji: number, nichiji: number) {
    const yy = nen - 1970;
    const key = yy * (2 ** (5 + 5 + 7))
      + kaiji * (2 ** (5 + 7))
      + nichiji * (2 ** 7);
    return key;
  }

  protected generateKaisaiKey(info: KaisaiInfo) {
    const kaiji = info.kaiji || 0;
    const nichiji = info.nichiji || 0;
    return this.generateKaisaiKeyWith(info.nen, kaiji, nichiji);
  }

  public getKaisaiId(buffer: Buffer) {
    const info = this.getKaisaiInfo(buffer);
    if (!info) {
      return null;
    }
    const id = this.generateKaisaiId(info);
    return id;
  }

  protected getKaisaiKey(buffer: Buffer) {
    const info = this.getKaisaiInfo(buffer);
    if (!info) {
      return null;
    }
    return this.generateKaisaiKey(info);
  }

  public getKaisaiWithId(buffer: Buffer) {
    const id = this.getKaisaiId(buffer);
    return this.entityManager.findOne(Kaisai, id);
  }

  public getKaisaiWithKey(buffer: Buffer) {
    const key = this.getKaisaiKey(buffer);
    // 開催は悪天により日付がずれる可能性があるので、最新のものを取得する。
    return this.entityManager
      .createQueryBuilder(Kaisai, "k")
      .where("Key = :key")
      .setParameter("key", key)
      .orderBy("Id", "DESC")
      .getOne();
  }

  public createKaisai(buffer: Buffer) {
    const info = this.getKaisaiInfo(buffer);
    if (!info) {
      return null;
    }
    const kaisai = new Kaisai();
    kaisai.Id = this.generateKaisaiId(info);
    kaisai.Key = this.generateKaisaiKey(info);
    kaisai.Basho = info.basho;
    kaisai.Nen = info.nen;
    kaisai.Gatsu = info.gatsu;
    kaisai.Nichi = info.nichi;
    kaisai.Kaiji = info.kaiji;
    kaisai.Nichiji = info.nichiji;
    return kaisai;
  }
}