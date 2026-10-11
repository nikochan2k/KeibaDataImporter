import { findOneBy, save } from "../db/helpers";
import { Banushi } from "../entities/Banushi";
import { MeishouKubun } from "../entities/Shoyuu";
import { meishouDao } from "./MeishouDao";

export class BanushiDao {
  public async save(
    shussoubaId: number,
    kubun: MeishouKubun,
    meishou: string,
    banushiKaiCode?: number,
  ) {
    const shoyuu = await meishouDao.save(kubun, meishou, banushiKaiCode);
    let banushi = await findOneBy(Banushi, {
      ShussoubaId: shussoubaId,
      ShoyuuId: shoyuu.Id,
    });
    if (!banushi) {
      banushi = {} as Banushi;
      banushi.ShussoubaId = shussoubaId;
      banushi.ShoyuuId = shoyuu.Id;
      banushi = await save(Banushi, banushi);
    }
    return banushi;
  }
}

export const banushiDao = new BanushiDao();
