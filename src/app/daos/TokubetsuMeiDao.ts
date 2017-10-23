import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { TokubetsuMei } from "../entities/TokubetsuMei";

@Service()
export class TokubetsuMeiDao {

  @OrmRepository(TokubetsuMei)
  private repository: Repository<TokubetsuMei>;

  public async save(meishou: string) {
    let tokubetsuMei = await this.repository.findOne({ Meishou: meishou });
    if (!tokubetsuMei) {
      tokubetsuMei = new TokubetsuMei();
      tokubetsuMei.Meishou = meishou;
      tokubetsuMei = await this.repository.save(tokubetsuMei);
    }
    return tokubetsuMei;
  }

}