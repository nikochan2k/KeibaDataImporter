import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Houbokusaki } from "../entities/Houbokusaki";

@Service()
export class HoubokusakiDao {

  @OrmRepository(Houbokusaki)
  private repository: Repository<Houbokusaki>;

  public async save(meishou: string) {
    let houbokusaki = await this.repository.findOne({ Meishou: meishou });
    if (!houbokusaki) {
      houbokusaki = new Houbokusaki();
      houbokusaki.Meishou = meishou;
      houbokusaki = await this.repository.save(houbokusaki);
    }
    return houbokusaki;
  }

}