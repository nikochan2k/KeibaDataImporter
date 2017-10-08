import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import { Banushi } from "../entities/Banushi";
import { Tool } from "../reader/Tool";

@Service()
export class BanushiDao {

  @OrmManager()
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
    return await this.tool.saveOrUpdate(Banushi, asIs, toBe);
  }

}