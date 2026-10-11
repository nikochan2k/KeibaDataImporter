import { findOneBy } from "../db/helpers";
import { MeishouKubun, Shoyuu } from "../entities/Shoyuu";
import { tool } from "../reader/Tool";
import { jinmeiMatchingKey } from "./JinmeiDao";

export class MeishouDao {
  public async save(kubun: MeishouKubun, namae: string, banushiKaiCode?: number) {
    // 表記が違っても(空白、異体字)同じ名前なら、同じ行にまとめる
    const matchingKey = jinmeiMatchingKey(namae);
    const asIs =
      (await findOneBy(Shoyuu, { Meishou: namae })) ??
      (await findOneBy(Shoyuu, { Kubun: kubun, MatchingKey: matchingKey }));
    const toBe = {} as Shoyuu;
    toBe.MatchingKey = matchingKey;
    toBe.Kubun = kubun;
    if (!asIs) {
      toBe.Meishou = namae;
    }
    toBe.BanushiKaiCode = banushiKaiCode;
    return tool.saveOrUpdate(Shoyuu, asIs, toBe);
  }
}

export const meishouDao = new MeishouDao();
