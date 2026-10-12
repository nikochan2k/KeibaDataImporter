import { raceDao } from "../daos/RaceDao";
import { findOneBy, save } from "../db/helpers";
import { Race } from "../entities/Race";
import { RaceLapTime } from "../entities/RaceLapTime";
import type { Logger } from "../LogUtil";
import { getLogger } from "../LogUtil";
import { readPositiveDouble } from "./Reader";
import { tool } from "./Tool";

/**
 * ラップタイムの ID を返します。どの情報源から取り込んでも同じ区間が同じ ID になるよう、区間の距離で作ります。
 * レースID(28ビット) * 2^24 + 開始距離(13ビット) * 2^11 + 区間の長さ(11ビット)
 * 範囲外(開始距離が負、区間の長さが 0 以下など)なら null を返します。
 */
export function getRaceLapTimeId(raceId: number, kaishiKyori: number, shuuryouKyori: number) {
  const nagasa = shuuryouKyori - kaishiKyori;
  if (
    !Number.isInteger(kaishiKyori) ||
    !Number.isInteger(shuuryouKyori) ||
    kaishiKyori < 0 ||
    2 ** 13 <= kaishiKyori ||
    nagasa <= 0 ||
    2 ** 11 <= nagasa
  ) {
    return null;
  }
  return raceId * 2 ** 24 + kaishiKyori * 2 ** 11 + nagasa;
}

export abstract class RaceTool {
  protected logger: Logger;

  constructor() {
    this.logger = getLogger(this);
  }

  protected abstract getRaceBangou(buffer: Buffer): number;

  /**
   * レースIDを返します。
   * レースIDは開催ID(22ビット)、レース番号(6ビット)の計28ビットです
   * @protected
   * @param {number} kaisaiId 開催ID
   * @param {number} raceBangou レース番号
   * @returns レースID
   * @memberof RaceTool
   */
  protected getRaceIdFrom(kaisaiId: number, raceBangou: number) {
    const id = kaisaiId * 2 ** 6 + raceBangou;
    return id;
  }

  /**
   * レースIDを返します。
   * レースIDは開催ID(22ビット)、レース番号(6ビット)の計28ビットです
   * @param {Buffer} buffer バッファ
   * @param {number} [kaisaiId] 開催ID
   * @returns レースID
   * @memberof RaceTool
   */
  public getRaceId(buffer: Buffer, kaisaiId: number) {
    if (kaisaiId == null) {
      return null;
    }
    const raceBangou = this.getRaceBangou(buffer);
    if (raceBangou == null) {
      return null;
    }
    return this.getRaceIdFrom(kaisaiId, raceBangou);
  }

  public getRace(buffer: Buffer, kaisaiId: number) {
    const id = this.getRaceId(buffer, kaisaiId);
    if (!id) {
      return null;
    }
    return findOneBy(Race, { Id: id });
  }

  public createRace(buffer: Buffer, kaisaiId: number) {
    const raceBangou = this.getRaceBangou(buffer);
    if (raceBangou == null) {
      return null;
    }
    const race = {} as Race;
    race.Id = this.getRaceIdFrom(kaisaiId, raceBangou);
    race.KaisaiId = kaisaiId;
    race.RaceBangou = raceBangou;
    return race;
  }

  /**
   * 1区間目の長さを返します。
   * 距離が200mで割り切れないレースは、端数(100m、150m など)が最初の区間になります。
   * 距離が不明なときは、1区間目のラップタイムから推定します。
   */
  public static firstLapDistance(kyori: number | null | undefined, firstLapTime: number | null) {
    if (kyori) {
      return kyori % 200 || 200;
    }
    return firstLapTime !== null && firstLapTime < 10.0 ? 100 : 200;
  }

  public async saveRaceLapTime(buffer: Buffer, offset: number, race: Race, count = 18) {
    let lapTime = readPositiveDouble(buffer, offset, 3, 0.1);
    let kaishiKyori = 0;
    let shuuryouKyori = RaceTool.firstLapDistance(race.Kyori, lapTime);
    for (let i = 0; i < count; i++, offset += 3) {
      lapTime = readPositiveDouble(buffer, offset, 3, 0.1);
      if (!lapTime) {
        break;
      }
      await this.saveLap(race, kaishiKyori, shuuryouKyori, lapTime);
      kaishiKyori = shuuryouKyori;
      shuuryouKyori += 200;
    }
  }

  /** 1区間のラップタイムを保存します。区間の距離が ID に収まらなければ保存しません。 */
  protected async saveLap(race: Race, kaishiKyori: number, shuuryouKyori: number, lapTime: number) {
    const id = getRaceLapTimeId(race.Id, kaishiKyori, shuuryouKyori);
    if (id === null) {
      this.logger.warn(
        `ラップタイムの区間が不正です: ${JSON.stringify({ raceId: race.Id, kaishiKyori, shuuryouKyori })}`,
      );
      return;
    }
    const raceLapTime = {} as RaceLapTime;
    raceLapTime.Id = id;
    raceLapTime.RaceId = race.Id;
    raceLapTime.KaishiKyori = kaishiKyori;
    raceLapTime.ShuuryouKyori = shuuryouKyori;
    raceLapTime.LapTime = lapTime;
    save(RaceLapTime, raceLapTime);
  }

  public async saveRaceMei(buffer: Buffer, offset: number, length: number, race: Race) {
    const meishou = tool.normalizeTokubetsuMei(buffer, offset, length);
    if (meishou) {
      await raceDao.saveRaceMei(race.Id, meishou);
    }
  }
}
