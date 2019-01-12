import * as fs from "fs";
import * as log4js from "log4js";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { getLogger } from "../LogUtil";
import { Bridge } from "./Bridge";

export abstract class DataToImport {

  protected logger: log4js.Logger;

  private buf: Buffer;

  private bufBegin: number;

  private bufEnd: number;

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
      const buf = Buffer.alloc(length);
      const size = fs.readSync(fd, buf, 0, length, null);
      return size === 0 ? null : buf;
    } else {
      if (!this.buf) {
        this.buf = Buffer.alloc(65536);
        this.bufBegin = 0;
        this.bufEnd = fs.readSync(fd, this.buf, 0, this.buf.length, null);
      }
      for (let index = this.bufBegin; index < this.bufEnd;) {
        const ch = this.buf.readUInt8(index);
        index++;
        if (ch === 0x0a) {
          const line = this.buf.slice(this.bufBegin, index);
          this.bufBegin = index;
          return line;
        }
        if (this.bufEnd <= index) { // 最後まできたら
          const temp = this.buf;
          this.buf = Buffer.alloc(this.buf.length);
          const offset = temp.copy(this.buf, 0, this.bufBegin, this.bufEnd);
          const length = this.buf.length - offset;
          this.bufEnd = fs.readSync(fd, this.buf, offset, length, null) + offset;
          this.bufBegin = index = 0;
        }
      }
      return null;
    }
  }

  protected setup(bridge: Bridge) {
  }

  protected teardown(bridge: Bridge) {
  }

}