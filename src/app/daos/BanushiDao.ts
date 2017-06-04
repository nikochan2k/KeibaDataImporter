import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { Banushi } from "../entities/Banushi";

@Service()
export class BanushiDao {

  @OrmEntityManager()
  private entityManager: EntityManager;

  private banushiMeiMap = new Map<string, Banushi>();

  protected async getBanushi(banushi: Banushi) {
    let result = this.banushiMeiMap.get(banushi.BanushiMei);
    if (!result) {
      result = await this.getBanushiFromDB(banushi);
      if (result) {
        this.banushiMeiMap.set(banushi.BanushiMei, banushi);
      }
    }
    return result;
  }

  protected async getBanushiFromDB(banushi: Banushi) {
    return await this.entityManager
      .getRepository(Banushi)
      .createQueryBuilder("b")
      .where("b.BanushiMei = :BanushiMei")
      .setParameter("BanushiMei", banushi.BanushiMei)
      .getOne();
  }

  public async saveBanushi(toBe: Banushi) {
    const asIs = await this.getBanushi(toBe);
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.entityManager.persist(toBe);
      this.banushiMeiMap.set(toBe.BanushiMei, toBe);
    }
    return toBe;
  }

}