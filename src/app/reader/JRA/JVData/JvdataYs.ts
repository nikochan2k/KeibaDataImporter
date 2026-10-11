import { Inject, Injectable } from "@nestjs/common";
import { JvdataRaceTool } from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";

/** 開催スケジュール (YS)。開催の日程だけを取り込み、重賞案内は取り込まない。 */
@Injectable()
export class JvdataYs extends JvdataRecord {
  public readonly id = "YS";
  public readonly length = 382;

  @Inject()
  private jvdataRaceTool: JvdataRaceTool;

  public async save(buffer: Buffer) {
    if (!this.isActive(buffer)) {
      return;
    }
    await this.jvdataRaceTool.saveKaisai(buffer, 25);
  }
}
