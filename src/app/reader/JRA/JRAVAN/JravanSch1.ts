import { DataToImport } from "../../DataToImport";
import { jravanRaceTool } from "./JravanRaceTool";

/** 年間スケジュール (JracSch1.dat): 開催日程。重賞案内は取り込まない。 */
export class JravanSch1 extends DataToImport {
  protected getBufferLength() {
    return 287;
  }

  public async save(buffer: Buffer) {
    await jravanRaceTool.saveKaisai(buffer, 14);
  }
}
