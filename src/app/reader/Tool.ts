import { Logger } from "log4js";
import { Service } from "typedi";
import { EntityManager, ObjectType } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { readInt, readPositiveInt, readStrWithNoSpace } from "./Reader";
import { Race } from "../entities/Race";
import { Shussouba } from "../entities/Shussouba";
import { getLogger } from "../LogUtil";

@Service()
export class Tool {

  protected logger: Logger;

  @OrmManager()
  protected entityManager: EntityManager;

  constructor() {
    this.logger = getLogger(this);
  }

  public async saveOrUpdate<T>(entity: ObjectType<T>, asIs: T, toBe: T, forceKeys?: string[]) {
    if (asIs) {
      const updateSet = this.createUpdateSet(asIs, toBe);
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

  protected createUpdateSet<T>(asIs: T, toBe: T) {
    const updateSet = <T>{};
    const keys = Object.keys(toBe);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const toBeValue = toBe[key];
      if (toBeValue === undefined) {
        continue;
      }
      if (asIs[key] !== toBeValue) {
        updateSet[key] = toBeValue;
        asIs[key] = toBeValue;
      }
    }
    return updateSet;
  }

  /**
   * 年月日を示すIDを返します。
   * 年(7ビット)、月(4ビット)、日(5ビット)の計16ビットです。
   * @param {Buffer} buffer バッファ
   * @param {number} offset オフセット
   * @returns 年月日を示すID
   * @memberof ImportTool
   */
  public getDateId(buffer: Buffer, offset: number) {
    /* tslint:disable:triple-equals */
    const year = readInt(buffer, offset, 4);
    if (year == null) {
      return null;
    }
    const month = readInt(buffer, offset + 4, 2);
    if (month == null) {
      return null;
    }
    const day = readInt(buffer, offset + 6, 2);
    if (day == null) {
      return null;
    }
    /* tslint:enable:triple-equals */

    const id = year * (2 ** (4 + 5)) + month * (2 ** 5) + day;
    return id;
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