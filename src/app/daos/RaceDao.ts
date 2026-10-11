import { findOneBy, save } from "../db/helpers";
import { RaceMei } from "../entities/RaceMei";
import { Record } from "../entities/Record";
import { tokubetsuMeiDao } from "./TokubetsuMeiDao";

export class RaceDao {
  public async saveRecord(toBe: Record) {
    const asIs =
      toBe.Nengappi == null || toBe.UmaId == null
        ? null
        : findOneBy(Record, { Nengappi: toBe.Nengappi, UmaId: toBe.UmaId });
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await save(Record, toBe);
    }
    return toBe;
  }

  public async saveRaceMei(raceId: number, meishou: string) {
    const tokubetsuMei = await tokubetsuMeiDao.save(meishou);
    let raceMei = await findOneBy(RaceMei, {
      RaceId: raceId,
      TokubetsuMeiId: tokubetsuMei.Id,
    });
    if (!raceMei) {
      raceMei = {} as RaceMei;
      raceMei.RaceId = raceId;
      raceMei.TokubetsuMeiId = tokubetsuMei.Id;
      await save(RaceMei, raceMei);
    }
  }
}

export const raceDao = new RaceDao();
