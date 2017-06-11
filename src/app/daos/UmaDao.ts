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

  protected async getUma(uma: Uma) {
    return await this.entityManager
      .getRepository(Uma)
      .createQueryBuilder("u")
      .where("u.Bamei = :bamei")
      .orWhere("u.KyuuBamei = :bamei")
      .setParameter("bamei", uma.Bamei)
      .getOne();
  }

  public async saveUma(toBe: Uma) {
    let asIs = await this.getUma(toBe);
    if (asIs) {
      asIs = await this.entityManager.preload(Uma, asIs);
      const action = this.tool.changeAsIs(asIs, toBe, []);
      if (action === ActionForDB.None) {
        return asIs;
      }
      toBe = await this.entityManager.persist(asIs);
    } else {
      toBe = await this.entityManager.persist(toBe);
    }
    return toBe;
  }

}