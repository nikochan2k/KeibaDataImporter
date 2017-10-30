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
      let buf: Buffer;
      while ((buf = this.readLine(fd, length)) !== null) {
        await this.save(buf, bridge);
      }
    }));
    this.teardown(bridge);
  }

  protected readLine(fd: number, length: number): Buffer {
    if (0 < length) {
      const buf = new Buffer(length);
      const size = fs.readSync(fd, buf, 0, length, null);
      return size === 0 ? null : buf;
    } else {
      const buffer = new Buffer(65536);
      const buf = new Buffer(1);
      let offset;
      for (offset = 0; 0 < fs.readSync(fd, buf, 0, 1, null); offset++) {
        const ch = buf.readUInt8(0);
        buffer.writeUInt8(ch, offset);
        if (ch === 0x0a) {
          break;
        }
      }
      return buffer.slice(0, offset);
    }
  }

  protected setup(bridge: Bridge) {
  }

  protected teardown(bridge: Bridge) {
  }

}