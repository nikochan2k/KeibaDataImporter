import { EntityManager } from "typeorm";
import { Logger } from "log4js";
import { readStrWithNoSpace } from "./ReadTool";
import { Kyuusha } from "../entities/Kyuusha";
import { Uma } from "../entities/Uma";
import { Banushi } from "../entities/Banushi";
import { Kishu } from "../entities/Kishu";
import { Seisansha } from "../entities/Seisansha";

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
    const banushi = await this.getBanushi(banushiMei);
    if (!banushi.Id) {
      banushi.TanshukuBanushiMei = tanshukuBanushiMei;
      await this.entityManager.persist(banushi);
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
    const seisansha = await this.getSeisansha(seisanshaMei);
    if (!seisansha.Id) {
      seisansha.TanshukuSeisanshaMei = tanshukuSeisanshaMei;
      await this.entityManager.persist(seisansha);
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

}