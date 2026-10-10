import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "../OrmManager";
import { ShussoubaChoukyou } from "../entities/ShussoubaChoukyou";
import { Tool } from "../reader/Tool";

@Service()
export class ChoukyouDao {

  @OrmRepository(ShussoubaChoukyou)
  private repository: Repository<ShussoubaChoukyou>;

  @Inject()
  private tool: Tool;

  public findOne(id: number) {
    /* tslint:disable:triple-equals */
    if (id == null) {
      return null;
    }
    /* tslint:enable:triple-equals */
    return this.repository.findOneBy({ Id: id });
  }

  public async save(toBe: ShussoubaChoukyou) {
    const asIs = await this.findOne(toBe.Id);
    return await this.tool.saveOrUpdate(ShussoubaChoukyou, asIs, toBe);
  }

}