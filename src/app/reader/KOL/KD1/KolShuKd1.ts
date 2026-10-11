import { DataToImport } from "../../DataToImport";
import { KolShu } from "../KolShu";
import { copyFields, newRecord } from "./Kd1Convert";
import { kd1Length, kd1SyuMap, kd2Length } from "./Kd1Layout";

/** KD1 種牡馬データ。KD2/KD3 の並びに組み替えて、KolShu に渡す */
export class KolShuKd1 extends DataToImport {
  private reader = new KolShu();

  protected getBufferLength() {
    return kd1Length.syu;
  }

  public async save(buffer: Buffer) {
    await this.reader.save(copyFields(buffer, 0, newRecord(kd2Length.syu), 0, kd1SyuMap));
  }
}
