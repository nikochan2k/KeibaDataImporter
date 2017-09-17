import { Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmEntityManager, OrmRepository } from "typeorm-typedi-extensions";
import { Meishou } from "../entities/Meishou";

@Service()
export class MeishouDao {

  @OrmEntityManager()
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

  public async save(namae: string) {
    let meishou = await this.repository.findOne({ Namae: namae });
    if (!meishou) {
      meishou = new Meishou();
      meishou.Namae = namae;
      await this.repository.save(meishou);
    }
    return meishou;
  }

}