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

  protected async getKishu(kishu: Kishu) {
    let k: Kishu;
    if (kishu.KishuMei) {
      const qb = this.entityManager
        .getRepository(Kishu)
        .createQueryBuilder("k")
        .where("k.TanshukuKishuMei = :tanshukuKishuMei")
        .setParameter("tanshukuKishuMei", kishu.TanshukuKishuMei)
        .andWhere("k.MasshouFlag = :masshouFlag")
        .setParameter("masshouFlag", kishu.MasshouFlag)
        .andWhere("k.KishuMei = :kishuMei")
        .setParameter("kishuMei", kishu.KishuMei);
      if (0 <= kishu.TouzaiBetsu) {
        qb.andWhere("k.TouzaiBetsu = :touzaiBetsu")
          .setParameter("touzaiBetsu", kishu.TouzaiBetsu);
      } else {
        qb.andWhere("k.TouzaiBetsu IS NULL");
      }
      if (0 <= kishu.ShozokuBasho) {
        qb.andWhere("k.ShozokuBasho = :shozokuBasho")
          .setParameter("shozokuBasho", kishu.ShozokuBasho);
      } else {
        qb.andWhere("k.ShozokuBasho IS NULL");
      }
      if (0 <= kishu.MinaraiKubun) {
        qb.andWhere("k.MinaraiKubun = :minaraiKubun")
          .setParameter("minaraiKubun", kishu.MinaraiKubun);
      } else {
        qb.andWhere("k.MinaraiKubun IS NULL");
      }
      if (kishu.Kyuusha) {
        qb.andWhere("k.KyuushaId = :kyuushaId")
          .setParameter("kyuushaId", kishu.Kyuusha.Id);
      } else {
        qb.andWhere("k.KyuushaId IS NULL");
      }
      k = await qb.getOne();
    }
    if (!k) {
      k = await this.entityManager
        .getRepository(Kishu)
        .createQueryBuilder("k")
        .where("k.TanshukuKishuMei = :tanshukuKishuMei")
        .setParameter("tanshukuKishuMei", kishu.TanshukuKishuMei)
        .getOne();
    }
    return k;
  }

  public async saveKishu(kishu: Kishu) {
    const k = await this.getKishu(kishu);
    if (k) {
      let needUpdate = false;
      if (!k.KolKishuCode && kishu.KolKishuCode) {
        k.KolKishuCode = kishu.KolKishuCode;
        needUpdate = true;
      }
      if (!k.JrdbKishuCode && kishu.JrdbKishuCode) {
        k.JrdbKishuCode = kishu.JrdbKishuCode;
        needUpdate = true;
      }
      if (!k.Furigana && kishu.Furigana) {
        k.Furigana = kishu.Furigana;
        needUpdate = true;
      }
      if (!k.Seinengappi && kishu.Seinengappi) {
        k.Seinengappi = kishu.Seinengappi;
        needUpdate = true;
      }
      if (!k.HatsuMenkyoNen && kishu.HatsuMenkyoNen) {
        k.HatsuMenkyoNen = kishu.HatsuMenkyoNen;
        needUpdate = true;
      }
      if (kishu.FromNengappi < k.FromNengappi) {
        k.FromNengappi = kishu.FromNengappi;
        needUpdate = true;
      }
      if (k.ToNengappi < kishu.ToNengappi) {
        k.ToNengappi = kishu.ToNengappi;
        needUpdate = true;
      }
      if (needUpdate) {
        kishu = await this.entityManager.persist(k);
      } else {
        kishu = k;
      }
    } else {
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