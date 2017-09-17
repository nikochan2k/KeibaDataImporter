import { Service, Inject } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmEntityManager, OrmRepository } from "typeorm-typedi-extensions";
import { Kyuusha } from "../entities/Kyuusha";
import { KyuushaMeishou } from "../entities/KyuushaMeishou";
import { MeishouDao } from "./MeishouDao";
import { Tool } from "../reader/Tool";

@Service()
export class KyuushaDao {

  @OrmEntityManager()
  protected entityManager: EntityManager;

  @OrmRepository(Kyuusha)
  private kyuushaRepository: Repository<Kyuusha>;

  @OrmRepository(KyuushaMeishou)
  private kyuushaMeishouRepository: Repository<KyuushaMeishou>;

  @Inject()
  private meishouDao: MeishouDao;

  @Inject()
  private tool: Tool;

  protected async getKyuusha(kyuusha: Kyuusha) {
    let result: Kyuusha;
    if (kyuusha.KolKyuushaCode) {
      result = await this.kyuushaRepository.findOne({ KolKyuushaCode: kyuusha.KolKyuushaCode });
    } else if (kyuusha.JrdbKyuushaCode) {
      result = await this.kyuushaRepository.findOne({ JrdbKyuushaCode: kyuusha.JrdbKyuushaCode });
    }
    return result;
  }

  public async saveKyuusha(toBe: Kyuusha, namae?: string, tanshuku?: string) {
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
      toBe = await this.kyuushaRepository.save(toBe);
    }
    if (namae) {
      await this.saveKyuushaMeishou(toBe, namae);
    }
    if (tanshuku) {
      await this.saveKyuushaMeishou(toBe, tanshuku);
      if (3 < tanshuku.length) {
        tanshuku = tanshuku.substring(0, 3);
        await this.saveKyuushaMeishou(toBe, tanshuku);
      }
    }
    return toBe;
  }

  protected async saveKyuushaMeishou(kyuusha: Kyuusha, namae: string) {
    const meishou = await this.meishouDao.save(namae);
    let kyuushaMeishou = await this.kyuushaMeishouRepository.findOne({ KyuushaId: kyuusha.Id, MeishouId: meishou.Id });
    if (!kyuushaMeishou) {
      kyuushaMeishou = new KyuushaMeishou();
      kyuushaMeishou.KyuushaId = kyuusha.Id;
      kyuushaMeishou.MeishouId = meishou.Id;
      await this.kyuushaMeishouRepository.save(kyuushaMeishou);
    }
  }

}