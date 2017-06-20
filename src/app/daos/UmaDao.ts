import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import * as $U from "../converters/Uma";
import { Kyousouba } from "../entities/Kyousouba";
import { KyousoubaRireki } from "../entities/KyousoubaRireki";
import { Uma } from "../entities/Uma";

@Service()
export class UmaDao {

  @OrmRepository(Kyousouba)
  private kyousoubaRepository: Repository<Kyousouba>;

  @OrmRepository(Uma)
  private umaRepository: Repository<Uma>;

  @OrmRepository(KyousoubaRireki)
  private kyousoubaRirekiRepository: Repository<KyousoubaRireki>;

  protected getUma(uma: Uma) {
    return this.umaRepository.findOne({ Bamei: uma.Bamei });
  }

  protected getKyousoubaRireki(kyousoubaRireki: KyousoubaRireki) {
    const qb = this.kyousoubaRirekiRepository
      .createQueryBuilder("kr")
      .where("kr.UmaKigou = :umaKigou")
      .setParameter("umaKigou", kyousoubaRireki.UmaKigou)
      .andWhere("kr.BanushiId = :banushiId")
      .setParameter("banushiId", kyousoubaRireki.Banushi.Id);
    if (kyousoubaRireki.Kyuusha) {
      qb.andWhere("kr.KyuushaId = :kyuushaId")
        .setParameter("kyuushaId", kyousoubaRireki.Kyuusha.Id);
    } else {
      qb.andWhere("kr.KyuushaId IS NULL");
    }
    return qb.getOne();
  }

  public getKyousouba(kyousouba: Kyousouba) {
    return this.kyousoubaRepository
      .createQueryBuilder("k")
      .where("k.UmaId = umaId")
      .setParameter("umaId", kyousouba.Uma.Id)
      .andWhere("k.Seibetsu = :seibetsu")
      .setParameter("seibetsu", kyousouba.Seibetsu)
      .andWhere("k.KyousoubaRirekiId = :kyousoubaRirekiId")
      .setParameter("kyousoubaRirekiId", kyousouba.KyousoubaRireki.Id)
      .getOne();
  }

  public async saveUma(toBe: Uma) {
    const asIs = await this.getUma(toBe);
    if (asIs) {
      let update = false;
      /* tslint:disable:triple-equals */
      if (asIs.Seinengappi == null && toBe.Seinengappi != null) {
        asIs.Seinengappi = toBe.Seinengappi;
        update = true;
      }
      if (asIs.Keiro == null && toBe.Keiro != null) {
        asIs.Keiro = toBe.Keiro;
        update = true;
      }
      if (asIs.Kesshu == null && toBe.Kesshu != null) {
        asIs.Kesshu = toBe.Kesshu;
        update = true;
      }
      if (asIs.Sanchi == null && toBe.Sanchi != null) {
        asIs.Sanchi = toBe.Sanchi;
        update = true;
      }
      if (asIs.ChichiUma == null && toBe.ChichiUma != null) {
        asIs.ChichiUma = toBe.ChichiUma;
        update = true;
      }
      if (asIs.HahaUma == null && toBe.HahaUma != null) {
        asIs.HahaUma = toBe.HahaUma;
        update = true;
      }
      if (asIs.Seisansha == null && toBe.Seisansha != null) {
        asIs.Seisansha = toBe.Seisansha;
        update = true;
      }
      if (asIs.MasshouFlag == null && toBe.MasshouFlag != null) {
        asIs.MasshouFlag = toBe.MasshouFlag;
        update = true;
      }
      if (asIs.MasshouNengappi == null && toBe.MasshouNengappi != null) {
        asIs.MasshouNengappi = toBe.MasshouNengappi;
        update = true;
      }
      if (asIs.Jiyuu == null && toBe.Jiyuu != null) {
        asIs.Jiyuu = toBe.Jiyuu;
        update = true;
      }
      if (asIs.Ikisaki == null && toBe.Ikisaki != null) {
        asIs.Ikisaki = toBe.Ikisaki;
        update = true;
      }
      if (asIs.ShibouNen == null && toBe.ShibouNen != null) {
        asIs.ShibouNen = toBe.ShibouNen;
        update = true;
      }
      /* tslint:enable:triple-equals */
      if (update) {
        await this.umaRepository.updateById(asIs.Id, asIs);
      }
      toBe = asIs;
    } else {
      toBe = await this.umaRepository.save(toBe);
    }
    return toBe;
  }

  protected async saveKyousoubaRireki(toBe: KyousoubaRireki) {
    const asIs = await this.getKyousoubaRireki(toBe);
    if (asIs) {
      if (!asIs.KoueiGaikokuKyuushaMei && toBe.KoueiGaikokuKyuushaMei) {
        asIs.KoueiGaikokuKyuushaMei = toBe.KoueiGaikokuKyuushaMei;
        await this.kyousoubaRirekiRepository.updateById(asIs.Id, asIs);
      }
      toBe = asIs;
    } else {
      toBe = await this.kyousoubaRirekiRepository.save(toBe);
    }
    return toBe;
  }

  public async saveKyousouba(uma: Uma, kyousoubaRireki: KyousoubaRireki) {
    let toBe = new Kyousouba();
    if (toBe.Seibetsu === $U.Seibetsu.Senba) {
      uma.Seibetsu = $U.Seibetsu.Boba;
    }
    uma = await this.saveUma(uma);
    toBe.Uma = uma;
    kyousoubaRireki = await this.saveKyousoubaRireki(kyousoubaRireki);
    toBe.KyousoubaRireki = kyousoubaRireki;
    toBe.Seibetsu = uma.Seibetsu;
    const asIs = await this.getKyousouba(toBe);
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.kyousoubaRepository.save(toBe);
    }
    toBe.Uma = uma;
    toBe.KyousoubaRireki = kyousoubaRireki;
    return toBe;
  }

}