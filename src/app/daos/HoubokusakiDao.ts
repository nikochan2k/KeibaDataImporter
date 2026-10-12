import { getOrCreate } from "../db/helpers";
import { Houbokusaki } from "../entities/Houbokusaki";

export class HoubokusakiDao {
  public async save(meishou: string) {
    return getOrCreate(Houbokusaki, { Meishou: meishou }, ["Meishou"]);
  }
}

export const houbokusakiDao = new HoubokusakiDao();
