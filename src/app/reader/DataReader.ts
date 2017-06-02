import * as fs from "fs";
import * as log4js from "log4js";
import { getLogger } from "../Constant";
import { EntityManager } from "typeorm";
import { DataSupport } from "./DataSupport";

export abstract class DataReader {

  protected logger: log4js.Logger;

  protected tool: DataSupport;

  constructor(protected entityManager: EntityManager, protected fd: number) {
    this.logger = getLogger(this);
    this.tool = new DataSupport(entityManager);
  }

  protected abstract getBufferLength();

  protected abstract save(buffer: Buffer);

  protected finishUp() {
  }

  public async readAll() {
    let buffer: Buffer;
    const length = this.getBufferLength();
    while ((buffer = this.readLine(length)) !== null) {
      await this.save(buffer);
    }
    await this.finishUp();
  }

  protected readLine(length: number): Buffer {
    const buf = new Buffer(length);
    const size = fs.readSync(this.fd, buf, 0, length, null);
    return size === 0 ? null : buf;
  }

}