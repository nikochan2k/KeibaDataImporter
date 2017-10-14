import { Logger } from "log4js";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { Kaisai } from "../entities/Kaisai";
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

export abstract class KaisaiTool {

  protected logger: Logger;

  @OrmManager()
  protected entityManager: EntityManager;

  constructor() {
    this.logger = getLogger(this);
  }

  protected abstract getKaisaiInfo(buffer: Buffer): KaisaiInfo;

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
}