import { Logger } from "log4js";
import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { readDouble } from "./Reader";
import { Tool } from "./Tool";
import { RaceDao } from "../daos/RaceDao";
import { Race } from "../entities/Race";
import { RaceLapTime } from "../entities/RaceLapTime";
import { getLogger } from "../LogUtil";

export abstract class RaceTool {

  protected logger: Logger;

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected raceDao: RaceDao;

  @Inject()
  protected tool: Tool;

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
    const id = kaisaiId * (2 ** 6) + raceBangou;
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
    const raceBagou = this.getRaceBangou(buffer);
    if (!raceBagou) {
      return null;
    }
    return this.getRaceIdFrom(kaisaiId, raceBagou);
  }

  public getRace(buffer: Buffer, kaisaiId: number) {
    const id = this.getRaceId(buffer, kaisaiId);
    if (!id) {
      return null;
    }
    return this.entityManager.findOneById(Race, id);
  }

  public createRace(buffer: Buffer, kaisaiId: number) {
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

  public async saveRaceMei(buffer: Buffer, offset: number, length: number, race: Race) {
    const meishou = this.tool.normalizeTokubetsuMei(buffer, offset, length);
    if (meishou) {
      await this.raceDao.saveRaceMei(race, meishou);
    }
  }
}