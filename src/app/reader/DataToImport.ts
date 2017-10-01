import * as fs from "fs";
import * as log4js from "log4js";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { getLogger } from "../LogUtil";
import { Bridge } from "./Bridge";

export abstract class DataToImport {

  protected logger: log4js.Logger;

  constructor() {
    this.logger = getLogger(this);
  }

  @OrmManager()
  protected entityManager: EntityManager;

  protected abstract getBufferLength(): number;

  public abstract async save(buffer: Buffer, bridge?: Bridge);

  public async readAll(fd: number, bridge: Bridge) {
    this.setup(bridge);
    const length = this.getBufferLength();
    await this.entityManager.transaction(await (async () => {
      let buffer: Buffer;
      while ((buffer = this.readLine(fd, length)) !== null) {
        await this.save(buffer, bridge);
      }
    }));
    this.teardown(bridge);
  }

  protected readLine(fd: number, length: number): Buffer {
    const buf = new Buffer(length);
    const size = fs.readSync(fd, buf, 0, length, null);
    return size === 0 ? null : buf;
  }

  protected setup(bridge: Bridge) {
  }

  protected teardown(bridge: Bridge) {
  }

}