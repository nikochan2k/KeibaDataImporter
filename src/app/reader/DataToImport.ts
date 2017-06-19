import * as fs from "fs";
import * as log4js from "log4js";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import { getLogger } from "../LogUtil";
import { DataCache } from "./DataCache";

export abstract class DataToImport {

  protected logger: log4js.Logger;

  constructor() {
    this.logger = getLogger(this);
  }

  @OrmEntityManager()
  protected entityManager: EntityManager;

  protected abstract getBufferLength();

  protected abstract save(buffer: Buffer, cache?: DataCache);

  public async readAll(fd: number, cache: DataCache) {
    let buffer: Buffer;
    const length = this.getBufferLength();
    while ((buffer = this.readLine(fd, length)) !== null) {
      const con = (<any>this.entityManager.connection.driver).databaseConnection;
      await new Promise((resolve) => {
        con.serialize(async () => {
          await this.entityManager.transaction(async () => {
            console.log("1:DataToImport");
            await this.save(buffer, cache);
          });
          resolve();
        });
      });
    }
  }

  protected readLine(fd: number, length: number): Buffer {
    const buf = new Buffer(length);
    const size = fs.readSync(fd, buf, 0, length, null);
    return size === 0 ? null : buf;
  }

}