import { Kakutei } from "../../converters/Common";
import { DataToImport } from "../DataToImport";
import { kolOddsHaitouTool } from "./KolOddsHaitouTool";
import { kolRaceTool } from "./KolRaceTool";

export class KolOds extends DataToImport {
  protected getBufferLength() {
    return 1504;
  }

  public async save(buffer: Buffer) {
    const raceId = await kolRaceTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveTanshou(buffer, raceId);
    await this.saveWakuren(buffer, raceId);
    await this.saveUmaren(buffer, raceId);
  }

  protected async saveTanshou(buffer: Buffer, raceId: number) {
    await kolOddsHaitouTool.saveTanshouOdds(buffer, 161, raceId, Kakutei.Yosou);
  }

  protected async saveWakuren(buffer: Buffer, raceId: number) {
    await kolOddsHaitouTool.saveWakurenOdds(buffer, 251, raceId, Kakutei.Yosou);
  }

  protected async saveUmaren(buffer: Buffer, raceId: number) {
    await kolOddsHaitouTool.saveUmarenOdds(buffer, 431, raceId, Kakutei.Yosou);
  }
}
