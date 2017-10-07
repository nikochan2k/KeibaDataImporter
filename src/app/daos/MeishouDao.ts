import { Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmManager, OrmRepository } from "typeorm-typedi-extensions";
import { Kubun, Meishou } from "../entities/Meishou";

@Service()
export class MeishouDao {

  @OrmManager()
  protected entityManager: EntityManager;

  @OrmRepository(Meishou)
  private repository: Repository<Meishou>;

  public findOneById(id: number) {
    /* tslint:disable:triple-equals */
    if (id == null) {
      return null;
    }
    /* tslint:enable:triple-equals */
    return this.repository.findOneById(id);
  }

  public async save(kubun: Kubun, name: string) {
    let meishou = await this.repository.findOne({ Name: name });
    if (!meishou) {
      meishou = new Meishou();
      meishou.Kubun = kubun;
      meishou.Name = name;
      await this.repository.save(meishou);
    }
    return meishou;
  }

}