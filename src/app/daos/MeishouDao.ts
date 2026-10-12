import { findOneBy } from "../db/helpers";
import { MeishouKubun } from "../entities/MeishouKubun";
import { Shoyuu } from "../entities/Shoyuu";
import { tool } from "../reader/Tool";
import { jinmeiMatchingKey, stripJinmei } from "./JinmeiDao";

/**
 * 保存する表記。空白だけが違う名前は同じ行にまとめるため、空白を除く。
 * 欧字の名前は単語の区切りなので、空白を 1 つにそろえて残す。
 */
export function normalizeMeishou(kubun: MeishouKubun, namae: string) {
  return kubun === MeishouKubun.Eigo ? namae.replace(/\s+/g, " ").trim() : stripJinmei(namae);
}

export class MeishouDao {
  /** 同じ表記があればそれを、なければ新しく作って返します。異体字が違えば別の行 */
  public async save(kubun: MeishouKubun, namae: string) {
    namae = normalizeMeishou(kubun, namae);
    const asIs = await findOneBy(Shoyuu, { Meishou: namae });
    const toBe = {} as Shoyuu;
    toBe.MatchingKey = jinmeiMatchingKey(namae);
    if (!asIs) {
      toBe.Meishou = namae;
    }
    return tool.saveOrUpdate(Shoyuu, asIs, toBe);
  }
}

export const meishouDao = new MeishouDao();
