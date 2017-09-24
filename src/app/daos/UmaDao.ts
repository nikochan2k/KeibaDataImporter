import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmEntityManager, OrmRepository } from "typeorm-typedi-extensions";
import * as $U from "../converters/Uma";
import { Kyousouba } from "../entities/Kyousouba";
import { Uma } from "../entities/Uma";
import { Tool } from "../reader/Tool";

@Service()
export class UmaDao {

  @OrmEntityManager()
  protected entityManager: EntityManager;

  @OrmRepository(Kyousouba)
  private kyousoubaRepository: Repository<Kyousouba>;

  @OrmRepository(Uma)
  private umaRepository: Repository<Uma>;

  @Inject()
  private tool: Tool;

  protected getUma(uma: Uma) {
    return this.umaRepository.findOne({ Bamei: uma.Bamei });
  }

  public getKyousouba(kyousouba: Kyousouba) {
    const qb = this.kyousoubaRepository
      .createQueryBuilder("k")
      .where("k.UmaId = umaId")
      .setParameter("umaId", kyousouba.UmaId);
    if (kyousouba.Seibetsu) {
      qb.andWhere("k.Seibetsu = :seibetsu")
        .setParameter("seibetsu", kyousouba.Seibetsu);
    }
    if (kyousouba.UmaKigou) {
      qb.andWhere("k.UmaKigou = :umaKigou")
        .setParameter("umaKigou", kyousouba.UmaKigou);
    }
    if (kyousouba.BanushiId) {
      qb.andWhere("k.BanushiId = :banushiId")
        .setParameter("banushiId", kyousouba.BanushiId);
    } else {
      qb.andWhere("k.BanushiId IS NULL");
    }
    if (kyousouba.KyuushaId) {
      qb.andWhere("k.KyuushaId = :kyuushaId")
        .setParameter("kyuushaId", kyousouba.KyuushaId);
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
    return await this.tool.update(Uma, asIs, toBe);
  }

  public async saveKyousouba(toBe: Kyousouba) {
    const asIs = await this.getKyousouba(toBe);
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.kyousoubaRepository.save(toBe);
    }
    return toBe;
  }

}