import * as fs from "fs";
import * as log4js from "log4js";
import { getLogger } from "../LogUtil";

export abstract class DataToImport {

  protected logger: log4js.Logger;

  constructor() {
    this.logger = getLogger(this);
  }

  protected abstract getBufferLength();

  protected abstract save(buffer: Buffer);

  protected finishUp() {
  }

  public async readAll(fd: number) {
    let buffer: Buffer;
    const length = this.getBufferLength();
    while ((buffer = this.readLine(fd, length)) !== null) {
      await this.save(buffer);
    }
    await this.finishUp();
  }

  protected readLine(fd: number, length: number): Buffer {
    const buf = new Buffer(length);
    const size = fs.readSync(fd, buf, 0, length, null);
    return size === 0 ? null : buf;
  }

}