import { Service, Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { DaoTool, ActionForDB } from "./RepositoryTool";
import { Uma } from "../entities/Uma";

@Service()
export class UmaDao {

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: DaoTool;

  private umaMap = new Map<string, Uma>();

  protected async getUma(uma: Uma) {
    let result = this.umaMap.get(uma.Bamei);
    if (!result) {
      result = await this.getUmaFromDB(uma);
      if (result) {
        this.umaMap.set(result.Bamei, result);
      }
    }
    return result;
  }

  protected async getUmaFromDB(uma: Uma) {
    return await this.entityManager
      .getRepository(Uma)
      .createQueryBuilder("u")
      .where("u.Bamei = :bamei")
      .orWhere("u.KyuuBamei = :bamei")
      .setParameter("bamei", uma.Bamei)
      .getOne();
  }

  public async saveUma(toBe: Uma) {
    const asIs = await this.getUma(toBe);
    if (asIs) {
      const action = this.tool.changeAsIs(asIs, toBe, []);
      if (action === ActionForDB.None) {
        return asIs;
      }
      toBe = await this.entityManager.persist(asIs);
    } else {
      toBe = await this.entityManager.persist(toBe);
    }
    this.umaMap.set(toBe.Bamei, toBe);
    return toBe;
  }

}