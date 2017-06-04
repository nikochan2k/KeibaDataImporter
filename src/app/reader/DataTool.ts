import { Logger } from "log4js";
import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { readInt, readStrWithNoSpace } from "./Reader";
import { Shussouba } from "../entities/Shussouba";
import { RaceClass } from "../entities/RaceClass";
import { getLogger } from "../LogUtil";

@Service()
export class DataTool {

  private logger: Logger;

  @OrmEntityManager()
  private entityManager: EntityManager;

  constructor() {
    this.logger = getLogger(this);
  }

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

  public getRaceId(yyyymmdd: number, basho: number, raceBangou: number) {
    const id = yyyymmdd * 10000 + basho * 100 + raceBangou;
    return id;
  }

  public async normalizeNenrei(shussouba: Shussouba) {
    if (shussouba.Race.Nen <= 2000) {
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

  public async saveRaceClass(rc: RaceClass) {
    const qb = await this.entityManager
      .getRepository(RaceClass)
      .createQueryBuilder("rc")
      .where("rc.ChuuouChihouGaikoku = :chuuouChihouGaikoku")
      .setParameter("chuuouChihouGaikoku", rc.ChuuouChihouGaikoku)
      .andWhere("rc.IppanTokubetsu = :ippanTokubetsu")
      .setParameter("ippanTokubetsu", rc.IppanTokubetsu)
      .andWhere("rc.HeichiShougai = :heichiShougai")
      .setParameter("heichiShougai", rc.HeichiShougai)
      .andWhere("rc.JoukenKei = :joukenKei")
      .setParameter("joukenKei", rc.JoukenKei);
    if (rc.TokubetsuMei) {
      qb.andWhere("rc.TokubetsuMei = :tokubetsuMei")
        .setParameter("tokubetsuMei", rc.TokubetsuMei);
    } else {
      qb.andWhere("rc.TokubetsuMei IS NULL");
    }
    if (rc.Grade) {
      qb.andWhere("rc.Grade = :grade")
        .setParameter("grade", rc.Grade);
    } else {
      qb.andWhere("rc.Grade IS NULL");
    }
    if (rc.BetteiBareiHandi) {
      qb.andWhere("rc.BetteiBareiHandi = :betteiBareiHandi")
        .setParameter("betteiBareiHandi", rc.BetteiBareiHandi);
    } else {
      qb.andWhere("rc.BetteiBareiHandi IS NULL");
    }
    if (rc.JoukenNenreiSeigen) {
      qb.andWhere("rc.JoukenNenreiSeigen = :joukenNenreiSeigen")
        .setParameter("joukenNenreiSeigen", rc.JoukenNenreiSeigen);
    } else {
      qb.andWhere("rc.JoukenNenreiSeigen IS NULL");
    }
    if (rc.Jouken1) {
      qb.andWhere("rc.Jouken1 = :jouken1")
        .setParameter("jouken1", rc.Jouken1);
    } else {
      qb.andWhere("rc.Jouken1 IS NULL");
    }
    if (rc.Kumi1) {
      qb.andWhere("rc.Kumi1 = :kumi1")
        .setParameter("kumi1", rc.Kumi1);
    } else {
      qb.andWhere("rc.Kumi1 IS NULL");
    }
    if (rc.IjouIkaMiman) {
      qb.andWhere("rc.IjouIkaMiman = :ijouIkaMiman")
        .setParameter("ijouIkaMiman", rc.IjouIkaMiman);
    } else {
      qb.andWhere("rc.IjouIkaMiman IS NULL");
    }
    if (rc.Jouken2) {
      qb.andWhere("rc.Jouken2 = :jouken2")
        .setParameter("jouken2", rc.Jouken2);
    } else {
      qb.andWhere("rc.Jouken2 IS NULL");
    }
    if (rc.Kumi2) {
      qb.andWhere("rc.Kumi2 = :kumi2")
        .setParameter("kumi2", rc.Kumi2);
    } else {
      qb.andWhere("rc.Kumi2 IS NULL");
    }
    let raceClass = await qb.getOne();
    if (!raceClass) {
      raceClass = await this.entityManager.persist(rc);
    }
    return raceClass;
  }

}