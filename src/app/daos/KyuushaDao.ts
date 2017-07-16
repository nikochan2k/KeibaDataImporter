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

  protected getKyuusha(kyuusha: Kyuusha) {
    if (kyuusha.KolKyuushaCode) {
      return this.repository.findOne({ KolKyuushaCode: kyuusha.KolKyuushaCode });
    }
    if (kyuusha.JrdbKyuushaCode) {
      return this.repository.findOne({ JrdbKyuushaCode: kyuusha.JrdbKyuushaCode });
    }
    return null;
  }

  public async saveKyuusha(toBe: Kyuusha) {
    if (!toBe.KolKyuushaCode && !toBe.JrdbKyuushaCode) {
      return null;
    }
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