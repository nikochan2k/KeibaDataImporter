import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Banushi } from "../entities/Banushi";

@Service()
export class BanushiDao {

  @OrmRepository(Banushi)
  private repository: Repository<Banushi>;

  public async saveBanushi(toBe: Banushi) {
    const asIs = await this.repository.findOne({ BanushiMei: toBe.BanushiMei });
    if (asIs) {
      /* tslint:disable:triple-equals */
      if (asIs.BanushiKaiCode == null && toBe.BanushiKaiCode != null) {
        asIs.BanushiKaiCode = toBe.BanushiKaiCode;
        await this.repository.updateById(asIs.Id, asIs);
      }
      /* tslint:enable:triple-equals */
      toBe = asIs;
    } else {
      toBe = await this.repository.save(toBe);
    }
    return toBe;
  }

}