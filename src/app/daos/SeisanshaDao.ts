import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { Seisansha } from "../entities/Seisansha";

@Service()
export class SeisanshaDao {

  @OrmEntityManager()
  private entityManager: EntityManager;

  private seisanshaMeiMap = new Map<string, Seisansha>();

  protected async getSeisansha(seisansha: Seisansha) {
    let result = this.seisanshaMeiMap.get(seisansha.SeisanshaMei);
    if (!result) {
      result = await this.getSeisanshaFromDB(seisansha);
      if (result) {
        this.seisanshaMeiMap.set(seisansha.SeisanshaMei, seisansha);
      }
    }
    return result;
  }

  protected async getSeisanshaFromDB(seisansha: Seisansha) {
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
      this.seisanshaMeiMap.set(toBe.SeisanshaMei, toBe);
    }
    return toBe;
  }

}