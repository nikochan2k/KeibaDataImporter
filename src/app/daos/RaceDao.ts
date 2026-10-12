import { findOneBy, getOrCreate, save } from "../db/helpers";
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
    getOrCreate(RaceMei, { RaceId: raceId, TokubetsuMeiId: tokubetsuMei.Id }, [
      "RaceId",
      "TokubetsuMeiId",
    ]);
  }
}

export const raceDao = new RaceDao();
