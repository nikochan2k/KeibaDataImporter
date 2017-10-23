import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Jinmei, JinmeiKubun } from "../entities/Jinmei";

@Service()
export class JinmeiDao {

  @OrmRepository(Jinmei)
  private repository: Repository<Jinmei>;

  public findOneById(id: number) {
    /* tslint:disable:triple-equals */
    if (id == null) {
      return null;
    }
    /* tslint:enable:triple-equals */
    return this.repository.findOneById(id);
  }

  public async save(kubun: JinmeiKubun, meishou: string) {
    let jinmei = await this.repository.findOne({ Meishou: meishou });
    if (!jinmei) {
      jinmei = new Jinmei();
      jinmei.Kubun = kubun;
      jinmei.Meishou = meishou;
      jinmei = await this.repository.save(jinmei);
    }
    return jinmei;
  }

}