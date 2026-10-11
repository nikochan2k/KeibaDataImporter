import { Inject, Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { ShussoubaChoukyou } from "../entities/ShussoubaChoukyou";
import { OrmManager } from "../OrmManager";
import { Tool } from "../reader/Tool";

@Injectable()
export class ChoukyouDao {
  @OrmManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: Tool;

  /**
   * 出走馬と調教を結びつけます。同じ出走馬・同じ調教の行があれば更新し(null では消さない)、
   * なければ出走馬ごとの空いている連番で作ります。
   */
  public async saveShussoubaChoukyou(toBe: ShussoubaChoukyou) {
    const list = await this.entityManager.findBy(ShussoubaChoukyou, {
      ShussoubaId: toBe.ShussoubaId,
    });
    const asIs = list.find((sc) => sc.ChoukyouId === toBe.ChoukyouId);
    if (asIs) {
      toBe.Id = asIs.Id;
      return await this.tool.saveOrUpdate(ShussoubaChoukyou, asIs, toBe, true);
    }
    const used = new Set(list.map((sc) => sc.Id));
    for (let i = 0; i < 2 ** 3; i++) {
      const id = toBe.ShussoubaId * 2 ** 3 + i;
      if (!used.has(id)) {
        toBe.Id = id;
        return await this.tool.saveOrUpdate(ShussoubaChoukyou, null, toBe);
      }
    }
    throw new Error(`出走馬に結びつく調教が多すぎます: ShussoubaId=${toBe.ShussoubaId}`);
  }
}
