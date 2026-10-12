import { getOrCreate } from "../db/helpers";
import { TokubetsuMei } from "../entities/TokubetsuMei";

export class TokubetsuMeiDao {
  public async save(meishou: string) {
    return getOrCreate(TokubetsuMei, { Meishou: meishou }, ["Meishou"]);
  }
}

export const tokubetsuMeiDao = new TokubetsuMeiDao();
