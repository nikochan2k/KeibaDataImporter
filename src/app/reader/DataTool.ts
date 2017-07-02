import { Logger } from "log4js";
import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { readInt, readStrWithNoSpace } from "./Reader";
import { Baken, YosouKakutei } from "../converters/Common";
import { OddsKubun } from "../entities/OddsKubun";
import { Race } from "../entities/Race";
import { Shussouba } from "../entities/Shussouba";
import { getLogger } from "../LogUtil";

@Service()
export class DataTool {

  private logger: Logger;

  constructor() {
    this.logger = getLogger(this);
  }

  @OrmEntityManager()
  private entityManager: EntityManager;

  protected format00(value: number): string {
    if (value < 10) return "0" + value;
    return "" + value;
  }

  public toDateString(value: Date): string {
    return value.getFullYear() + "-" + this.format00(value.getMonth() + 1) + "-" + this.format00(value.getDate());
  }

  public normalizeHoujinMei(buffer, offset, length) {
    let meishou = readStrWithNoSpace(buffer, offset, length);
    if (!meishou) {
      return meishou;
    }
    meishou = meishou.replace(/(株)|㈱/g, "株式会社");
    meishou = meishou.replace(/(有)|㈲/g, "有限会社");
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

  public getRaceId(yymmdd: number, basho: number, raceBangou: number) {
    const id = yymmdd * 10000 + basho * 100 + raceBangou;
    return id;
  }

  public normalizeNenrei(race: Race, shussouba: Shussouba) {
    if (race.Nen <= 2000) {
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
      joukenFukaList.forEach((item) => {
        joukenFuka |= item;
      });
    });
    return joukenFuka;
  }

  public async saveOddsKubun(raceId: number, baken: Baken, yosouKakutei: YosouKakutei) {
    const oddsKubun = new OddsKubun();
    oddsKubun.Id = raceId * 10 + baken;
    oddsKubun.Baken = baken;
    oddsKubun.RaceId = raceId;
    oddsKubun.YosouKakutei = yosouKakutei;
    return await this.entityManager.save(oddsKubun);
  }
}