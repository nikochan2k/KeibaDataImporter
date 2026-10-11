import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { Jinmei, JinmeiKubun } from "../entities/Jinmei";
import { Kishu } from "../entities/Kishu";
import { KishuMei } from "../entities/KishuMei";
import { OrmManager, OrmRepository } from "../OrmManager";
import { Tool } from "../reader/Tool";
import { JinmeiDao, jinmeiMatchingKey } from "./JinmeiDao";

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

  private static readonly codeKeys = ["KolKishuCode", "JrdbKishuCode", "JvDataKishuCode"] as const;

  /** 同じ種類のコードを両方持っていて、値が違うなら別人 */
  private conflicts(a: Kishu, b: Kishu) {
    return KishuDao.codeKeys.some((k) => a[k] != null && b[k] != null && a[k] !== b[k]);
  }

  /** 名前(姓名か略称)が一致する騎手のうち、別人でないもの */
  private async findByMeishou(toBe: Kishu, meishou: string) {
    const candidates = await this.kishuRepository
      .createQueryBuilder("k")
      .innerJoin(KishuMei, "km", "km.KishuId = k.Id")
      .innerJoin(Jinmei, "j", "j.Id = km.JinmeiId")
      .where("j.MatchingKey = :key", { key: jinmeiMatchingKey(meishou) })
      .getMany();
    return candidates.filter(
      (c) =>
        !this.conflicts(c, toBe) &&
        (!toBe.Seinengappi || !c.Seinengappi || toBe.Seinengappi === c.Seinengappi),
    );
  }

  /**
   * 既存の騎手を探します。コード(KOL・JRDB・JRA-VAN)のどれかが一致すればその騎手、
   * なければ姓名(と生年月日)が一致する騎手、姓名がなければ略称が一致する騎手が 1 人だけのときその騎手です。
   * 別の情報源で取り込んだ騎手を同じ行にまとめるために、コードが違っても名前で探します。
   */
  protected async getKishu(kishu: Kishu, seimei?: string, tanshuku?: string) {
    for (const key of KishuDao.codeKeys) {
      if (kishu[key]) {
        const found = await this.kishuRepository.findOneBy({ [key]: kishu[key] });
        if (found) {
          return found;
        }
      }
    }
    if (seimei) {
      const candidates = await this.findByMeishou(kishu, seimei);
      if (candidates.length === 1 || (candidates.length > 1 && kishu.Seinengappi)) {
        return candidates[0];
      }
    } else if (tanshuku) {
      const candidates = await this.findByMeishou(kishu, tanshuku);
      if (candidates.length === 1) {
        return candidates[0];
      }
    }
    return null;
  }

  public async getKishuWith(jinmeiId: number, umaId: number) {
    const kishuList = <Kishu[]>await this.entityManager.query(
      `SELECT
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
  1`,
      [jinmeiId, umaId],
    );

    if (kishuList.length === 0) {
      return null;
    }

    return kishuList[0];
  }

  public async saveKishu(toBe: Kishu, seimei?: string, tanshuku?: string, furigana?: string) {
    const asIs = await this.getKishu(toBe, seimei, tanshuku);
    const newCode = !!asIs && KishuDao.codeKeys.some((k) => toBe[k] != null && asIs[k] == null);
    if (!asIs || newCode || (seimei && tanshuku && furigana)) {
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
    let kishuMei = await this.kishuMeiRepository.findOneBy({
      KishuId: kishu.Id,
      JinmeiId: jinmei.Id,
    });
    if (!kishuMei) {
      kishuMei = new KishuMei();
      kishuMei.KishuId = kishu.Id;
      kishuMei.JinmeiId = jinmei.Id;
      await this.kishuMeiRepository.save(kishuMei);
    }
  }
}
