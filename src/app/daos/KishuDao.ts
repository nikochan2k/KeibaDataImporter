import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { DaoTool, ActionForDB } from "./RepositoryTool";
import { Kishu } from "../entities/Kishu";

@Service()
export class KishuDao {

  private static readonly insertKeys = ["TouzaiBetsu", "ShozokuBasho", "ShikakuKubun", "MinaraiKubun", "Kyuusha"];

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: DaoTool;

  private kishuMeiMap = new Map<string, Kishu>();

  private tanshukuKishuMeiMap = new Map<string, Kishu>();

  protected async getKishu(kishu: Kishu) {
    let result: Kishu;
    if (kishu.KishuMei) {
      result = this.kishuMeiMap.get(kishu.KishuMei);
      if (!result) {
        result = await this.getKishuByKishuMei(kishu);
      }
    }
    if (!result) {
      result = this.tanshukuKishuMeiMap.get(kishu.TanshukuKishuMei);
      if (!result) {
        result = await this.getKishuByTanshukuKishuMei(kishu);
      }
    }
    return result;
  }

  protected async getKishuByTanshukuKishuMei(kishu: Kishu) {
    return await this.entityManager
      .getRepository(Kishu)
      .createQueryBuilder("k")
      .where("k.TanshukuKishuMei = :tanshukuKishuMei")
      .setParameter("tanshukuKishuMei", kishu.TanshukuKishuMei)
      .getOne();
  }

  protected async getKishuByKishuMei(kishu: Kishu) {
    const qb = this.entityManager
      .getRepository(Kishu)
      .createQueryBuilder("k")
      .where("k.TanshukuKishuMei = :tanshukuKishuMei")
      .setParameter("tanshukuKishuMei", kishu.TanshukuKishuMei)
      .andWhere("k.KishuMei = :kishuMei")
      .setParameter("kishuMei", kishu.KishuMei);
    /* tslint:disable:triple-equals */
    if (kishu.TouzaiBetsu != null) {
      qb.andWhere("k.TouzaiBetsu = :touzaiBetsu")
        .setParameter("touzaiBetsu", kishu.TouzaiBetsu);
    } else {
      qb.andWhere("k.TouzaiBetsu IS NULL");
    }
    if (kishu.ShozokuBasho != null) {
      qb.andWhere("k.ShozokuBasho = :shozokuBasho")
        .setParameter("shozokuBasho", kishu.ShozokuBasho);
    } else {
      qb.andWhere("k.ShozokuBasho IS NULL");
    }
    if (kishu.MinaraiKubun != null) {
      qb.andWhere("k.MinaraiKubun = :minaraiKubun")
        .setParameter("minaraiKubun", kishu.MinaraiKubun);
    } else {
      qb.andWhere("k.MinaraiKubun IS NULL");
    }
    if (kishu.ShikakuKubun != null) {
      qb.andWhere("k.ShikakuKubun = :shikakuKubun")
        .setParameter("shikakuKubun", kishu.ShikakuKubun);
    } else {
      qb.andWhere("k.ShikakuKubun IS NULL");
    }
    if (kishu.Kyuusha != null) {
      qb.andWhere("k.KyuushaId = :kyuushaId")
        .setParameter("kyuushaId", kishu.Kyuusha.Id);
    } else {
      qb.andWhere("k.KyuushaId IS NULL");
    }
    /* tslint:enable:triple-equals */
    return await qb.getOne();
  }

  public async saveKishu(toBe: Kishu) {
    const asIs = await this.getKishu(toBe);
    if (asIs) {
      let action: ActionForDB;
      if (!asIs.KishuMei) {
        if (toBe.KishuMei) {
          this.tool.changeAsIs(asIs, toBe, KishuDao.insertKeys);
          action = ActionForDB.Update;
        } else {
          return asIs;
        }
      } else {
        action = this.tool.changeAsIs(asIs, toBe, KishuDao.insertKeys);
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
    this.tanshukuKishuMeiMap.set(toBe.TanshukuKishuMei, toBe);
    if (toBe.KishuMei) {
      this.kishuMeiMap.set(toBe.KishuMei, toBe);
    }
    return toBe;
  }

}