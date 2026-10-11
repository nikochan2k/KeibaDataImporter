import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { DataToImport } from "../../DataToImport";
import { readRaw } from "../../Reader";
import { JvdataCh } from "./JvdataCh";
import { JvdataHr } from "./JvdataHr";
import { JvdataKs } from "./JvdataKs";
import { JvdataO1, JvdataO2, JvdataO3, JvdataO4, JvdataO5, JvdataO6 } from "./JvdataOdds";
import { JvdataRa } from "./JvdataRa";
import { JvdataRecord } from "./JvdataRecord";
import { JvdataSe } from "./JvdataSe";
import { JvdataUm } from "./JvdataUm";
import { JvdataYs } from "./JvdataYs";

/**
 * JV-Data (JRA-VAN Data Lab.) のファイル。
 * JV-Link が返すレコードを 1 レコード 1 行(末尾は CR LF)で並べたもので、レコード種別が混ざっていてよい。
 * 先頭 2 バイトのレコード種別 ID で、取り込み処理を振り分ける。
 * 取り込み処理のないレコード種別(特別登録馬、票数、坂路調教、マイニング予想など)は読み飛ばす。
 */
@Injectable()
export class JvData extends DataToImport implements OnModuleInit {
  private records: Map<string, JvdataRecord>;

  constructor(@Inject(ModuleRef) private moduleRef: ModuleRef) {
    super();
  }

  public onModuleInit() {
    this.records = new Map();
    for (const type of [
      JvdataRa,
      JvdataSe,
      JvdataHr,
      JvdataO1,
      JvdataO2,
      JvdataO3,
      JvdataO4,
      JvdataO5,
      JvdataO6,
      JvdataUm,
      JvdataKs,
      JvdataCh,
      JvdataYs,
    ]) {
      const record = this.moduleRef.get<JvdataRecord>(type, { strict: false });
      this.records.set(record.id, record);
    }
  }

  /** 1 行ずつ読む(レコード長がレコード種別によって違うため) */
  protected getBufferLength() {
    return 0;
  }

  public async save(buffer: Buffer) {
    const id = readRaw(buffer, 0, 2);
    const record = this.records.get(id);
    if (!record) {
      this.logger.debug(`取り込まないレコード種別です: ${id}`);
      return;
    }
    // 末尾の CR LF (LF だけでもよい) を除いた長さが、レコード長 - 2 でなければ壊れている
    let length = buffer.length;
    if (0 < length && buffer[length - 1] === 0x0a) {
      length--;
    }
    if (0 < length && buffer[length - 1] === 0x0d) {
      length--;
    }
    if (length !== record.length - 2) {
      this.logger.warn(`${id} のレコード長が違います: ${length} (${record.length - 2} のはずです)`);
      return;
    }
    await record.save(buffer);
  }
}
