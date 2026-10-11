import { Repository } from "typeorm";
import { RaceMei } from "../entities/RaceMei";
import { Record } from "../entities/Record";
import { OrmRepository } from "../OrmManager";
import { tokubetsuMeiDao } from "./TokubetsuMeiDao";

export class RaceDao {
  @OrmRepository(Record)
  private recordRepository: Repository<Record>;

  @OrmRepository(RaceMei)
  private raceMeiRepository: Repository<RaceMei>;

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

  public async saveRaceMei(raceId: number, meishou: string) {
    const tokubetsuMei = await tokubetsuMeiDao.save(meishou);
    let raceMei = await this.raceMeiRepository.findOneBy({
      RaceId: raceId,
      TokubetsuMeiId: tokubetsuMei.Id,
    });
    if (!raceMei) {
      raceMei = new RaceMei();
      raceMei.RaceId = raceId;
      raceMei.TokubetsuMeiId = tokubetsuMei.Id;
      await this.raceMeiRepository.save(raceMei);
    }
  }
}

export const raceDao = new RaceDao();
