import { getOrCreate } from "../db/helpers";
import { Banushi } from "../entities/Banushi";
import { MeishouKubun } from "../entities/MeishouKubun";
import { meishouDao } from "./MeishouDao";

export class BanushiDao {
  public async save(
    shussoubaId: number,
    kubun: MeishouKubun,
    meishou: string,
    banushiKaiCode?: number,
  ) {
    const shoyuu = await meishouDao.save(kubun, meishou, banushiKaiCode);
    return getOrCreate(Banushi, { ShussoubaId: shussoubaId, ShoyuuId: shoyuu.Id, Kubun: kubun }, [
      "ShussoubaId",
      "ShoyuuId",
      "Kubun",
    ]);
  }
}

export const banushiDao = new BanushiDao();
