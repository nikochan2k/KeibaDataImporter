import { Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { kolOddsHaitouTool } from "../KolOddsHaitouTool";
import { kolRaceTool } from "../KolRaceTool";

export class KolKod3Kd3 extends DataToImport {
  protected getBufferLength() {
    return 49123;
  }

  public async save(buffer: Buffer) {
    const raceId = await kolRaceTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveSanrentan(buffer, raceId);
  }

  protected async saveSanrentan(buffer: Buffer, raceId: number) {
    await kolOddsHaitouTool.saveSanrentanOdds(buffer, 161, raceId, Kakutei.Kakutei);
  }
}
