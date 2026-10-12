import { findOneBy, getOrCreate, query } from "../db/helpers";
import { JinmeiKubun } from "../entities/Jinmei";
import { Kishu } from "../entities/Kishu";
import { KishuMei } from "../entities/KishuMei";
import { tool } from "../reader/Tool";
import { jinmeiDao, jinmeiMatchingKey } from "./JinmeiDao";

export class KishuDao {
  private static readonly codeKeys = ["KolKishuCode", "JrdbKishuCode", "JvDataKishuCode"] as const;

  /** 同じ種類のコードを両方持っていて、値が違うなら別人 */
  private conflicts(a: Kishu, b: Kishu) {
    return KishuDao.codeKeys.some((k) => a[k] != null && b[k] != null && a[k] !== b[k]);
  }

  /** 名前(姓名か略称)が一致する騎手のうち、別人でないもの */
  private async findByMeishou(toBe: Kishu, meishou: string) {
    const rows = query<Kishu>(
      `SELECT k.* FROM Kishu k
        INNER JOIN KishuMei km ON km.KishuId = k.Id
        INNER JOIN Jinmei j ON j.Id = km.JinmeiId
        WHERE j.MatchingKey = ?`,
      jinmeiMatchingKey(meishou),
    );
    // 名前が複数一致しても 1 人 1 行にする
    const candidates = [...new Map(rows.map((row) => [row.Id, row])).values()];
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
    return (await this.lookup(kishu, seimei, tanshuku)).found;
  }

  /**
   * 名前が当たらないとき、生年月日が一致しコードが矛盾しない騎手が 1 人だけなら、
   * 姓が変わった同一人物とみなす。生年月日は同じ別人がありうるので、候補が 1 人のときに限る。
   */
  private async findBySeinengappi(toBe: Kishu) {
    if (!toBe.Seinengappi) {
      return [];
    }
    return query<Kishu>("SELECT * FROM Kishu WHERE Seinengappi = ?", toBe.Seinengappi).filter(
      (c) => !this.conflicts(c, toBe),
    );
  }

  /** その行に、この姓名(照合キーが同じもの)が登録済みか */
  private hasSeimei(row: Kishu, seimei: string) {
    return (
      query<{ Id: number }>(
        `SELECT m.Id FROM KishuMei m
          INNER JOIN Jinmei j ON j.Id = m.JinmeiId
          WHERE m.KishuId = ? AND m.Kubun = ? AND j.MatchingKey = ? LIMIT 1`,
        row.Id,
        JinmeiKubun.Seimei,
        jinmeiMatchingKey(seimei),
      ).length > 0
    );
  }

  private async lookup(kishu: Kishu, seimei?: string, tanshuku?: string) {
    for (const key of KishuDao.codeKeys) {
      if (kishu[key]) {
        const found = await findOneBy(Kishu, { [key]: kishu[key] });
        if (found) {
          return { found, renamed: false };
        }
      }
    }
    if (seimei) {
      const candidates = await this.findByMeishou(kishu, seimei);
      if (candidates.length === 1 || (candidates.length > 1 && kishu.Seinengappi)) {
        return { found: candidates[0], renamed: false };
      }
      if (candidates.length === 0) {
        const bySeinengappi = await this.findBySeinengappi(kishu);
        if (bySeinengappi.length === 1) {
          return { found: bySeinengappi[0], renamed: true };
        }
      }
    } else if (tanshuku) {
      const candidates = await this.findByMeishou(kishu, tanshuku);
      if (candidates.length === 1) {
        return { found: candidates[0], renamed: false };
      }
    }
    return { found: null, renamed: false };
  }

  public async getKishuWith(jinmeiId: number, umaId: number) {
    const kishuList = query<Kishu>(
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
      jinmeiId,
      umaId,
    );

    if (kishuList.length === 0) {
      return null;
    }

    return kishuList[0];
  }

  public async saveKishu(toBe: Kishu, seimei?: string, tanshuku?: string, furigana?: string) {
    const { found: asIs, renamed: foundByBirthday } = await this.lookup(toBe, seimei, tanshuku);
    // コードで見つかっても姓名が未登録(姓が変わった)なら、新しい名前を登録する
    const renamed = foundByBirthday || (!!asIs && !!seimei && !this.hasSeimei(asIs, seimei));
    const newCode = !!asIs && KishuDao.codeKeys.some((k) => toBe[k] != null && asIs[k] == null);
    if (!asIs || newCode || renamed || (seimei && tanshuku && furigana)) {
      toBe = await tool.saveOrUpdate(Kishu, asIs, toBe);
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
    const jinmei = await jinmeiDao.save(meishou);
    getOrCreate(KishuMei, { KishuId: kishu.Id, JinmeiId: jinmei.Id, Kubun: kubun }, [
      "KishuId",
      "JinmeiId",
      "Kubun",
    ]);
  }
}

export const kishuDao = new KishuDao();
