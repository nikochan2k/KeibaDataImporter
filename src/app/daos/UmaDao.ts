import * as $U from "../converters/Uma";
import { findBy, findOneBy, IS_NULL, save, type Where } from "../db/helpers";
import { Kyousouba } from "../entities/Kyousouba";
import { Uma } from "../entities/Uma";
import { tool } from "../reader/Tool";

export class UmaDao {
  private static readonly codeKeys = ["KolUmaCode", "KettouTourokuBangou"] as const;

  private static readonly nameKeys = ["KanaBamei", "EigoBamei"] as const;

  /** 両方が持っている項目(コード・生年・生年月日・性別)の値が違うなら別の馬 */
  private conflicts(a: Uma, b: Uma) {
    return [...UmaDao.codeKeys, "Seinen", "Seinengappi", "Seibetsu"].some(
      (k) => a[k] != null && b[k] != null && a[k] !== b[k],
    );
  }

  /**
   * 既存の馬を探します。コード(KOL・血統登録番号)のどれかが一致すればその馬、
   * なければ馬名(カナ、なければ英字)が一致する馬のうち別の馬でないものです。
   * 馬名は別の馬に使い回されるため、候補が複数あれば生年の新しい馬を選びます
   * (併せ馬のように馬名しか分からない馬は、いま走っている馬である見込みが高いため)。
   */
  protected async getUma(uma: Uma) {
    for (const key of UmaDao.codeKeys) {
      if (uma[key]) {
        const found = await findOneBy(Uma, { [key]: uma[key] });
        if (found) {
          return found;
        }
      }
    }
    for (const key of UmaDao.nameKeys) {
      if (uma[key]) {
        const candidates = (await findBy(Uma, { [key]: uma[key] })).filter(
          (c) => !this.conflicts(c, uma),
        );
        if (0 < candidates.length) {
          candidates.sort((a, b) => (b.Seinen ?? 0) - (a.Seinen ?? 0) || b.Id - a.Id);
          return candidates[0];
        }
      }
    }
    return null;
  }

  public getKyousouba(kyousouba: Kyousouba) {
    const where: Where<typeof Kyousouba> = {
      UmaId: kyousouba.UmaId,
      ChoukyoushiId: kyousouba.ChoukyoushiId || IS_NULL,
      KoueiGaikokuChoukyoushiMei: kyousouba.KoueiGaikokuChoukyoushiMei || IS_NULL,
    };
    if (kyousouba.Seibetsu) {
      where.Seibetsu = kyousouba.Seibetsu;
    }
    if (kyousouba.UmaKigou) {
      where.UmaKigou = kyousouba.UmaKigou;
    }
    return findOneBy(Kyousouba, where);
  }

  public async saveUma(toBe: Uma) {
    if (toBe.Seibetsu === $U.Seibetsu.Senba) {
      toBe.Seibetsu = $U.Seibetsu.Boba;
    }
    const asIs = await this.getUma(toBe);
    return await tool.saveOrUpdate(Uma, asIs, toBe);
  }

  public async saveKyousouba(toBe: Kyousouba) {
    const asIs = await this.getKyousouba(toBe);
    if (asIs) {
      return asIs;
    } else {
      return await save(Kyousouba, toBe);
    }
  }
}

export const umaDao = new UmaDao();
