import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { Banushi } from "../entities/Banushi";

@Service()
export class BanushiDao {

  @OrmEntityManager()
  private entityManager: EntityManager;

  protected async getBanushi(banushi: Banushi) {
    return await this.entityManager
      .getRepository(Banushi)
      .createQueryBuilder("b")
      .where("b.BanushiMei = :banushiMei")
      .setParameter("banushiMei", banushi.BanushiMei)
      .getOne();
  }

  public async saveBanushi(toBe: Banushi) {
    const asIs = await this.getBanushi(toBe);
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.entityManager.persist(toBe);
    }
    return toBe;
  }

}