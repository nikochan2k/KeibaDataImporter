import { EntityManager } from "typeorm";
import { Logger } from "log4js";
import { readStrWithNoSpace } from "./ReadTool";
import { Kyuusha } from "../entities/Kyuusha";
import { Uma } from "../entities/Uma";
import { Banushi } from "../entities/Banushi";
import { Kishu } from "../entities/Kishu";
import { Seisansha } from "../entities/Seisansha";
import { RaceClass } from "../entities/RaceClass";

export class DataSupport {

  protected logger: Logger;

  protected entityManager: EntityManager;

  constructor(logger: Logger, entityManager: EntityManager) {
    this.logger = logger;
    this.entityManager = entityManager;
  }

  public normalizeMeishou(buffer, offset, length) {
    let meishou = readStrWithNoSpace(buffer, offset, length);
    if (!meishou) {
      return meishou;
    }
    meishou = meishou.replace(/株式会社|㈱/g, "(株)");
    meishou = meishou.replace(/有限会社|㈲/g, "(有)");
    meishou = meishou.replace(/・/g, "");
    meishou = meishou.replace(/氏$/, "");
    return meishou;
  }

  public normalizeTanshukuMei(buffer, offset, length) {
    let tanshukuMei = readStrWithNoSpace(buffer, offset, length);
    if (!tanshukuMei) {
      return tanshukuMei;
    }
    tanshukuMei = tanshukuMei.replace(/¥(株¥)|㈱/g, "");
    tanshukuMei = tanshukuMei.replace(/¥(有¥)|㈲/g, "");
    tanshukuMei = tanshukuMei.replace(/・/g, "");
    tanshukuMei = tanshukuMei.replace(/氏$/, "");
    return tanshukuMei;
  }

  public getRaceId(yyyymmdd: number, basho: number, raceBangou: number) {
    const id = yyyymmdd * 10000 + basho * 100 + raceBangou;
    return id;
  }

  public async getBanushi(banushiMei: string) {
    let banushi = await this.entityManager
      .getRepository(Banushi)
      .createQueryBuilder("b")
      .where("b.BanushiMei = :banushiMei")
      .setParameter("banushiMei", banushiMei)
      .getOne();
    if (!banushi) {
      banushi = new Banushi();
      banushi.BanushiMei = banushiMei;
    }
    return banushi;
  }

  public async saveBanushi(banushiMei: string, tanshukuBanushiMei: string) {
    let banushi = await this.getBanushi(banushiMei);
    if (!banushi.Id) {
      banushi.TanshukuBanushiMei = tanshukuBanushiMei;
      banushi = await this.entityManager.persist(banushi);
    }
    return banushi;
  }

  public async getKyuusha(kyuushaMei: string) {
    let kyuusha = await this.entityManager
      .getRepository(Kyuusha)
      .createQueryBuilder("k")
      .where("k.KyuushaMei = :kyuushaMei")
      .setParameter("kyuushaMei", kyuushaMei)
      .getOne();
    if (!kyuusha) {
      kyuusha = new Kyuusha();
      kyuusha.KyuushaMei = kyuushaMei;
    }
    return kyuusha;
  }

  public async getSeisansha(seisanshaMei: string) {
    let seisansha = await this.entityManager
      .getRepository(Seisansha)
      .createQueryBuilder("s")
      .where("s.SeisanshaMei = :seisanshaMei")
      .setParameter("seisanshaMei", seisanshaMei)
      .getOne();
    if (!seisansha) {
      seisansha = new Seisansha();
      seisansha.SeisanshaMei = seisanshaMei;
    }
    return seisansha;
  }

  public async saveSeisansha(seisanshaMei: string, tanshukuSeisanshaMei: string) {
    let seisansha = await this.getSeisansha(seisanshaMei);
    if (!seisansha.Id) {
      seisansha.TanshukuSeisanshaMei = tanshukuSeisanshaMei;
      seisansha = await this.entityManager.persist(seisansha);
    }
    return seisansha;
  }

  public async getKishu(kishuMei?: string, tanshukuKishuMei?: string) {
    let kishu: Kishu;
    if (kishuMei) {
      const qb = this.entityManager
        .getRepository(Kishu)
        .createQueryBuilder("k")
        .where("k.KishuMei = :kishuMei")
        .setParameter("kishuMei", kishuMei);
      if (tanshukuKishuMei) {
        qb.orWhere("k.TanshukuKishuMei = :tanshukuKishuMei")
          .setParameter("tanshukuKishuMei", tanshukuKishuMei);
      }
      kishu = await qb.getOne();
    } else if (tanshukuKishuMei) {
      kishu = await this.entityManager
        .getRepository(Kishu)
        .createQueryBuilder("k")
        .where("k.TanshukuKishuMei = :tanshukuKishuMei")
        .setParameter("tanshukuKishuMei", tanshukuKishuMei)
        .getOne();
    }
    if (!kishu) {
      kishu = new Kishu();
    }
    return kishu;
  }

  public async saveKishu(tanshukuKishuMei: string) {
    let kishu = await this.getKishu(null, tanshukuKishuMei);
    if (!kishu.Id) {
      kishu.TanshukuKishuMei = tanshukuKishuMei;
      kishu = await this.entityManager.persist(kishu);
    }
    return kishu;
  }

  public async getUma(bamei: string) {
    let uma = await this.entityManager
      .getRepository(Uma)
      .createQueryBuilder("u")
      .where("u.KanaBamei = :bamei")
      .orWhere("u.KyuuBamei = :bamei")
      .setParameter("bamei", bamei)
      .getOne();
    if (!uma) {
      uma = new Uma();
      uma.KanaBamei = bamei;
    }
    return uma;
  }

  public async saveUma(bamei: string) {
    let uma = await this.getUma(bamei);
    if (!uma.Id) {
      uma = await this.entityManager.persist(uma);
    }
    return uma;
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