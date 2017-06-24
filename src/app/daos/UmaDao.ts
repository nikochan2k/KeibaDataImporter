import { Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmEntityManager, OrmRepository } from "typeorm-typedi-extensions";
import * as $U from "../converters/Uma";
import { Kyousouba } from "../entities/Kyousouba";
import { Uma } from "../entities/Uma";

@Service()
export class UmaDao {

  @OrmEntityManager()
  protected entityManager: EntityManager;

  @OrmRepository(Kyousouba)
  private kyousoubaRepository: Repository<Kyousouba>;

  @OrmRepository(Uma)
  private umaRepository: Repository<Uma>;

  protected async getUma(uma: Uma) {
    let asIs = await this.umaRepository.findOne({
      where: {
        Bamei: uma.Bamei
      },
      join: {
        alias: "Uma",
        leftJoinAndSelect: {
          ChichiUma: "Uma.ChichiUma",
          HahaUma: "Uma.HahaUma",
          Seisansha: "Uma.Seisansha"
        }
      }
    });
    if (!asIs) {
      asIs = await this.umaRepository.findOne({
        where: {
          KyuuBamei: uma.Bamei
        },
        join: {
          alias: "Uma",
          leftJoinAndSelect: {
            ChichiUma: "Uma.ChichiUma",
            HahaUma: "Uma.HahaUma",
            Seisansha: "Uma.Seisansha"
          }
        }
      });
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
      const updateSet: any = {};
      /* tslint:disable:triple-equals */
      if (asIs.Seinengappi == null && toBe.Seinengappi != null) {
        updateSet.Seinengappi = asIs.Seinengappi = toBe.Seinengappi;
      }
      if (asIs.Keiro == null && toBe.Keiro != null) {
        updateSet.Keiro = asIs.Keiro = toBe.Keiro;
      }
      if (asIs.Kesshu == null && toBe.Kesshu != null) {
        updateSet.Kesshu = asIs.Keiro = toBe.Kesshu;
      }
      if (asIs.Sanchi == null && toBe.Sanchi != null) {
        updateSet.Sanchi = asIs.Sanchi = toBe.Sanchi;
      }
      if (asIs.Seibetsu == null && toBe.Seibetsu != null) {
        updateSet.Seibetsu = asIs.Seibetsu = toBe.Seibetsu;
      }
      if (asIs.ChichiUma == null && toBe.ChichiUma != null) {
        asIs.ChichiUma = toBe.ChichiUma;
        updateSet.ChichiUmaId = toBe.ChichiUma.Id;
      }
      if (asIs.HahaUma == null && toBe.HahaUma != null) {
        asIs.HahaUma = toBe.HahaUma;
        updateSet.HahaUmaId = toBe.HahaUma.Id;
      }
      if (asIs.Seisansha == null && toBe.Seisansha != null) {
        asIs.Seisansha = toBe.Seisansha;
        updateSet.SeisanshaId = toBe.Seisansha.Id;
      }
      if (asIs.MasshouFlag == null && toBe.MasshouFlag != null) {
        updateSet.MasshouFlag = asIs.MasshouFlag = toBe.MasshouFlag;
      }
      if (asIs.MasshouNengappi == null && toBe.MasshouNengappi != null) {
        updateSet.MasshouNengappi = asIs.MasshouNengappi = toBe.MasshouNengappi;
      }
      if (asIs.Jiyuu == null && toBe.Jiyuu != null) {
        updateSet.Jiyuu = asIs.Jiyuu = toBe.Jiyuu;
      }
      if (asIs.Ikisaki == null && toBe.Ikisaki != null) {
        updateSet.Ikisaki = asIs.Ikisaki = toBe.Ikisaki;
      }
      if (asIs.ShibouNen == null && toBe.ShibouNen != null) {
        updateSet.ShibouNen = asIs.ShibouNen = toBe.ShibouNen;
      }
      /* tslint:enable:triple-equals */
      if (0 < Object.keys(updateSet).length) {
        await this.entityManager
          .createQueryBuilder()
          .update(Uma, updateSet)
          .where("Id = :id")
          .setParameter("id", asIs.Id)
          .execute();
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