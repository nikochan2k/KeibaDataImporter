import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import * as $U from "../converters/Uma";
import { Kyousouba } from "../entities/Kyousouba";
import { Uma } from "../entities/Uma";
import { Tool } from "../reader/Tool";

@Service()
export class UmaDao {

  @OrmManager()
  protected entityManager: EntityManager;

  @OrmRepository(Kyousouba)
  private kyousoubaRepository: Repository<Kyousouba>;

  @OrmRepository(Uma)
  private umaRepository: Repository<Uma>;

  @Inject()
  private tool: Tool;

  protected async getUma(uma: Uma) {
    const qb = this.umaRepository
      .createQueryBuilder("u")
      .where("0 = 1");
    if (uma.KolUmaCode) {
      qb.orWhere("u.KolUmaCode = :kolUmaCode")
        .setParameter("kolUmaCode", uma.KolUmaCode);
    }
    if (uma.KettouTourokuBangou) {
      qb.orWhere("u.KettouTourokuBangou = :kettouTourokuBangou")
        .setParameter("kettouTourokuBangou", uma.KettouTourokuBangou);
    }
    if (uma.KanaBamei) {
      qb.orWhere("u.KanaBamei = :kanaBamei")
        .setParameter("kanaBamei", uma.KanaBamei);
    }
    if (uma.EigoBamei) {
      qb.orWhere("u.EigoBamei = :eigoBamei")
        .setParameter("eigoBamei", uma.EigoBamei);
    }
    return qb.getOne();
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
    if (kyousouba.ChoukyoushiId) {
      qb.andWhere("k.ChoukyoushiId = :choukyoushiId")
        .setParameter("choukyoushiId", kyousouba.ChoukyoushiId);
    } else {
      qb.andWhere("k.ChoukyoushiId IS NULL");
    }
    if (kyousouba.KoueiGaikokuChoukyoushiMei) {
      qb.andWhere("k.KoueiGaikokuChoukyoushiMei = :koueiGaikokuChoukyoushiMei")
        .setParameter("koueiGaikokuChoukyoushiMei", kyousouba.KoueiGaikokuChoukyoushiMei);
    } else {
      qb.andWhere("k.KoueiGaikokuChoukyoushiMei IS NULL");
    }
    return qb.getOne();
  }

  public async saveUma(toBe: Uma, update?: boolean) {
    if (toBe.Seibetsu === $U.Seibetsu.Senba) {
      toBe.Seibetsu = $U.Seibetsu.Boba;
    }
    const asIs = await this.getUma(toBe);
    if (!asIs || update) {
      return await this.tool.saveOrUpdate(Uma, asIs, toBe);
    } else {
      return asIs;
    }
  }

  public async saveKyousouba(toBe: Kyousouba) {
    const asIs = await this.getKyousouba(toBe);
    if (asIs) {
      return asIs;
    } else {
      return await this.kyousoubaRepository.save(toBe);
    }
  }

}