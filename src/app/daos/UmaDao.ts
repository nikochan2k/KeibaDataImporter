import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import * as $U from "../converters/Uma";
import { Kyousouba } from "../entities/Kyousouba";
import { Uma } from "../entities/Uma";

@Service()
export class UmaDao {

  @OrmRepository(Kyousouba)
  private kyousoubaRepository: Repository<Kyousouba>;

  @OrmRepository(Uma)
  private umaRepository: Repository<Uma>;

  protected async getUma(uma: Uma) {
    let asIs = await this.umaRepository.findOne({ Bamei: uma.Bamei });
    if (!asIs) {
      asIs = await this.umaRepository.findOne({ KyuuBamei: uma.Bamei });
    }
    return asIs;
  }

  public getKyousouba(kyousouba: Kyousouba) {
    const qb = this.kyousoubaRepository
      .createQueryBuilder("k")
      .where("k.UmaId = umaId")
      .setParameter("umaId", kyousouba.Uma.Id)
      .andWhere("k.Seibetsu = :seibetsu")
      .setParameter("seibetsu", kyousouba.Seibetsu)
      .andWhere("k.UmaKigou = :umaKigou")
      .setParameter("umaKigou", kyousouba.UmaKigou)
      .andWhere("k.BanushiId = :banushiId")
      .setParameter("banushiId", kyousouba.Banushi.Id);
    if (kyousouba.Kyuusha) {
      qb.andWhere("k.KyuushaId = :kyuushaId")
        .setParameter("kyuushaId", kyousouba.Kyuusha.Id);
    } else {
      qb.andWhere("k.KyuushaId IS NULL");
    }
    if (kyousouba.KoueiGaikokuKyuushaMei) {
      qb.andWhere("k.KoueiGaikokuKyuushaMei = :koueiGaikokuKyuushaMei")
        .setParameter("koueiGaikokuKyuushaMei", kyousouba.KoueiGaikokuKyuushaMei);
    } else {
      qb.andWhere("k.KoueiGaikokuKyuushaMei IS NULL");
    }
    return qb.getOne();
  }

  public async saveUma(toBe: Uma) {
    if (toBe.Seibetsu === $U.Seibetsu.Senba) {
      toBe.Seibetsu = $U.Seibetsu.Boba;
    }
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
      if (asIs.Seibetsu == null && toBe.Seibetsu != null) {
        asIs.Seibetsu = toBe.Seibetsu;
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

  public async saveKyousouba(toBe: Kyousouba) {
    const uma = toBe.Uma;
    const asIs = await this.getKyousouba(toBe);
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.kyousoubaRepository.save(toBe);
    }
    toBe.Uma = uma;
    return toBe;
  }

}