import * as fs from "fs";
import * as iconv from "iconv-lite";
import * as log4js from "log4js";
import { LOG_LEVEL } from "../Constant";
import { EntityManager } from "typeorm";
import { normalize } from "./Normalizer";

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

  public abstract async readAll();

  protected format00(value: number): string {
    if (value < 10) return "0" + value;
    return "" + value;
  }

  protected toDateString(value: Date): string {
    return value.getFullYear() + "-"
      + this.format00(value.getMonth() + 1) + "-"
      + this.format00(value.getDate());
  }

  protected readLine(length: number): Buffer {
    const buf = new Buffer(length);
    const size = fs.readSync(this.fd, buf, 0, length, null);
    return size === 0 ? null : buf;
  }

  protected readRaw(buffer: Buffer, offset: number, length: number) {
    const chunk = new Buffer(length);
    buffer.copy(chunk, 0, offset, offset + length);
    const raw = iconv.decode(chunk, "Windows932");
    return raw;
  }

  protected readStr(buffer: Buffer, offset: number, length: number) {
    const raw = this.readRaw(buffer, offset, length);
    const normalized = normalize(raw);
    return normalized;
  }

  protected readStrWithNoSpace(buf: Buffer, offset: number, length: number) {
    const str = this.readStr(buf, offset, length);
    const converted = str.replace(/[\s]+/g, "");
    return converted;
  }

  protected readDouble(buf: Buffer, offset: number, length: number, mul?: number) {
    mul = (mul ? mul : 1.0);
    const str = this.readStr(buf, offset, length);
    const d = parseFloat(str);
    return isNaN(d) ? null : d * mul;
  }

  protected readInt(buf: Buffer, offset: number, length: number, mul?: number) {
    mul = mul ? mul : 1;
    const str = this.readStr(buf, offset, length);
    const i = parseInt(str);
    return isNaN(i) ? null : i * mul;
  }

  protected readTime(buf: Buffer, offset: number, length: number) {
    const i = this.readInt(buf, offset, length);
    if (i === null) return i;
    const m = (i / 1000) | 0;
    const ssf = (i % 1000) / 100;
    const time = m * 60 + ssf;
    return time;
  }

  protected readPositiveInt(buf: Buffer, offset: number, length: number, mul?: number) {
    const i = this.readInt(buf, offset, length, mul);
    return i <= 0 ? null : i;
  }

  protected readDate(buf: Buffer, offset: number, length: number) {
    const i = this.readInt(buf, offset, length);
    if (i === null) return null;
    const year = (i / 10000) | 0;
    const month = ((i % 10000) / 100) | 0;
    const day = i % 100;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
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