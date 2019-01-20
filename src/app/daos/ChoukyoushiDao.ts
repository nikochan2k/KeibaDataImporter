import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import { JinmeiDao } from "./JinmeiDao";
import { Choukyoushi } from "../entities/Choukyoushi";
import { ChoukyoushiMei as ChoukyoushiMei } from "../entities/ChoukyoushiMei";
import { Jinmei, JinmeiKubun } from "../entities/Jinmei";
import { Tool } from "../reader/Tool";

@Service()
export class ChoukyoushiDao {

  @OrmManager()
  protected entityManager: EntityManager;

  @OrmRepository(Choukyoushi)
  private choukyoushiRepository: Repository<Choukyoushi>;

  @OrmRepository(ChoukyoushiMei)
  private choukyoushiMeiRepository: Repository<ChoukyoushiMei>;

  @Inject()
  private jinmeiDao: JinmeiDao;

  @Inject()
  private tool: Tool;

  protected async getChoukyoushi(choukyoushi: Choukyoushi) {
    let result: Choukyoushi;
    if (choukyoushi.KolKyuushaCode) {
      result = await this.choukyoushiRepository.findOne({ KolKyuushaCode: choukyoushi.KolKyuushaCode });
    } else if (choukyoushi.JrdbChoukyoushiCode) {
      result = await this.choukyoushiRepository.findOne({ JrdbChoukyoushiCode: choukyoushi.JrdbChoukyoushiCode });
    }
    return result;
  }

  protected async getChoukyoushiWith(meishou: string) {
    return this.entityManager
      .createQueryBuilder()
      .select("c.*")
      .from(Choukyoushi, "c")
      .innerJoin(ChoukyoushiMei, "cm", "c.Id = cm.ChoukyoushiId")
      .innerJoin(Jinmei, "j", "j.Id = cm.JinmeiId")
      .where("j.Meishou = :meishou")
      .setParameter("meishou", meishou)
      .getOne();
  }

  public async saveChoukyoushi(toBe: Choukyoushi, seimei?: string, tanshuku?: string, furigana?: string) {
    let asIs: Choukyoushi;
    if (toBe.KolKyuushaCode || toBe.JrdbChoukyoushiCode) {
      asIs = await this.getChoukyoushi(toBe);
    } else {
      asIs = await this.getChoukyoushiWith(seimei);
    }
    if (!asIs || seimei && tanshuku && furigana) {
      toBe = await this.tool.saveOrUpdate(Choukyoushi, asIs, toBe);
    } else {
      return asIs;
    }
    if (seimei) {
      await this.saveChoukyoushiMei(toBe, JinmeiKubun.Seimei, seimei);
    }
    if (tanshuku) {
      await this.saveChoukyoushiMei(toBe, JinmeiKubun.Tanshuku, tanshuku);
      if (3 < tanshuku.length) {
        tanshuku = tanshuku.substring(0, 3);
        await this.saveChoukyoushiMei(toBe, JinmeiKubun.Tanshuku, tanshuku);
      }
    }
    if (furigana) {
      await this.saveChoukyoushiMei(toBe, JinmeiKubun.Furigana, furigana);
    }
    return toBe;
  }

  protected async saveChoukyoushiMei(choukyoushi: Choukyoushi, kubun: JinmeiKubun, meishou: string) {
    const jinmei = await this.jinmeiDao.save(kubun, meishou);
    let choukyoushiMei = await this.choukyoushiMeiRepository.findOne({ ChoukyoushiId: choukyoushi.Id, JinmeiId: jinmei.Id });
    if (!choukyoushiMei) {
      choukyoushiMei = new ChoukyoushiMei();
      choukyoushiMei.ChoukyoushiId = choukyoushi.Id;
      choukyoushiMei.JinmeiId = jinmei.Id;
      await this.choukyoushiMeiRepository.save(choukyoushiMei);
    }
  }

}