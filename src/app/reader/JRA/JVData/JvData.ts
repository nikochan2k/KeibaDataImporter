import { Container, Service } from "typedi";
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
@Service()
export class JvData extends DataToImport {
  private records: Map<string, JvdataRecord>;

  constructor() {
    super();
    this.records = new Map();
    for (const record of [
      Container.get(JvdataRa),
      Container.get(JvdataSe),
      Container.get(JvdataHr),
      Container.get(JvdataO1),
      Container.get(JvdataO2),
      Container.get(JvdataO3),
      Container.get(JvdataO4),
      Container.get(JvdataO5),
      Container.get(JvdataO6),
      Container.get(JvdataUm),
      Container.get(JvdataKs),
      Container.get(JvdataCh),
      Container.get(JvdataYs),
    ]) {
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
