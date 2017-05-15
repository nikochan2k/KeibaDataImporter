import { EntityManager } from "typeorm";
import { ShussoubaReader } from "../ShussoubaReader";
import { Kyuusha } from "../../entities/Kyuusha";

export abstract class KolShussoubaReader extends ShussoubaReader {

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
  }

  protected async getKyuushaWith(kolKyuushaCode?: number, kyuushaMei?: string) {
    let kyuusha: Kyuusha;
    if (kolKyuushaCode) {
      kyuusha = await this.entityManager
        .getRepository(Kyuusha)
        .createQueryBuilder("k")
        .where("k.KolKyuushaCode = :kolKyuushaCode")
        .setParameter("kolKyuushaCode", kolKyuushaCode)
        .getOne();
    }
    if (!kyuusha && kyuushaMei) {
      kyuusha = await this.getKyuusha(kyuushaMei);
    }
    if (!kyuusha) {
      kyuusha = new Kyuusha();
      kyuusha.KolKyuushaCode = kolKyuushaCode;
      kyuusha.KyuushaMei = kyuushaMei;
    }
    return kyuusha;
  }

}
