import { Inject, Injectable } from "@nestjs/common";
import { DataToImport } from "../../DataToImport";
import { KolKis } from "../KolKis";
import { copyFields, newRecord } from "./Kd1Convert";
import { kd1KisMap, kd1Length, kd2Length } from "./Kd1Layout";

/** KD1 騎手データ。KD2/KD3 の並びに組み替えて、KolKis に渡す */
@Injectable()
export class KolKisKd1 extends DataToImport {
  @Inject()
  private reader: KolKis;

  protected getBufferLength() {
    return kd1Length.kis;
  }

  public async save(buffer: Buffer) {
    await this.reader.save(copyFields(buffer, 0, newRecord(kd2Length.kis), 0, kd1KisMap));
  }
}
