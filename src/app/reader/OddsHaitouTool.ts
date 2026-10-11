import { Inject } from "@nestjs/common";
import { Logger } from "log4js";
import { EntityManager } from "typeorm";
import { Baken, Kakutei } from "../converters/Common";
import { OddsHaitou } from "../entities/OddsHaitou";
import { OrmManager } from "../OrmManager";
import { readPositiveInt } from "./Reader";
import { Tool } from "./Tool";

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
   * オッズ配当IDはレースID(28ビット)、確定(3ビット)、馬券(4ビット)、馬番1(5ビット)、馬番2(5ビット)、馬番3(5ビット)の計50ビットです。
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
    const id =
      toBe.RaceId * 2 ** (3 + 4 + 5 + 5 + 5) +
      toBe.Kakutei * 2 ** (4 + 5 + 5 + 5) +
      toBe.Baken * 2 ** (5 + 5 + 5) +
      toBe.Bangou1 * 2 ** (5 + 5) +
      bangou2 * 2 ** 5 +
      bangou3;
    return id;
  }

  public async saveOddsHaitou(toBe: OddsHaitou) {
    toBe.Id = this.calculateOddsHaitouId(toBe);
    const asIs = await this.entityManager.findOneBy(OddsHaitou, { Id: toBe.Id });
    if (asIs) {
      toBe = await this.tool.saveOrUpdate(OddsHaitou, asIs, toBe);
    } else {
      toBe = await this.entityManager.save(toBe);
    }
    return toBe;
  }

  public async saveRaceHaitou(
    buffer: Buffer,
    raceId: number,
    kakutei: Kakutei,
    infos: HaitouInfo[],
  ) {
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const bangou1 = readPositiveInt(buffer, info.bangou1, info.bangou1Len);
      if (!bangou1) {
        continue;
      }
      let bangou2: number | undefined;
      if (info.bangou2) {
        bangou2 = readPositiveInt(buffer, info.bangou2, info.bangou2Len);
        if (!bangou2 && [Baken.Tanshou, Baken.Fukushou].indexOf(info.baken) === -1) {
          continue;
        }
      }
      let bangou3: number | undefined;
      if (info.bangou3) {
        bangou3 = readPositiveInt(buffer, info.bangou3, info.bangou3Len);
        if (!bangou3 && [Baken.Sanrenpuku, Baken.Sanrentan].indexOf(info.baken) !== -1) {
          continue;
        }
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Kakutei = kakutei;
      oddsHaitou.Baken = info.baken;
      oddsHaitou.Bangou1 = bangou1;
      oddsHaitou.Bangou2 = bangou2;
      oddsHaitou.Bangou3 = bangou3;
      oddsHaitou.Haitoukin = readPositiveInt(buffer, info.haitou, info.haitouLen);
      oddsHaitou.Ninki = info.ninki
        ? readPositiveInt(buffer, info.ninki, info.ninkiLen)
        : undefined;
      await this.saveOddsHaitou(oddsHaitou);
    }
  }
}
