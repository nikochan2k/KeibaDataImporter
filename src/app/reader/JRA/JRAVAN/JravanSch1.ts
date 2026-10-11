import { Inject, Injectable } from "@nestjs/common";
import { DataToImport } from "../../DataToImport";
import { JravanRaceTool } from "./JravanRaceTool";

/** 年間スケジュール (JracSch1.dat): 開催日程。重賞案内は取り込まない。 */
@Injectable()
export class JravanSch1 extends DataToImport {
  @Inject()
  private jravanRaceTool: JravanRaceTool;

  protected getBufferLength() {
    return 287;
  }

  public async save(buffer: Buffer) {
    await this.jravanRaceTool.saveKaisai(buffer, 14);
  }
}
