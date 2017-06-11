import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { Seisansha } from "../entities/Seisansha";

@Service()
export class SeisanshaDao {

  @OrmEntityManager()
  private entityManager: EntityManager;

  protected async getSeisansha(seisansha: Seisansha) {
    return await this.entityManager
      .getRepository(Seisansha)
      .createQueryBuilder("s")
      .where("s.SeisanshaMei = :seisanshaMei")
      .setParameter("seisanshaMei", seisansha.SeisanshaMei)
      .getOne();
  }

  public async saveSeisansha(toBe: Seisansha) {
    const asIs = await this.getSeisansha(toBe);
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.entityManager.persist(toBe);
    }
    return toBe;
  }

}