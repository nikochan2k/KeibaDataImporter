import { EntityManager } from "typeorm";
import { Service, Inject } from "typedi";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { Kyuusha } from "../entities/Kyuusha";
import { DaoTool, ActionForDB } from "./RepositoryTool";

@Service()
export class KyuushaDao {

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: DaoTool;

  protected async getKyuusha(kyuusha: Kyuusha) {
    const qb = this.entityManager
      .getRepository(Kyuusha)
      .createQueryBuilder("k")
      .where("1 = 0");
    if (kyuusha.KyuushaMei) {
      qb.orWhere("k.KyuushaMei = :kyuushaMei")
        .setParameter("kyuushaMei", kyuusha.KyuushaMei);
    }
    if (kyuusha.KolKyuushaCode) {
      qb.orWhere("k.KolKyuushaCode = :kolKyuushaCode")
        .setParameter("kolKyuushaCode", kyuusha.KolKyuushaCode);
    }
    if (kyuusha.JrdbKyuushaCode) {
      qb.orWhere("k.JrdbKyuushaCode = :jrdbKyuushaCode")
        .setParameter("jrdbKyuushaCode", kyuusha.JrdbKyuushaCode);
    }
    return await qb.getOne();
  }

  public async saveKyuusha(toBe: Kyuusha) {
    const asIs = await this.getKyuusha(toBe);
    if (asIs) {
      const action = this.tool.changeAsIs(asIs, toBe, []);
      if (action === ActionForDB.None) {
        return asIs;
      }
      toBe = await this.entityManager.persist(asIs);
    } else {
      try {
        toBe = await this.entityManager.persist(toBe);
      } catch (e) {
        console.log(e.stack || e);
        console.log(toBe);
        return null;
      }
    }
    return toBe;
  }

}