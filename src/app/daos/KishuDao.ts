import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import { JinmeiDao } from "./JinmeiDao";
import { Kishu } from "../entities/Kishu";
import { KishuMei } from "../entities/KishuMei";
import { JinmeiKubun } from "../entities/Jinmei";
import { Tool } from "../reader/Tool";

@Service()
export class KishuDao {

  @OrmManager()
  protected entityManager: EntityManager;

  @OrmRepository(Kishu)
  private kishuRepository: Repository<Kishu>;

  @OrmRepository(KishuMei)
  private kishuMeiRepository: Repository<KishuMei>;

  @Inject()
  private jinmeiDao: JinmeiDao;

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

  public async getKishuWith(jinmeiId: number, umaId: number) {
    const kishuList = <Kishu[]>await this.entityManager.query(`SELECT
  k.*
FROM
  Kishu k
  INNER JOIN KishuMei km ON k.Id = km.KishuId
WHERE
  km.JinmeiId = ?
ORDER BY
  (
    SELECT
      COUNT(*)
    FROM
      Shussouba s
      INNER JOIN Kyousouba ky ON ky.Id = s.KyousoubaId
    WHERE
      k.Id = s.KishuId
    AND
      ky.UmaId = ?
  ) DESC
LIMIT
  1`, [jinmeiId, umaId]);

    if (kishuList.length === 0) {
      return null;
    }

    return kishuList[0];
  }

  public async saveKishu(toBe: Kishu, seimei?: string, tanshuku?: string, furigana?: string) {
    const asIs = await this.getKishu(toBe);
    if (!asIs || seimei && tanshuku && furigana) {
      toBe = await this.tool.saveOrUpdate(Kishu, asIs, toBe);
    } else {
      return asIs;
    }
    if (seimei) {
      await this.saveKishuMei(toBe, JinmeiKubun.Seimei, seimei);
    }
    if (tanshuku) {
      await this.saveKishuMei(toBe, JinmeiKubun.Tanshuku, tanshuku);
      if (3 < tanshuku.length) {
        tanshuku = tanshuku.substring(0, 3);
        await this.saveKishuMei(toBe, JinmeiKubun.Tanshuku, tanshuku);
      }
    }
    if (furigana) {
      await this.saveKishuMei(toBe, JinmeiKubun.Furigana, furigana);
    }
    return toBe;
  }

  protected async saveKishuMei(kishu: Kishu, kubun: JinmeiKubun, meishou: string) {
    const jinmei = await this.jinmeiDao.save(kubun, meishou);
    let kishuMei = await this.kishuMeiRepository.findOne({ KishuId: kishu.Id, JinmeiId: jinmei.Id });
    if (!kishuMei) {
      kishuMei = new KishuMei();
      kishuMei.KishuId = kishu.Id;
      kishuMei.JinmeiId = jinmei.Id;
      await this.kishuMeiRepository.save(kishuMei);
    }
  }

}