import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { MeishouDao } from "../daos/MeishouDao";
import { MeishouKubun } from "../entities/Shoyuu";
import { Banushi } from "../entities/Banushi";

@Service()
export class BanushiDao {

  @OrmRepository(Banushi)
  private repository: Repository<Banushi>;

  @Inject()
  private meishouDao: MeishouDao;

  public async save(shussoubaId: number, kubun: MeishouKubun, meishou: string, banushiKaiCode?: number) {
    const shoyuu = await this.meishouDao.save(kubun, meishou, banushiKaiCode);
    let banushi = await this.repository.findOne({ ShussoubaId: shussoubaId, MeishouId: shoyuu.Id });
    if (!banushi) {
      banushi = new Banushi();
      banushi.ShussoubaId = shussoubaId;
      banushi.MeishouId = shoyuu.Id;
      banushi = await this.repository.save(banushi);
    }
    return banushi;
  }

}