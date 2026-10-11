import { findOneBy, save } from "../db/helpers";
import { TokubetsuMei } from "../entities/TokubetsuMei";

export class TokubetsuMeiDao {
  public async save(meishou: string) {
    let tokubetsuMei = await findOneBy(TokubetsuMei, { Meishou: meishou });
    if (!tokubetsuMei) {
      tokubetsuMei = {} as TokubetsuMei;
      tokubetsuMei.Meishou = meishou;
      tokubetsuMei = await save(TokubetsuMei, tokubetsuMei);
    }
    return tokubetsuMei;
  }
}

export const tokubetsuMeiDao = new TokubetsuMeiDao();
