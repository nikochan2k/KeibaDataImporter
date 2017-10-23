import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { TokubetsuMei } from "../entities/TokubetsuMei";

@Service()
export class TokubetsuMeiDao {

  @OrmRepository(TokubetsuMei)
  private repository: Repository<TokubetsuMei>;

  public async save(name: string) {
    let tokubetsuMei = await this.repository.findOne({ Name: name });
    if (!tokubetsuMei) {
      tokubetsuMei = new TokubetsuMei();
      tokubetsuMei.Name = name;
      tokubetsuMei = await this.repository.save(tokubetsuMei);
    }
    return tokubetsuMei;
  }

}