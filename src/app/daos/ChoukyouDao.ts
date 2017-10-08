import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import { Choukyou } from "../entities/Choukyou";
import { Tool } from "../reader/Tool";

@Service()
export class ChoukyouDao {

  @OrmManager()
  protected entityManager: EntityManager;

  @OrmRepository(Choukyou)
  private repository: Repository<Choukyou>;

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

  public async save(toBe: Choukyou) {
    const asIs = await this.findOneById(toBe.Id);
    return await this.tool.saveOrUpdate(Choukyou, asIs, toBe);
  }

}