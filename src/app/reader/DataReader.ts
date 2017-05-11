import * as fs from "fs";
import * as log4js from "log4js";
import { LOG_LEVEL } from "../Constant";
import { EntityManager } from "typeorm";

export abstract class DataReader {

  protected logger: log4js.Logger;
  protected entityManager: EntityManager;
  private fd: number;

  constructor(entityManager: EntityManager, fd: number) {
    this.logger = log4js.getLogger("reader");
    this.logger.setLevel(LOG_LEVEL);
    this.entityManager = entityManager;
    this.fd = fd;
  }

  protected abstract getBufferLength();

  protected abstract save(buffer: Buffer);

  public async readAll() {
    let buffer: Buffer;
    const length = this.getBufferLength();
    while ((buffer = this.readLine(length)) !== null) {
      this.save(buffer);
    }
  }

  protected readLine(length: number): Buffer {
    const buf = new Buffer(length);
    const size = fs.readSync(this.fd, buf, 0, length, null);
    return size === 0 ? null : buf;
  }

  protected async persist<Entity>(entity: Entity) {
    let error: Error;
    if (this.logger.isDebugEnabled) {
      error = new Error();
    }
    try {
      return await this.entityManager.persist(entity);
    } catch (e) {
      if (error) {
        error.message = e;
        throw error;
      }
      throw e;
    }
  }
}