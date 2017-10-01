import { Service, Inject } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import { Meishou } from "../entities/Meishou";
import { Kyuusha } from "../entities/Kyuusha";
import { KyuushaMeishou } from "../entities/KyuushaMeishou";
import { MeishouDao } from "./MeishouDao";
import { Tool } from "../reader/Tool";

@Service()
export class KyuushaDao {

  @OrmManager()
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

  protected async getKyuushaWith(namae: string) {
    return this.entityManager
      .createQueryBuilder()
      .select("k.*")
      .from(Kyuusha, "k")
      .innerJoin(KyuushaMeishou, "km", "k.Id = km.KyuushaId")
      .innerJoin(Meishou, "m", "m.Id = km.MeishouId")
      .where("m.Namae = :namae")
      .setParameter("namae", namae)
      .getOne();
  }

  public async saveKyuusha(toBe: Kyuusha, namae?: string, tanshuku?: string) {
    let asIs: Kyuusha;
    if (toBe.KolKyuushaCode || toBe.JrdbKyuushaCode) {
      asIs = await this.getKyuusha(toBe);
    } else {
      asIs = await this.getKyuushaWith(namae);
    }
    toBe = await this.tool.update(Kyuusha, asIs, toBe);
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