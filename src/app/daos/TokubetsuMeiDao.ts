import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { TokubetsuMei } from "../entities/TokubetsuMei";
import { OrmRepository } from "../OrmManager";

@Injectable()
export class TokubetsuMeiDao {
  @OrmRepository(TokubetsuMei)
  private repository: Repository<TokubetsuMei>;

  public async save(meishou: string) {
    let tokubetsuMei = await this.repository.findOneBy({ Meishou: meishou });
    if (!tokubetsuMei) {
      tokubetsuMei = new TokubetsuMei();
      tokubetsuMei.Meishou = meishou;
      tokubetsuMei = await this.repository.save(tokubetsuMei);
    }
    return tokubetsuMei;
  }
}
