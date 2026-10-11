import { Inject, Service } from "typedi";
import { DataToImport } from "../../DataToImport";
import { KolUma } from "../KolUma";
import { copyFields, newRecord } from "./Kd1Convert";
import {
  kd1Length,
  kd1UmaMap,
  kd1UmaRunFrom,
  kd1UmaRunMap,
  kd1UmaRunStep,
  kd2Length,
  kd2UmaRunFrom,
  kd2UmaRunStep,
} from "./Kd1Layout";

/** KD1 競走馬データ。KD2/KD3 の並びに組み替えて、KolUma に渡す */
@Service()
export class KolUmaKd1 extends DataToImport {
  @Inject()
  private reader: KolUma;

  protected getBufferLength() {
    return kd1Length.uma;
  }

  public async save(buffer: Buffer) {
    const record = copyFields(buffer, 0, newRecord(kd2Length.uma), 0, kd1UmaMap);
    // 過去 5 走。KD1 は 235 バイト、KD2 は 590 バイトごと
    for (let i = 0; i < 5; i++) {
      copyFields(
        buffer,
        kd1UmaRunFrom + i * kd1UmaRunStep,
        record,
        kd2UmaRunFrom + i * kd2UmaRunStep,
        kd1UmaRunMap,
      );
    }
    await this.reader.save(record);
  }
}
