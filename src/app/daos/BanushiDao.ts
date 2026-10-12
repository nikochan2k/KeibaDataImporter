import { getOrCreate } from "../db/helpers";
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
    return getOrCreate(Banushi, { ShussoubaId: shussoubaId, ShoyuuId: shoyuu.Id }, [
      "ShussoubaId",
      "ShoyuuId",
    ]);
  }
}

export const banushiDao = new BanushiDao();
