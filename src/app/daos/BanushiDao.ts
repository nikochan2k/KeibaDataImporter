import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { MeishouDao } from "../daos/MeishouDao";
import { Banushi } from "../entities/Banushi";
import { MeishouKubun } from "../entities/Shoyuu";
import { OrmRepository } from "../OrmManager";

@Injectable()
export class BanushiDao {
  @OrmRepository(Banushi)
  private repository: Repository<Banushi>;

  @Inject()
  private meishouDao: MeishouDao;

  public async save(
    shussoubaId: number,
    kubun: MeishouKubun,
    meishou: string,
    banushiKaiCode?: number,
  ) {
    const shoyuu = await this.meishouDao.save(kubun, meishou, banushiKaiCode);
    let banushi = await this.repository.findOneBy({
      ShussoubaId: shussoubaId,
      ShoyuuId: shoyuu.Id,
    });
    if (!banushi) {
      banushi = new Banushi();
      banushi.ShussoubaId = shussoubaId;
      banushi.ShoyuuId = shoyuu.Id;
      banushi = await this.repository.save(banushi);
    }
    return banushi;
  }
}
