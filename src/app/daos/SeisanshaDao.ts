import { Repository } from "typeorm";
import { Seisansha } from "../entities/Seisansha";
import { MeishouKubun } from "../entities/Shoyuu";
import { OrmRepository } from "../OrmManager";
import { meishouDao } from "./MeishouDao";

export class SeisanshaDao {
  @OrmRepository(Seisansha)
  private repository: Repository<Seisansha>;

  public async save(umaId: number, kubun: MeishouKubun, meishou: string) {
    const shoyuu = await meishouDao.save(kubun, meishou);
    let seisansha = await this.repository.findOneBy({ UmaId: umaId, ShoyuuId: shoyuu.Id });
    if (!seisansha) {
      seisansha = new Seisansha();
      seisansha.UmaId = umaId;
      seisansha.ShoyuuId = shoyuu.Id;
      seisansha = await this.repository.save(seisansha);
    }
    return seisansha;
  }
}

export const seisanshaDao = new SeisanshaDao();
