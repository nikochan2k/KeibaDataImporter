import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { MeishouDao } from "../daos/MeishouDao";
import { Kubun } from "../entities/Meishou";
import { Seisansha } from "../entities/Seisansha";

@Service()
export class SeisanshaDao {

  @OrmRepository(Seisansha)
  private repository: Repository<Seisansha>;

  @Inject()
  private banushiSeisanshaDao: MeishouDao;

  public async save(umaId: number, kubun: Kubun, name: string) {
    const meishou = await this.banushiSeisanshaDao.save(kubun, name);
    let seisansha = await this.repository.findOne({ UmaId: umaId, MeishouId: meishou.Id });
    if (!seisansha) {
      seisansha = new Seisansha();
      seisansha.UmaId = umaId;
      seisansha.MeishouId = meishou.Id;
      seisansha = await this.repository.save(seisansha);
    }
    return seisansha;
  }

}