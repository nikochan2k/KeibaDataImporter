import { Logger } from "log4js";
import { Service } from "typedi";
import { EntityManager } from "typeorm";
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

  public createUpdateSet(asIs: any, toBe: any, overwrite: boolean) {
    const updateSet: any = {};
    const keys = Object.keys(toBe);
    let created = false;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const toBeValue = toBe[key];
      /* tslint:disable:triple-equals */
      if (toBeValue == null) {
        continue;
      }
      const asIsValue = asIs[key];
      if (asIsValue == null || overwrite && asIsValue !== toBeValue) {
        updateSet[key] = toBeValue;
        asIs[key] = toBeValue;
        created = true;
      }
      /* tslint:disable:triple-equals */
    }
    if (created) {
      return updateSet;
    }
    return null;
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