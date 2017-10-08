import { Logger } from "log4js";
import { Service } from "typedi";
import { EntityManager, ObjectType } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { readStrWithNoSpace } from "./Reader";
import { readDouble, readPositiveInt } from "./Reader";
import { Baken } from "../converters/Common";
import { OddsHaitou } from "../entities/OddsHaitou";
import { Race } from "../entities/Race";
import { RaceLapTime } from "../entities/RaceLapTime";
import { Shussouba } from "../entities/Shussouba";
import { getLogger } from "../LogUtil";

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

@Service()
export abstract class Tool {

  protected logger: Logger;

  @OrmManager()
  protected entityManager: EntityManager;

  constructor() {
    this.logger = getLogger(this);
  }

  public async saveOrUpdate<T>(entity: ObjectType<T>, asIs: T, toBe: T, forceKeys?: string[]) {
    if (asIs) {
      const updateSet = this.createUpdateSet(asIs, toBe, forceKeys);
      if (Object.keys(updateSet).length) {
        await this.entityManager
          .createQueryBuilder()
          .update(entity, updateSet)
          .where("Id = :id")
          .setParameter("id", (<any>asIs).Id)
          .execute();
      }
      toBe = asIs;
    } else {
      toBe = await this.entityManager.save(toBe);
    }
    return toBe;
  }

  protected createUpdateSet<T>(asIs: T, toBe: T, forceKeys?: string[]) {
    const updateSet = <T>{};
    const keys = Object.keys(toBe);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const toBeValue = toBe[key];
      if (forceKeys && 0 <= forceKeys.indexOf(key)) {
        updateSet[key] = toBeValue;
        asIs[key] = toBeValue;
        continue;
      }
      /* tslint:disable:triple-equals */
      if (toBeValue == null) {
        continue;
      }
      /* tslint:disable:triple-equals */
      if (asIs[key] !== toBeValue) {
        updateSet[key] = toBeValue;
        asIs[key] = toBeValue;
      }
    }
    return updateSet;
  }

  public normalizeHoujinMei(buffer, offset, length) {
    let meishou = readStrWithNoSpace(buffer, offset, length);
    if (!meishou) {
      return meishou;
    }
    meishou = meishou.replace(/(株)|㈱/, "株式会社");
    meishou = meishou.replace(/(有)|㈲/, "有限会社");
    meishou = meishou.replace(/・/g, "");
    meishou = meishou.replace(/氏$/, "");
    return meishou;
  }

  public normalizeTanshukuHoujinMei(buffer, offset, length) {
    let tanshukuMei = readStrWithNoSpace(buffer, offset, length);
    if (!tanshukuMei) {
      return tanshukuMei;
    }
    tanshukuMei = tanshukuMei.replace(/¥(株¥)|㈱/, "");
    tanshukuMei = tanshukuMei.replace(/¥(有¥)|㈲/, "");
    tanshukuMei = tanshukuMei.replace(/・/g, "");
    tanshukuMei = tanshukuMei.replace(/氏$/, "");
    return tanshukuMei;
  }

  public normalizeTokubetsuMei(buffer, offset, length) {
    let meishou = readStrWithNoSpace(buffer, offset, length);
    if (!meishou) {
      return meishou;
    }
    meishou = meishou.replace(/S$/, "ステークス");
    meishou = meishou.replace(/T$/, "トロフィー");
    meishou = meishou.replace(/H$|ハンデ$/, "ハンデキャップ");
    return meishou;
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

  public getOddsHaitouById(id: number) {
    return this.entityManager
      .getRepository(OddsHaitou)
      .findOneById(id);
  }

  /**
   * オッズ配当IDを取得します。
   * オッズ配当IDはレースID(30ビット)、確定(2ビット)、馬券(4ビット)、馬番1(5ビット)、馬番2(5ビット)、馬番3(5ビット)の計51ビットです。
   * @param {number} raceId レースID
   * @param {Baken} baken 馬券
   * @param {number} bangou1 馬番1
   * @param {number} [bangou2] 馬番2
   * @param {number} [bangou3] 馬番3
   * @returns オッズ配当ID
   * @memberof KolTool
   */
  public getOddsHaitouId(toBe: Partial<OddsHaitou>) {
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

  public async saveOddsHaitou(partial: Partial<OddsHaitou>) {
    let toBe = new OddsHaitou();
    Object.assign(toBe, partial);
    toBe.Id = this.getOddsHaitouId(partial);
    const asIs = await this.getOddsHaitouById(toBe.Id);
    if (asIs) {
      toBe = await this.saveOrUpdate(OddsHaitou, asIs, toBe);
    } else {
      toBe = await this.entityManager.save(toBe);
    }
    return toBe;
  }
}