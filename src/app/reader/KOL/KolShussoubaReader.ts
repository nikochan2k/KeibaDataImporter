import { EntityManager } from "typeorm";
import { ShussoubaReader } from "../ShussoubaReader";
import { Kyuusha } from "../../entities/Kyuusha";

export abstract class KolShussoubaReader extends ShussoubaReader {

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
  }

  protected async getKyuushaByCode(kolKyuushaCode: number) {
    const kyuusha = await this.entityManager
      .getRepository(Kyuusha)
      .createQueryBuilder("k")
      .where("k.KolKyuushaCode = :kolKyuushaCode")
      .setParameter("kolKyuushaCode", kolKyuushaCode)
      .getOne();
    return kyuusha;
  }
}
