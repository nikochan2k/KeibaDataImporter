import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { MeishouDao } from "../daos/MeishouDao";
import { Kubun } from "../entities/Meishou";
import { Banushi } from "../entities/Banushi";

@Service()
export class BanushiDao {

  @OrmRepository(Banushi)
  private repository: Repository<Banushi>;

  @Inject()
  private meishouDao: MeishouDao;

  public async save(shussoubaId: number, kubun: Kubun, name: string, banushiKaiCode?: number) {
    const meishou = await this.meishouDao.save(kubun, name, banushiKaiCode);
    let banushi = await this.repository.findOne({ ShussoubaId: shussoubaId, MeishouId: meishou.Id });
    if (!banushi) {
      banushi = new Banushi();
      banushi.ShussoubaId = shussoubaId;
      banushi.MeishouId = meishou.Id;
      banushi = await this.repository.save(banushi);
    }
    return banushi;
  }

}