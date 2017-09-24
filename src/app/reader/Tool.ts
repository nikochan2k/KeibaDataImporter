import { Logger } from "log4js";
import { Service } from "typedi";
import { EntityManager, ObjectType } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import {
  readStrWithNoSpace
} from "./Reader";
import { getLogger } from "../LogUtil";

@Service()
export abstract class Tool {

  protected logger: Logger;

  @OrmEntityManager()
  protected entityManager: EntityManager;

  constructor() {
    this.logger = getLogger(this);
  }

  public async update<T>(entity: ObjectType<T>, asIs: T, toBe: T, forceKeys?: string[]) {
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
}