import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmEntityManager, OrmRepository } from "typeorm-typedi-extensions";
import { Banushi } from "../entities/Banushi";
import { Tool } from "../reader/Tool";

@Service()
export class BanushiDao {

  @OrmEntityManager()
  protected entityManager: EntityManager;

  @OrmRepository(Banushi)
  private repository: Repository<Banushi>;

  @Inject()
  private tool: Tool;

  public findOneById(id: number) {
    /* tslint:disable:triple-equals */
    if (id == null) {
      return null;
    }
    /* tslint:enable:triple-equals */
    return this.repository.findOneById(id);
  }

  public async save(toBe: Banushi) {
    const asIs = await this.repository.findOne({ BanushiMei: toBe.BanushiMei });
    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, false);
      if (updateSet) {
        await this.entityManager
          .createQueryBuilder()
          .update(Banushi, updateSet)
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