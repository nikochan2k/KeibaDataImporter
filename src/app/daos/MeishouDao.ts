import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { MeishouKubun, Shoyuu } from "../entities/Shoyuu";
import { OrmRepository } from "../OrmManager";
import { Tool } from "../reader/Tool";

@Service()
export class MeishouDao {
  @OrmRepository(Shoyuu)
  private repository: Repository<Shoyuu>;

  @Inject()
  protected tool: Tool;

  public async save(kubun: MeishouKubun, namae: string, banushiKaiCode?: number) {
    const asIs = await this.repository.findOneBy({ Meishou: namae });
    const toBe = new Shoyuu();
    toBe.Kubun = kubun;
    toBe.Meishou = namae;
    toBe.BanushiKaiCode = banushiKaiCode;
    return this.tool.saveOrUpdate(Shoyuu, asIs, toBe);
  }
}
