import { getOrCreate } from "../db/helpers";
import { Seisansha } from "../entities/Seisansha";
import { MeishouKubun } from "../entities/Shoyuu";
import { meishouDao } from "./MeishouDao";

export class SeisanshaDao {
  public async save(umaId: number, kubun: MeishouKubun, meishou: string) {
    const shoyuu = await meishouDao.save(kubun, meishou);
    return getOrCreate(Seisansha, { UmaId: umaId, ShoyuuId: shoyuu.Id }, ["UmaId", "ShoyuuId"]);
  }
}

export const seisanshaDao = new SeisanshaDao();
