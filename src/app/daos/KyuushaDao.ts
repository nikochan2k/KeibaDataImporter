import { Service, Inject } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmEntityManager, OrmRepository } from "typeorm-typedi-extensions";
import { Kyuusha } from "../entities/Kyuusha";
import { Tool } from "../reader/Tool";

@Service()
export class KyuushaDao {

  @OrmEntityManager()
  protected entityManager: EntityManager;

  @OrmRepository(Kyuusha)
  private repository: Repository<Kyuusha>;

  @Inject()
  private tool: Tool;

  protected async getKyuusha(kyuusha: Kyuusha) {
    let result: Kyuusha;
    if (kyuusha.KolKyuushaCode) {
      result = await this.repository.findOne({ KolKyuushaCode: kyuusha.KolKyuushaCode });
    }
    if (!result && kyuusha.JrdbKyuushaCode) {
      result = await this.repository.findOne({ JrdbKyuushaCode: kyuusha.JrdbKyuushaCode });
    }
    if (!result && kyuusha.KyuushaMei) {
      result = await this.repository.findOne({ KyuushaMei: kyuusha.KyuushaMei });
    }
    return result;
  }

  public async saveKyuusha(toBe: Kyuusha) {
    const asIs = await this.getKyuusha(toBe);
    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, false);
      if (updateSet) {
        await this.entityManager
          .createQueryBuilder()
          .update(Kyuusha, updateSet)
          .where("Id = :id")
          .setParameter("id", asIs.Id)
          .execute();
      }
      toBe = asIs;
    } else {
      toBe = await this.repository.save(toBe);
    }
    return toBe;
  }

}