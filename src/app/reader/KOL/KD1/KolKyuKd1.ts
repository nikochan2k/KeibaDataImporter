import { Inject, Service } from "typedi";
import { DataToImport } from "../../DataToImport";
import { KolKyu } from "../KolKyu";
import { copyFields, newRecord } from "./Kd1Convert";
import { kd1KyuMap, kd1Length, kd2Length } from "./Kd1Layout";

/** KD1 厩舎データ。KD2/KD3 の並びに組み替えて、KolKyu に渡す */
@Service()
export class KolKyuKd1 extends DataToImport {
  @Inject()
  private reader: KolKyu;

  protected getBufferLength() {
    return kd1Length.kyu;
  }

  public async save(buffer: Buffer) {
    await this.reader.save(copyFields(buffer, 0, newRecord(kd2Length.kyu), 0, kd1KyuMap));
  }
}
