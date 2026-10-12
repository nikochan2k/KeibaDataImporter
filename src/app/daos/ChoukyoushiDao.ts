import { findOneBy, getOrCreate, query } from "../db/helpers";
import { Choukyoushi } from "../entities/Choukyoushi";
import { ChoukyoushiMei } from "../entities/ChoukyoushiMei";
import { MeishouKubun } from "../entities/MeishouKubun";
import { tool } from "../reader/Tool";
import { jinmeiDao, jinmeiMatchingKey, stripJinmei } from "./JinmeiDao";

export class ChoukyoushiDao {
  private static readonly codeKeys = [
    "KolKyuushaCode",
    "JrdbChoukyoushiCode",
    "JvDataChoukyoushiCode",
  ] as const;

  /** 同じ種類のコードを両方持っていて、値が違うなら別人 */
  private conflicts(a: Choukyoushi, b: Choukyoushi) {
    return ChoukyoushiDao.codeKeys.some((k) => a[k] != null && b[k] != null && a[k] !== b[k]);
  }

  /** 名前(姓名か略称)が一致する調教師のうち、別人でないもの */
  private async findByMeishou(toBe: Choukyoushi, meishou: string) {
    const rows = query<Choukyoushi & { Exact: number }>(
      `SELECT c.*, j.Meishou = ? AS Exact FROM Choukyoushi c
        INNER JOIN ChoukyoushiMei cm ON cm.ChoukyoushiId = c.Id
        INNER JOIN Jinmei j ON j.Id = cm.JinmeiId
        WHERE j.Meishou = ? OR j.MatchingKey = ?`,
      stripJinmei(meishou),
      stripJinmei(meishou),
      jinmeiMatchingKey(meishou),
    );
    // 名前が複数一致しても 1 人 1 行にする。表記が同じ名前で当たったかも持つ
    const byId = new Map<number, { row: Choukyoushi; exact: boolean }>();
    for (const { Exact, ...row } of rows) {
      const prev = byId.get(row.Id);
      byId.set(row.Id, { row, exact: !!Exact || !!prev?.exact });
    }
    const candidates = [...byId.values()].filter(
      ({ row }) =>
        !this.conflicts(row, toBe) &&
        (!toBe.Seinengappi || !row.Seinengappi || toBe.Seinengappi === row.Seinengappi),
    );
    // 表記が同じ人がいればその人たち、いなければ異体字・空白の違いを許した人たち
    const exact = candidates.filter((c) => c.exact);
    return (exact.length > 0 ? exact : candidates).map((c) => c.row);
  }

  /**
   * 既存の調教師を探します。コード(KOL・JRDB・JRA-VAN)のどれかが一致すればその調教師、
   * なければ姓名(と生年月日)が一致する調教師、姓名がなければ略称が一致する調教師が 1 人だけのときその調教師です。
   */
  protected async getChoukyoushi(choukyoushi: Choukyoushi, seimei?: string, tanshuku?: string) {
    return (await this.lookup(choukyoushi, seimei, tanshuku)).found;
  }

  /**
   * 名前が当たらないとき、生年月日が一致しコードが矛盾しない調教師が 1 人だけなら、
   * 姓が変わった同一人物とみなす。生年月日は同じ別人がありうるので、候補が 1 人のときに限る。
   */
  private async findBySeinengappi(toBe: Choukyoushi) {
    if (!toBe.Seinengappi) {
      return [];
    }
    return query<Choukyoushi>(
      "SELECT * FROM Choukyoushi WHERE Seinengappi = ?",
      toBe.Seinengappi,
    ).filter((c) => !this.conflicts(c, toBe));
  }

  /** その行に、この姓名(照合キーが同じもの)が登録済みか */
  private hasSeimei(row: Choukyoushi, seimei: string) {
    return (
      query<{ Id: number }>(
        `SELECT m.Id FROM ChoukyoushiMei m
          INNER JOIN Jinmei j ON j.Id = m.JinmeiId
          WHERE m.ChoukyoushiId = ? AND m.Kubun = ? AND (j.Meishou = ? OR j.MatchingKey = ?) LIMIT 1`,
        row.Id,
        MeishouKubun.Meishou,
        stripJinmei(seimei),
        jinmeiMatchingKey(seimei),
      ).length > 0
    );
  }

  private async lookup(choukyoushi: Choukyoushi, seimei?: string, tanshuku?: string) {
    for (const key of ChoukyoushiDao.codeKeys) {
      if (choukyoushi[key]) {
        const found = await findOneBy(Choukyoushi, { [key]: choukyoushi[key] });
        if (found) {
          return { found, renamed: false };
        }
      }
    }
    if (seimei) {
      const candidates = await this.findByMeishou(choukyoushi, seimei);
      if (candidates.length === 1 || (candidates.length > 1 && choukyoushi.Seinengappi)) {
        return { found: candidates[0], renamed: false };
      }
      if (candidates.length === 0) {
        const bySeinengappi = await this.findBySeinengappi(choukyoushi);
        if (bySeinengappi.length === 1) {
          return { found: bySeinengappi[0], renamed: true };
        }
      }
    } else if (tanshuku) {
      const candidates = await this.findByMeishou(choukyoushi, tanshuku);
      if (candidates.length === 1) {
        return { found: candidates[0], renamed: false };
      }
    }
    return { found: null, renamed: false };
  }

  public async saveChoukyoushi(
    toBe: Choukyoushi,
    seimei?: string,
    tanshuku?: string,
    furigana?: string,
  ) {
    const { found: asIs, renamed: foundByBirthday } = await this.lookup(toBe, seimei, tanshuku);
    // コードで見つかっても姓名が未登録(姓が変わった)なら、新しい名前を登録する
    const renamed = foundByBirthday || (!!asIs && !!seimei && !this.hasSeimei(asIs, seimei));
    const newCode =
      !!asIs && ChoukyoushiDao.codeKeys.some((k) => toBe[k] != null && asIs[k] == null);
    if (!asIs || newCode || renamed || (seimei && tanshuku && furigana)) {
      toBe = await tool.saveOrUpdate(Choukyoushi, asIs, toBe);
    } else {
      return asIs;
    }
    if (seimei) {
      await this.saveChoukyoushiMei(toBe, MeishouKubun.Meishou, seimei);
    }
    if (tanshuku) {
      await this.saveChoukyoushiMei(toBe, MeishouKubun.Tanshuku, tanshuku);
      if (3 < tanshuku.length) {
        tanshuku = tanshuku.substring(0, 3);
        await this.saveChoukyoushiMei(toBe, MeishouKubun.Tanshuku, tanshuku);
      }
    }
    if (furigana) {
      await this.saveChoukyoushiMei(toBe, MeishouKubun.Furigana, furigana);
    }
    return toBe;
  }

  protected async saveChoukyoushiMei(
    choukyoushi: Choukyoushi,
    kubun: MeishouKubun,
    meishou: string,
  ) {
    const jinmei = await jinmeiDao.save(meishou);
    getOrCreate(
      ChoukyoushiMei,
      { ChoukyoushiId: choukyoushi.Id, JinmeiId: jinmei.Id, Kubun: kubun },
      ["ChoukyoushiId", "JinmeiId", "Kubun"],
    );
  }
}

export const choukyoushiDao = new ChoukyoushiDao();
