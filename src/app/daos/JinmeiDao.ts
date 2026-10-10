import { Service } from "typedi";
import { Repository } from "typeorm";
import { Jinmei, JinmeiKubun } from "../entities/Jinmei";
import { OrmRepository } from "../OrmManager";

@Service()
export class JinmeiDao {
  @OrmRepository(Jinmei)
  private repository: Repository<Jinmei>;

  public findOne(id: number) {
    /* tslint:disable:triple-equals */
    if (id == null) {
      return null;
    }
    /* tslint:enable:triple-equals */
    return this.repository.findOneBy({ Id: id });
  }

  public async save(kubun: JinmeiKubun, meishou: string) {
    let jinmei = await this.repository.findOneBy({ Meishou: meishou });
    if (!jinmei) {
      jinmei = new Jinmei();
      jinmei.Kubun = kubun;
      jinmei.Meishou = meishou;
      jinmei = await this.repository.save(jinmei);
    }
    return jinmei;
  }
}
