import { EntityManager } from "typeorm";
import { DataReader } from "./DataReader";

export abstract class RaceReader extends DataReader {

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
  }

}
