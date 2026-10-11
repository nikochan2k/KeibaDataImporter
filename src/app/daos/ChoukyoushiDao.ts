import { findOneBy, query, save } from "../db/helpers";
import { Choukyoushi } from "../entities/Choukyoushi";
import { ChoukyoushiMei } from "../entities/ChoukyoushiMei";
import { JinmeiKubun } from "../entities/Jinmei";
import { tool } from "../reader/Tool";
import { jinmeiDao, jinmeiMatchingKey } from "./JinmeiDao";

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
    const rows = query<Choukyoushi>(
      `SELECT c.* FROM Choukyoushi c
        INNER JOIN ChoukyoushiMei cm ON cm.ChoukyoushiId = c.Id
        INNER JOIN Jinmei j ON j.Id = cm.JinmeiId
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
   * 既存の調教師を探します。コード(KOL・JRDB・JRA-VAN)のどれかが一致すればその調教師、
   * なければ姓名(と生年月日)が一致する調教師、姓名がなければ略称が一致する調教師が 1 人だけのときその調教師です。
   */
  protected async getChoukyoushi(choukyoushi: Choukyoushi, seimei?: string, tanshuku?: string) {
    for (const key of ChoukyoushiDao.codeKeys) {
      if (choukyoushi[key]) {
        const found = await findOneBy(Choukyoushi, { [key]: choukyoushi[key] });
        if (found) {
          return found;
        }
      }
    }
    if (seimei) {
      const candidates = await this.findByMeishou(choukyoushi, seimei);
      if (candidates.length === 1 || (candidates.length > 1 && choukyoushi.Seinengappi)) {
        return candidates[0];
      }
    } else if (tanshuku) {
      const candidates = await this.findByMeishou(choukyoushi, tanshuku);
      if (candidates.length === 1) {
        return candidates[0];
      }
    }
    return null;
  }

  public async saveChoukyoushi(
    toBe: Choukyoushi,
    seimei?: string,
    tanshuku?: string,
    furigana?: string,
  ) {
    const asIs = await this.getChoukyoushi(toBe, seimei, tanshuku);
    const newCode =
      !!asIs && ChoukyoushiDao.codeKeys.some((k) => toBe[k] != null && asIs[k] == null);
    if (!asIs || newCode || (seimei && tanshuku && furigana)) {
      toBe = await tool.saveOrUpdate(Choukyoushi, asIs, toBe);
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

  protected async saveChoukyoushiMei(
    choukyoushi: Choukyoushi,
    kubun: JinmeiKubun,
    meishou: string,
  ) {
    const jinmei = await jinmeiDao.save(meishou);
    let choukyoushiMei = await findOneBy(ChoukyoushiMei, {
      ChoukyoushiId: choukyoushi.Id,
      JinmeiId: jinmei.Id,
      Kubun: kubun,
    });
    if (!choukyoushiMei) {
      choukyoushiMei = {} as ChoukyoushiMei;
      choukyoushiMei.ChoukyoushiId = choukyoushi.Id;
      choukyoushiMei.JinmeiId = jinmei.Id;
      choukyoushiMei.Kubun = kubun;
      await save(ChoukyoushiMei, choukyoushiMei);
    }
  }
}

export const choukyoushiDao = new ChoukyoushiDao();
