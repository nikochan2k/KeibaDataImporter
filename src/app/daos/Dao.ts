import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";

@Service()
export class Dao {

  @OrmEntityManager()
  private entityManager: EntityManager;

  public findOnById(entityClassOrName: string | Function, id: number) {
    return this.entityManager.getRepository(entityClassOrName).findOneById(id);
  }

}