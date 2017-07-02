import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { RaceClass } from "../entities/RaceClass";
import { Record } from "../entities/Record";

@Service()
export class RaceDao {

  @OrmRepository(RaceClass)
  private repository: Repository<RaceClass>;

  @OrmRepository(Record)
  private recordRepository: Repository<Record>;

  public async saveRaceClass(rc: RaceClass) {
    const qb = this.repository
      .createQueryBuilder("rc")
      .where("rc.ChuuouChihouGaikoku = :chuuouChihouGaikoku")
      .setParameter("chuuouChihouGaikoku", rc.ChuuouChihouGaikoku)
      .andWhere("rc.IppanTokubetsu = :ippanTokubetsu")
      .setParameter("ippanTokubetsu", rc.IppanTokubetsu)
      .andWhere("rc.HeichiShougai = :heichiShougai")
      .setParameter("heichiShougai", rc.HeichiShougai);
    /* tslint:disable:triple-equals */
    if (rc.JoukenKei != null) {
      qb.andWhere("rc.JoukenKei = :joukenKei")
        .setParameter("joukenKei", rc.JoukenKei);
    } else {
      qb.andWhere("rc.JoukenKei IS NULL");
    }
    if (rc.TokubetsuMei != null) {
      qb.andWhere("rc.TokubetsuMei = :tokubetsuMei")
        .setParameter("tokubetsuMei", rc.TokubetsuMei);
    } else {
      qb.andWhere("rc.TokubetsuMei IS NULL");
    }
    if (rc.Grade != null) {
      qb.andWhere("rc.Grade = :grade")
        .setParameter("grade", rc.Grade);
    } else {
      qb.andWhere("rc.Grade IS NULL");
    }
    if (rc.Jouken1 != null) {
      qb.andWhere("rc.Jouken1 = :jouken1")
        .setParameter("jouken1", rc.Jouken1);
    } else {
      qb.andWhere("rc.Jouken1 IS NULL");
    }
    if (rc.Kumi1 != null) {
      qb.andWhere("rc.Kumi1 = :kumi1")
        .setParameter("kumi1", rc.Kumi1);
    } else {
      qb.andWhere("rc.Kumi1 IS NULL");
    }
    if (rc.IjouIkaMiman != null) {
      qb.andWhere("rc.IjouIkaMiman = :ijouIkaMiman")
        .setParameter("ijouIkaMiman", rc.IjouIkaMiman);
    } else {
      qb.andWhere("rc.IjouIkaMiman IS NULL");
    }
    if (rc.Jouken2 != null) {
      qb.andWhere("rc.Jouken2 = :jouken2")
        .setParameter("jouken2", rc.Jouken2);
    } else {
      qb.andWhere("rc.Jouken2 IS NULL");
    }
    if (rc.Kumi2 != null) {
      qb.andWhere("rc.Kumi2 = :kumi2")
        .setParameter("kumi2", rc.Kumi2);
    } else {
      qb.andWhere("rc.Kumi2 IS NULL");
    }
    /* tslint:enable:triple-equals */
    let raceClass = await qb.getOne();
    if (!raceClass) {
      raceClass = await this.repository.save(rc);
    }
    return raceClass;
  }

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