import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Seisansha } from "../entities/Seisansha";

@Service()
export class SeisanshaDao {

  @OrmRepository(Seisansha)
  private repository: Repository<Seisansha>;

  public async saveSeisansha(toBe: Seisansha) {
    const asIs = await this.repository.findOne({ SeisanshaMei: toBe.SeisanshaMei });
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.repository.save(toBe);
    }
    return toBe;
  }

}