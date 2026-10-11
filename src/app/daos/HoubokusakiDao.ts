import { findOneBy, save } from "../db/helpers";
import { Houbokusaki } from "../entities/Houbokusaki";

export class HoubokusakiDao {
  public async save(meishou: string) {
    let houbokusaki = await findOneBy(Houbokusaki, { Meishou: meishou });
    if (!houbokusaki) {
      houbokusaki = {} as Houbokusaki;
      houbokusaki.Meishou = meishou;
      houbokusaki = await save(Houbokusaki, houbokusaki);
    }
    return houbokusaki;
  }
}

export const houbokusakiDao = new HoubokusakiDao();
