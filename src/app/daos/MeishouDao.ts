import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { MeishouKubun, Shoyuu } from "../entities/Shoyuu";
import { OrmRepository } from "../OrmManager";
import { Tool } from "../reader/Tool";
import { jinmeiMatchingKey } from "./JinmeiDao";

@Injectable()
export class MeishouDao {
  @OrmRepository(Shoyuu)
  private repository: Repository<Shoyuu>;

  @Inject()
  protected tool: Tool;

  public async save(kubun: MeishouKubun, namae: string, banushiKaiCode?: number) {
    // 表記が違っても(空白、異体字)同じ名前なら、同じ行にまとめる
    const matchingKey = jinmeiMatchingKey(namae);
    const asIs =
      (await this.repository.findOneBy({ Meishou: namae })) ??
      (await this.repository.findOneBy({ Kubun: kubun, MatchingKey: matchingKey }));
    const toBe = new Shoyuu();
    toBe.MatchingKey = matchingKey;
    toBe.Kubun = kubun;
    if (!asIs) {
      toBe.Meishou = namae;
    }
    toBe.BanushiKaiCode = banushiKaiCode;
    return this.tool.saveOrUpdate(Shoyuu, asIs, toBe);
  }
}
