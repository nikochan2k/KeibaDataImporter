import { EntityManager } from "typeorm";
import { Service, Inject } from "typedi";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { Kyuusha } from "../entities/Kyuusha";
import { DaoTool, ActionForDB } from "./RepositoryTool";

@Service()
export class KyuushaDao {

  private static readonly insertKeys = ["TouzaiBetsu", "ShozokuBasho", "RitsuHokuNanBetsu"];

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: DaoTool;

  private kyuushaMeiMap = new Map<string, Kyuusha>();

  private kolKyuushaCodeMap = new Map<number, Kyuusha>();

  private jrdbKyuushaCodeMap = new Map<number, Kyuusha>();

  protected async getKyuusha(kyuusha: Kyuusha) {
    let result: Kyuusha;
    if (kyuusha.KyuushaMei) {
      result = this.kyuushaMeiMap.get(kyuusha.KyuushaMei);
    }
    if (!result && kyuusha.KolKyuushaCode) {
      result = this.kolKyuushaCodeMap.get(kyuusha.KolKyuushaCode);
    }
    if (!result && kyuusha.JrdbKyuushaCode) {
      result = this.jrdbKyuushaCodeMap.get(kyuusha.JrdbKyuushaCode);
    }
    if (!result) {
      result = await this.getKyuushaFromDB(kyuusha);
    }
    return result;
  }

  protected async getKyuushaFromDB(kyuusha: Kyuusha) {
    const qb = await this.entityManager
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
    return qb.getOne();
  }

  public async saveKyuusha(toBe: Kyuusha) {
    const asIs = await this.getKyuusha(toBe);
    if (asIs) {
      let action: ActionForDB;
      if (!asIs.KyuushaMei) {
        if (toBe.KyuushaMei) {
          this.tool.changeAsIs(asIs, toBe, KyuushaDao.insertKeys);
          action = ActionForDB.Update;
        } else {
          return asIs;
        }
      } else {
        const action = this.tool.changeAsIs(asIs, toBe, KyuushaDao.insertKeys);
        if (action === ActionForDB.None) {
          return asIs;
        }
        if (action === ActionForDB.Insert) {
          asIs.Id = null;
        }
      }
      toBe = await this.entityManager.persist(asIs);
    } else {
      toBe = await this.entityManager.persist(toBe);
    }
    if (toBe.KyuushaMei) {
      this.kyuushaMeiMap.set(toBe.KyuushaMei, toBe);
    }
    if (toBe.KolKyuushaCode) {
      this.kolKyuushaCodeMap.set(toBe.KolKyuushaCode, toBe);
    }
    if (toBe.JrdbKyuushaCode) {
      this.jrdbKyuushaCodeMap.set(toBe.JrdbKyuushaCode, toBe);
    }
    return toBe;
  }

}