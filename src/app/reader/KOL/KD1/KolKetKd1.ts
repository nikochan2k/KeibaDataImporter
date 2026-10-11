import { Inject, Service } from "typedi";
import { DataToImport } from "../../DataToImport";
import { KolKet } from "../KolKet";
import { copyFields, newRecord } from "./Kd1Convert";
import { kd1KetMap, kd1Length, kd2Length } from "./Kd1Layout";

/** KD1 3代血統図。KD2/KD3 の並びに組み替えて、KolKet に渡す */
@Service()
export class KolKetKd1 extends DataToImport {
  @Inject()
  private reader: KolKet;

  protected getBufferLength() {
    return kd1Length.ket;
  }

  public async save(buffer: Buffer) {
    await this.reader.save(copyFields(buffer, 0, newRecord(kd2Length.ket), 0, kd1KetMap));
  }
}
