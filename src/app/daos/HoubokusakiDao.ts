import { getOrCreate } from "../db/helpers";
import { Houbokusaki } from "../entities/Houbokusaki";
import { jinmeiMatchingKey } from "./JinmeiDao";

export class HoubokusakiDao {
  public async save(meishou: string) {
    return getOrCreate(Houbokusaki, { Meishou: meishou, MatchingKey: jinmeiMatchingKey(meishou) }, [
      "Meishou",
    ]);
  }
}

export const houbokusakiDao = new HoubokusakiDao();
