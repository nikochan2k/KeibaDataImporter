import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Kubun, Meishou } from "../entities/Meishou";

@Service()
export class MeishouDao {

  @OrmRepository(Meishou)
  private repository: Repository<Meishou>;

  public async save(kubun: Kubun, name: string, banushiKaiCode?: number) {
    let meishou = await this.repository.findOne({ Name: name });
    if (!meishou || meishou && !meishou.BanushiKaiCode && banushiKaiCode) {
      meishou = new Meishou();
      meishou.Kubun = kubun;
      meishou.Name = name;
      meishou.BanushiKaiCode = banushiKaiCode;
      meishou = await this.repository.save(meishou);
    }
    return meishou;
  }

}