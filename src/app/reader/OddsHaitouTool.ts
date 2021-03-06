import { Logger } from "log4js";
import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { Tool } from "./Tool";
import { Baken } from "../converters/Common";
import { OddsHaitou } from "../entities/OddsHaitou";

export interface HaitouInfo {
  baken: Baken;
  index: number;
  bangou1: number;
  bangou1Len: number;
  bangou2?: number;
  bangou2Len?: number;
  bangou3?: number;
  bangou3Len?: number;
  haitou: number;
  haitouLen: number;
  ninki?: number;
  ninkiLen?: number;
}

export abstract class OddsHaitouTool {

  protected logger: Logger;

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected tool: Tool;

  /**
   * オッズ配当IDを取得します。
   * オッズ配当IDはレースID(28ビット)、確定(2ビット)、馬券(4ビット)、馬番1(5ビット)、馬番2(5ビット)、馬番3(5ビット)の計49ビットです。
   * @param {number} raceId レースID
   * @param {Baken} baken 馬券
   * @param {number} bangou1 馬番1
   * @param {number} [bangou2] 馬番2
   * @param {number} [bangou3] 馬番3
   * @returns オッズ配当ID
   * @memberof KolTool
   */
  public calculateOddsHaitouId(toBe: OddsHaitou) {
    const bangou2 = toBe.Bangou2 || 0;
    const bangou3 = toBe.Bangou3 || 0;
    const id = toBe.RaceId * (2 ** (2 + 4 + 5 + 5 + 5))
      + toBe.Kakutei * (2 ** (4 + 5 + 5 + 5))
      + toBe.Baken * (2 ** (5 + 5 + 5))
      + toBe.Bangou1 * (2 ** (5 + 5))
      + bangou2 * (2 ** 5)
      + bangou3;
    return id;
  }

  public async saveOddsHaitou(toBe: OddsHaitou) {
    toBe.Id = this.calculateOddsHaitouId(toBe);
    const asIs = await this.entityManager
      .getRepository(OddsHaitou)
      .findOne(toBe.Id);
    if (asIs) {
      toBe = await this.tool.saveOrUpdate(OddsHaitou, toBe, asIs);
    } else {
      toBe = await this.entityManager.save(toBe);
    }
    return toBe;
  }

}