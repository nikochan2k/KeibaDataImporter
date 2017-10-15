import { Service, Inject } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import { Kubun, Jinmei } from "../entities/Jinmei";
import { Kyuusha } from "../entities/Kyuusha";
import { KyuushaMei } from "../entities/KyuushaMei";
import { JinmeiDao } from "./JinmeiDao";
import { Tool } from "../reader/Tool";

@Service()
export class KyuushaDao {

  @OrmManager()
  protected entityManager: EntityManager;

  @OrmRepository(Kyuusha)
  private kyuushaRepository: Repository<Kyuusha>;

  @OrmRepository(KyuushaMei)
  private kyuushaMeishouRepository: Repository<KyuushaMei>;

  @Inject()
  private jinmeiDao: JinmeiDao;

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

  protected async getKyuushaWith(name: string) {
    return this.entityManager
      .createQueryBuilder()
      .select("k.*")
      .from(Kyuusha, "k")
      .innerJoin(KyuushaMei, "km", "k.Id = km.KyuushaId")
      .innerJoin(Jinmei, "m", "m.Id = km.MeishouId")
      .where("m.Name = :name")
      .setParameter("name", name)
      .getOne();
  }

  public async saveKyuusha(toBe: Kyuusha, seimei?: string, tanshuku?: string, furigana?: string) {
    let asIs: Kyuusha;
    if (toBe.KolKyuushaCode || toBe.JrdbKyuushaCode) {
      asIs = await this.getKyuusha(toBe);
    } else {
      asIs = await this.getKyuushaWith(seimei);
    }
    toBe = await this.tool.saveOrUpdate(Kyuusha, asIs, toBe);
    if (seimei) {
      await this.saveKyuushaMeishou(toBe, Kubun.Seimei, seimei);
    }
    if (tanshuku) {
      await this.saveKyuushaMeishou(toBe, Kubun.Tanshuku, tanshuku);
      if (3 < tanshuku.length) {
        tanshuku = tanshuku.substring(0, 3);
        await this.saveKyuushaMeishou(toBe, Kubun.Tanshuku, tanshuku);
      }
    }
    if (furigana) {
      await this.saveKyuushaMeishou(toBe, Kubun.Furigana, tanshuku);
    }
    return toBe;
  }

  protected async saveKyuushaMeishou(kyuusha: Kyuusha, kubun: Kubun, name: string) {
    const jinmei = await this.jinmeiDao.save(kubun, name);
    let kyuushaMeishou = await this.kyuushaMeishouRepository.findOne({ KyuushaId: kyuusha.Id, JinmeiId: jinmei.Id });
    if (!kyuushaMeishou) {
      kyuushaMeishou = new KyuushaMei();
      kyuushaMeishou.KyuushaId = kyuusha.Id;
      kyuushaMeishou.JinmeiId = jinmei.Id;
      await this.kyuushaMeishouRepository.save(kyuushaMeishou);
    }
  }

}