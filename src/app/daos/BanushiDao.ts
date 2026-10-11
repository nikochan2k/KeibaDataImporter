import { Repository } from "typeorm";
import { Banushi } from "../entities/Banushi";
import { MeishouKubun } from "../entities/Shoyuu";
import { OrmRepository } from "../OrmManager";
import { meishouDao } from "./MeishouDao";

export class BanushiDao {
  @OrmRepository(Banushi)
  private repository: Repository<Banushi>;

  public async save(
    shussoubaId: number,
    kubun: MeishouKubun,
    meishou: string,
    banushiKaiCode?: number,
  ) {
    const shoyuu = await meishouDao.save(kubun, meishou, banushiKaiCode);
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

export const banushiDao = new BanushiDao();
