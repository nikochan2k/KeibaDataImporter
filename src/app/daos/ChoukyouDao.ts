import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import { ShussoubaChoukyou } from "../entities/ShussoubaChoukyou";
import { Tool } from "../reader/Tool";

@Service()
export class ChoukyouDao {

  @OrmManager()
  protected entityManager: EntityManager;

  @OrmRepository(ShussoubaChoukyou)
  private repository: Repository<ShussoubaChoukyou>;

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

  public async save(toBe: ShussoubaChoukyou) {
    const asIs = await this.findOneById(toBe.Id);
    return await this.tool.saveOrUpdate(ShussoubaChoukyou, asIs, toBe);
  }

}