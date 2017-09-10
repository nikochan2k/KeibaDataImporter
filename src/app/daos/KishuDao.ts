import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmEntityManager, OrmRepository } from "typeorm-typedi-extensions";
import { Kishu } from "../entities/Kishu";
import { Tool } from "../reader/Tool";

@Service()
export class KishuDao {

  @OrmEntityManager()
  protected entityManager: EntityManager;

  @OrmRepository(Kishu)
  private kishuRepository: Repository<Kishu>;

  @Inject()
  private tool: Tool;

  protected async getKishu(kishu: Kishu) {
    let result: Kishu;
    if (kishu.KolKishuCode) {
      result = await this.kishuRepository.findOne({ KolKishuCode: kishu.KolKishuCode });
    }
    if (!result && kishu.JrdbKishuCode) {
      result = await this.kishuRepository.findOne({ JrdbKishuCode: kishu.JrdbKishuCode });
    }
    if (!result && kishu.KishuMei) {
      result = await this.kishuRepository.findOne({ KishuMei: kishu.KishuMei });
    }
    if (result) {
      return result;
    }

    const list = await this.kishuRepository.find({ TanshukuKishuMei: kishu.TanshukuKishuMei });
    const length = list.length;
    if (length === 0) {
      return null;
    }
    if (length === 1) {
      return list[0];
    }

    let diff = Number.MAX_VALUE;
    for (let i = 0; i < length; i++) {
      const item = list[i];
      if (kishu.FromDate < item.FromDate) {
        const fromDiff = item.FromDate - kishu.FromDate;
        if (fromDiff < diff) {
          diff = fromDiff;
          result = item;
        }
      } else if (item.ToDate < kishu.ToDate) {
        const toDiff = kishu.ToDate - item.ToDate;
        if (toDiff < diff) {
          diff = toDiff;
          result = item;
        }
      } else {
        return item;
      }
    }
    return result;
  }

  public async saveKishu(toBe: Kishu) {
    if (3 < toBe.TanshukuKishuMei.length) {
      toBe.TanshukuKishuMei = toBe.TanshukuKishuMei.substring(0, 3);
    }
    const asIs = await this.getKishu(toBe);
    if (asIs) {
      let updateSet = this.tool.createUpdateSet(asIs, toBe, false);
      if (!updateSet) {
        updateSet = {};
      }
      if (toBe.FromDate < asIs.FromDate) {
        updateSet.FromDate = asIs.FromDate = toBe.FromDate;
      }
      if (asIs.ToDate < toBe.ToDate) {
        updateSet.ToDate = asIs.ToDate = toBe.ToDate;
      }
      if (0 < Object.keys(updateSet).length) {
        await this.entityManager
          .createQueryBuilder()
          .update(Kishu, updateSet)
          .where("Id = :id")
          .setParameter("id", asIs.Id)
          .execute();
      }
      toBe = asIs;
    } else {
      toBe = await this.kishuRepository.save(toBe);
    }
    return toBe;
  }

}