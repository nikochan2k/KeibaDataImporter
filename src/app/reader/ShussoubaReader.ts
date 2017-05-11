import { EntityManager } from "typeorm";
import { DataReader } from "./DataReader";
import { Uma } from "../entities/Uma";

export abstract class ShussoubaReader extends DataReader {

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
  }

  protected abstract saveKyousouba(buffer: Buffer, kyousouba: Uma);

}
