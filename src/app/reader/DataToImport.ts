import * as fs from "node:fs";
import * as log4js from "log4js";
import { runInTransaction } from "../db/db";
import { getLogger } from "../LogUtil";

export abstract class DataToImport {
  protected logger: log4js.Logger;

  private buf: Buffer;

  private bufBegin: number;

  private bufEnd: number;

  constructor() {
    this.logger = getLogger(this);
  }

  protected abstract getBufferLength(): number;

  public abstract save(buffer: Buffer);

  /**
   * ファイル全体をひとつのトランザクションで取り込みます。
   * 途中で失敗したときは、そのファイルの取り込みをすべて取り消します。
   */
  public async readAll(fd: number) {
    await this.setup();
    // 1 行ずつ読むときの読み込み済みのバッファは、ファイルごとに作り直す
    this.buf = undefined;
    this.bufBegin = 0;
    this.bufEnd = 0;
    try {
      const length = this.getBufferLength();
      await runInTransaction(async () => {
        for (let buf = this.readLine(fd, length); buf !== null; buf = this.readLine(fd, length)) {
          await this.save(buf);
        }
      });
    } finally {
      await this.teardown();
    }
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
      for (let index = this.bufBegin; index < this.bufEnd; ) {
        const ch = this.buf.readUInt8(index);
        index++;
        if (ch === 0x0a) {
          const line = this.buf.slice(this.bufBegin, index);
          this.bufBegin = index;
          return line;
        }
        if (this.bufEnd <= index) {
          // 最後まできたら
          const temp = this.buf;
          const rest = this.bufEnd - this.bufBegin;
          // 1 行がバッファに収まらないときは、バッファを広げる
          this.buf = Buffer.alloc(rest < temp.length ? temp.length : temp.length * 2);
          const offset = temp.copy(this.buf, 0, this.bufBegin, this.bufEnd);
          const length = this.buf.length - offset;
          const size = fs.readSync(fd, this.buf, offset, length, null);
          this.bufEnd = size + offset;
          this.bufBegin = index = 0;
          if (size === 0) {
            // ファイルの最後で改行がなければ、残りを最後の行にする
            const last = this.buf.subarray(0, this.bufEnd);
            this.bufEnd = 0;
            return 0 < last.length ? last : null;
          }
        }
      }
      return null;
    }
  }

  protected async setup() {}

  protected async teardown() {}
}
