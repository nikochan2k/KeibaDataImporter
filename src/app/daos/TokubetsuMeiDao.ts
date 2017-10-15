import { Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import { TokubetsuMei } from "../entities/TokubetsuMei";

@Service()
export class TokubetsuMeiDao {

  @OrmManager()
  protected entityManager: EntityManager;

  @OrmRepository(TokubetsuMei)
  private repository: Repository<TokubetsuMei>;

  public findOneById(id: number) {
    /* tslint:disable:triple-equals */
    if (id == null) {
      return null;
    }
    /* tslint:enable:triple-equals */
    return this.repository.findOneById(id);
  }

  public async save(name: string) {
    let tokubetsuMei = await this.repository.findOne({ Name: name });
    if (!tokubetsuMei) {
      tokubetsuMei = new TokubetsuMei();
      tokubetsuMei.Name = name;
      await this.repository.save(tokubetsuMei);
    }
    return tokubetsuMei;
  }

}