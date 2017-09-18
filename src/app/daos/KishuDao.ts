import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmEntityManager, OrmRepository } from "typeorm-typedi-extensions";
import { MeishouDao } from "./MeishouDao";
import { Kishu } from "../entities/Kishu";
import { KishuMeishou } from "../entities/KishuMeishou";
import { Meishou } from "../entities/Meishou";
import { Tool } from "../reader/Tool";

@Service()
export class KishuDao {

  @OrmEntityManager()
  protected entityManager: EntityManager;

  @OrmRepository(Kishu)
  private kishuRepository: Repository<Kishu>;

  @OrmRepository(KishuMeishou)
  private kishuMeishouRepository: Repository<KishuMeishou>;

  @Inject()
  private meishouDao: MeishouDao;

  @Inject()
  private tool: Tool;

  protected async getKishu(kishu: Kishu) {
    let result: Kishu;
    if (kishu.KolKishuCode) {
      result = await this.kishuRepository.findOne({ KolKishuCode: kishu.KolKishuCode });
    } else if (kishu.JrdbKishuCode) {
      result = await this.kishuRepository.findOne({ JrdbKishuCode: kishu.JrdbKishuCode });
    }
    return result;
  }

  public async getKishuWith(namae: string) {
    const qb = this.entityManager
      .createQueryBuilder()
      .select("k.*")
      .from(Kishu, "k")
      .innerJoin(KishuMeishou, "km", "k.Id = km.KishuId")
      .innerJoin(Meishou, "m", "m.Id = km.MeishouId")
      .where("m.Namae = :namae")
      .setParameter("namae", namae);
    return qb.getOne();
  }

  public async saveKishu(toBe: Kishu, namae?: string, tanshuku?: string) {
    const asIs = await this.getKishu(toBe);
    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, false);
      if (updateSet) {
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
    if (namae) {
      await this.saveKishuMeishou(toBe, namae);
    }
    if (tanshuku) {
      await this.saveKishuMeishou(toBe, tanshuku);
      if (3 < tanshuku.length) {
        tanshuku = tanshuku.substring(0, 3);
        await this.saveKishuMeishou(toBe, tanshuku);
      }
    }
    return toBe;
  }

  protected async saveKishuMeishou(kishu: Kishu, namae: string) {
    const meishou = await this.meishouDao.save(namae);
    let kishuMeishou = await this.kishuMeishouRepository.findOne({ KishuId: kishu.Id, MeishouId: meishou.Id });
    if (!kishuMeishou) {
      kishuMeishou = new KishuMeishou();
      kishuMeishou.KishuId = kishu.Id;
      kishuMeishou.MeishouId = meishou.Id;
      await this.kishuMeishouRepository.save(kishuMeishou);
    }
  }

}