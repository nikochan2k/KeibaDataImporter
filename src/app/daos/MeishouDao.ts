import { findOneBy } from "../db/helpers";
import { MeishouKubun, Shoyuu } from "../entities/Shoyuu";
import { tool } from "../reader/Tool";
import { jinmeiMatchingKey, stripJinmei } from "./JinmeiDao";

export class MeishouDao {
  public async save(kubun: MeishouKubun, namae: string, banushiKaiCode?: number) {
    // 空白だけが違う名前は同じ行にまとめる。異体字が違えば別の行
    namae = stripJinmei(namae);
    const asIs = await findOneBy(Shoyuu, { Meishou: namae });
    const toBe = {} as Shoyuu;
    toBe.MatchingKey = jinmeiMatchingKey(namae);
    toBe.Kubun = kubun;
    if (!asIs) {
      toBe.Meishou = namae;
    }
    toBe.BanushiKaiCode = banushiKaiCode;
    return tool.saveOrUpdate(Shoyuu, asIs, toBe);
  }
}

export const meishouDao = new MeishouDao();
