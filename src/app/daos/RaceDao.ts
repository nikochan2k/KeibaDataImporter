import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Record } from "../entities/Record";

@Service()
export class RaceDao {

  @OrmRepository(Record)
  private recordRepository: Repository<Record>;

  public async saveRecord(toBe: Record) {
    const asIs = await this.recordRepository
      .createQueryBuilder("r")
      .where("r.Nengappi = :nengappi")
      .setParameter("nengappi", toBe.Nengappi)
      .andWhere("r.UmaId = :umaId")
      .setParameter("umaId", toBe.UmaId)
      .getOne();
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.recordRepository.save(toBe);
    }
    return toBe;
  }


}