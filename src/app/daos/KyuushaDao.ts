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
  private kyuushaMeiRepository: Repository<KyuushaMei>;

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
      .innerJoin(Jinmei, "j", "j.Id = km.JinmeiId")
      .where("j.Name = :name")
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
    if (!asIs || seimei && tanshuku && furigana) {
      toBe = await this.tool.saveOrUpdate(Kyuusha, asIs, toBe);
    } else {
      return asIs;
    }
    if (seimei) {
      await this.saveKyuushaMei(toBe, Kubun.Seimei, seimei);
    }
    if (tanshuku) {
      await this.saveKyuushaMei(toBe, Kubun.Tanshuku, tanshuku);
      if (3 < tanshuku.length) {
        tanshuku = tanshuku.substring(0, 3);
        await this.saveKyuushaMei(toBe, Kubun.Tanshuku, tanshuku);
      }
    }
    if (furigana) {
      await this.saveKyuushaMei(toBe, Kubun.Furigana, tanshuku);
    }
    return toBe;
  }

  protected async saveKyuushaMei(kyuusha: Kyuusha, kubun: Kubun, name: string) {
    const jinmei = await this.jinmeiDao.save(kubun, name);
    let kyuushaMei = await this.kyuushaMeiRepository.findOne({ KyuushaId: kyuusha.Id, JinmeiId: jinmei.Id });
    if (!kyuushaMei) {
      kyuushaMei = new KyuushaMei();
      kyuushaMei.KyuushaId = kyuusha.Id;
      kyuushaMei.JinmeiId = jinmei.Id;
      await this.kyuushaMeiRepository.save(kyuushaMei);
    }
  }

}