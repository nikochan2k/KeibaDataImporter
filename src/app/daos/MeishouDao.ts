import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { MeishouKubun, Shoyuu } from "../entities/Shoyuu";

@Service()
export class MeishouDao {

  @OrmRepository(Shoyuu)
  private repository: Repository<Shoyuu>;

  public async save(kubun: MeishouKubun, namae: string, banushiKaiCode?: number) {
    let shoyuu = await this.repository.findOne({ Meishou: namae });
    if (!shoyuu || shoyuu && !shoyuu.BanushiKaiCode && banushiKaiCode) {
      shoyuu = new Shoyuu();
      shoyuu.Kubun = kubun;
      shoyuu.Meishou = namae;
      shoyuu.BanushiKaiCode = banushiKaiCode;
      shoyuu = await this.repository.save(shoyuu);
    }
    return shoyuu;
  }

}