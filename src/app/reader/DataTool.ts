import { Logger } from "log4js";
import { Service } from "typedi";
import { readInt, readStrWithNoSpace } from "./Reader";
import { Race } from "../entities/Race";
import { Shussouba } from "../entities/Shussouba";
import { getLogger } from "../LogUtil";

@Service()
export class DataTool {

  private logger: Logger;

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

  public getRaceId(days: number, basho: number, raceBangou: number) {
    const id = days * (2 ** (7 + 5)) + basho * (2 ** 5) + raceBangou;
    return id;
  }

  public normalizeNenrei(race: Race, shussouba: Shussouba) {
    if (race.Nengappi < 20010000) {
      shussouba.Nenrei--;
    }
  }

  public getChakujun(buffer, offset, length) {
    const chakujun = readInt(buffer, offset, length);
    if (1 <= chakujun && chakujun <= 28) {
      return chakujun;
    }
    return null;
  }

  public getJoukenFuka(...joukenFukaLists: number[][]) {
    let joukenFuka = 0;
    joukenFukaLists.forEach((joukenFukaList) => {
      if (joukenFukaList) {
        joukenFukaList.forEach((item) => {
          joukenFuka |= item;
        });
      }
    });
    return joukenFuka;
  }

}