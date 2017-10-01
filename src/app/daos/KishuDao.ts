import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import { MeishouDao } from "./MeishouDao";
import { Kishu } from "../entities/Kishu";
import { KishuMeishou } from "../entities/KishuMeishou";
import { Tool } from "../reader/Tool";

@Service()
export class KishuDao {

  @OrmManager()
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

  public async getKishuWith(meishouId: number, umaId: number) {
    const kishuList = <Kishu[]>await this.entityManager.query(`SELECT
  k.*
FROM
  Kishu k
  INNER JOIN KishuMeishou km ON k.Id = km.KishuId
WHERE
  km.MeishouId = ?
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
  1`, [meishouId, umaId]);

    if (kishuList.length === 0) {
      return null;
    }

    return kishuList[0];
  }

  public async saveKishu(toBe: Kishu, namae?: string, tanshuku?: string) {
    const asIs = await this.getKishu(toBe);
    if (asIs) {
      toBe = await this.tool.update(Kishu, asIs, toBe);
    } else {
      toBe = await this.entityManager.save(toBe);
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