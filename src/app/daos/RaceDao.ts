import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { TokubetsuMeiDao } from "../daos/TokubetsuMeiDao";
import { Race } from "../entities/Race";
import { RaceMei } from "../entities/RaceMei";
import { Record } from "../entities/Record";

@Service()
export class RaceDao {

  @OrmRepository(Record)
  private recordRepository: Repository<Record>;

  @OrmRepository(RaceMei)
  private raceMeiRepository: Repository<RaceMei>;

  @Inject()
  private tokubetsuMeiDao: TokubetsuMeiDao;

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

  public async saveRaceMei(race: Race, name: string) {
    const tokubetsuMei = await this.tokubetsuMeiDao.save(name);
    let raceMei = await this.raceMeiRepository.findOne({ RaceId: race.Id, TokubetsuMeiId: tokubetsuMei.Id });
    if (!raceMei) {
      raceMei = new RaceMei();
      raceMei.RaceId = race.Id;
      raceMei.TokubetsuMeiId = tokubetsuMei.Id;
      await this.raceMeiRepository.save(raceMei);
    }
  }

}