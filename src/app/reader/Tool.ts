import { Logger } from "log4js";
import { Service } from "typedi";
import { EntityManager, EntityTarget } from "typeorm";
import { OrmManager } from "../OrmManager";
import { readInt, readPositiveInt, readStrWithNoSpace } from "./Reader";
import { getLogger } from "../LogUtil";

@Service()
export class Tool {

  protected logger: Logger;

  @OrmManager()
  protected entityManager: EntityManager;

  constructor() {
    this.logger = getLogger(this);
  }

  /**
   * 既存の行があれば差分だけを更新し、なければ保存します。
   * @param skipNull true のとき、toBe の null で既存の値を消しません(速報版など、項目が空白で提供されるデータ用)
   */
  public async saveOrUpdate<T>(entity: EntityTarget<T>, asIs: T, toBe: T, skipNull = false) {
    if (asIs) {
      const updateSet = this.createUpdateSet(asIs, toBe, skipNull);
      if (0 < Object.keys(updateSet).length) {
        await this.entityManager
          .createQueryBuilder()
          .update(entity as EntityTarget<any>, updateSet as any)
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

  protected createUpdateSet<T>(asIs: T, toBe: T, skipNull = false) {
    const updateSet = <T>{};
    const keys = Object.keys(toBe);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const toBeValue = toBe[key];
      if (toBeValue === undefined || (skipNull && toBeValue === null)) {
        continue;
      }
      if (asIs[key] !== toBeValue) {
        updateSet[key] = toBeValue;
        asIs[key] = toBeValue;
      }
    }
    return updateSet;
  }

  public getDaysFrom1970With(nen: number, gatsu: number, nichi: number) {
    // 実行環境のタイムゾーンに依存しないよう UTC で計算する(ID が環境で変わらないように)
    const time = Date.UTC(nen, gatsu - 1, nichi);
    return time / (24 * 60 * 60 * 1000);
  }

  /**
   * 年月日を示すIDを返します。
   * 年(7ビット)、月(4ビット)、日(5ビット)の計16ビットです。
   * @param {Buffer} buffer バッファ
   * @param {number} offset オフセット
   * @returns 年月日を示すID
   * @memberof ImportTool
   */
  public getDaysFrom1970(buffer: Buffer, offset: number) {
    /* tslint:disable:triple-equals */
    const nen = readInt(buffer, offset, 4);
    if (nen == null) {
      return null;
    }
    const gatsu = readInt(buffer, offset + 4, 2);
    if (gatsu == null) {
      return null;
    }
    const nichi = readInt(buffer, offset + 6, 2);
    if (nichi == null) {
      return null;
    }
    /* tslint:enable:triple-equals */
    return this.getDaysFrom1970With(nen, gatsu, nichi);
  }

  public normalizeHoujinMei(buffer: Buffer, offset: number, length: number) {
    let meishou = readStrWithNoSpace(buffer, offset, length);
    if (!meishou) {
      return meishou;
    }
    meishou = meishou.replace(/\(株\)|㈱|株式会社/, "");
    meishou = meishou.replace(/\(有\)|㈲|有限会社/, "");
    meishou = meishou.replace(/・/g, "");
    meishou = meishou.replace(/氏$/, "");
    return meishou;
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
  public normalizeNenrei(nenrei: number, nen: number) {
    if (nen < 2001) {
      nenrei--;
    }
    return nenrei;
  }

  public calculateNenrei(nen: number, seinen: number) {
    return nen - seinen;
  }

  public isEnglish(name: string) {
    return /^[\x00-\x7F]*$/.test(name);
  }

  public getChakujun(buffer, offset, length) {
    const chakujun = readPositiveInt(buffer, offset, length);
    if (1 <= chakujun && chakujun <= 28) {
      return chakujun;
    }
    return null;
  }

}