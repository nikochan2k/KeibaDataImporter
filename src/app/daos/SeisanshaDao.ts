import { findOneBy, save } from "../db/helpers";
import { Seisansha } from "../entities/Seisansha";
import { MeishouKubun } from "../entities/Shoyuu";
import { meishouDao } from "./MeishouDao";

export class SeisanshaDao {
  public async save(umaId: number, kubun: MeishouKubun, meishou: string) {
    const shoyuu = await meishouDao.save(kubun, meishou);
    let seisansha = await findOneBy(Seisansha, { UmaId: umaId, ShoyuuId: shoyuu.Id });
    if (!seisansha) {
      seisansha = {} as Seisansha;
      seisansha.UmaId = umaId;
      seisansha.ShoyuuId = shoyuu.Id;
      seisansha = await save(Seisansha, seisansha);
    }
    return seisansha;
  }
}

export const seisanshaDao = new SeisanshaDao();
