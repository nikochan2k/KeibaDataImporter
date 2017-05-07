import { EntityManager } from "typeorm";
import { DataReader } from "./DataReader";
import { Race } from "../entities/Race";
import { Baken } from "../converters/RaceHaitou";

export abstract class RaceReader extends DataReader {

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
  }

  protected async getRace(id: number) {
    const race = await this.entityManager
      .getRepository(Race)
      .createQueryBuilder("r")
      .where("r.Id = :id")
      .setParameter("id", id)
      .getOne();
    return race;
  }
}

export interface HaitouInfo {
  baken: Baken;
  bangou1: number;
  bangou1Len: number;
  bangou2?: number;
  bangou2Len?: number;
  bangou3?: number;
  bangou3Len?: number;
  haitou: number;
  haitouLen: number;
  ninki?: number;
  ninkiLen?: number;
}

export interface ShoukinInfo {
  chakujun: number;
  offset: number;
  length: number;
  fukashou: number;
}