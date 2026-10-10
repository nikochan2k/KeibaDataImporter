import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { MeishouDao } from "../daos/MeishouDao";
import { Seisansha } from "../entities/Seisansha";
import { MeishouKubun } from "../entities/Shoyuu";
import { OrmRepository } from "../OrmManager";

@Service()
export class SeisanshaDao {
  @OrmRepository(Seisansha)
  private repository: Repository<Seisansha>;

  @Inject()
  private banushiSeisanshaDao: MeishouDao;

  public async save(umaId: number, kubun: MeishouKubun, meishou: string) {
    const shoyuu = await this.banushiSeisanshaDao.save(kubun, meishou);
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
