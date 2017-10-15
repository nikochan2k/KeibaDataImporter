import { Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import { Kubun, Jinmei } from "../entities/Jinmei";

@Service()
export class JinmeiDao {

  @OrmManager()
  protected entityManager: EntityManager;

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

  public async save(kubun: Kubun, name: string) {
    let jinmei = await this.repository.findOne({ Name: name });
    if (!jinmei) {
      jinmei = new Jinmei();
      jinmei.Kubun = kubun;
      jinmei.Name = name;
      await this.repository.save(jinmei);
    }
    return jinmei;
  }

}