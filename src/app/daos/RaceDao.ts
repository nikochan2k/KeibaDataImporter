import { getOrCreate } from "../db/helpers";
import { RaceMei } from "../entities/RaceMei";
import { tokubetsuMeiDao } from "./TokubetsuMeiDao";

export class RaceDao {
  public async saveRaceMei(raceId: number, meishou: string) {
    const tokubetsuMei = await tokubetsuMeiDao.save(meishou);
    getOrCreate(RaceMei, { RaceId: raceId, TokubetsuMeiId: tokubetsuMei.Id }, [
      "RaceId",
      "TokubetsuMeiId",
    ]);
  }
}

export const raceDao = new RaceDao();
