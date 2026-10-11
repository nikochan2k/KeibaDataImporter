import { Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { kolOddsHaitouTool } from "../KolOddsHaitouTool";
import { kolRaceTool } from "../KolRaceTool";

export class KolOds2Kd3 extends DataToImport {
  protected getBufferLength() {
    return 9043;
  }

  public async save(buffer: Buffer) {
    const raceId = await kolRaceTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveUmatan(buffer, raceId);
    await this.saveSanrenpuku(buffer, raceId);
  }

  protected async saveUmatan(buffer: Buffer, raceId: number) {
    await kolOddsHaitouTool.saveUmatanOdds(buffer, 1799, raceId, Kakutei.Yosou);
  }

  protected async saveSanrenpuku(buffer: Buffer, raceId: number) {
    await kolOddsHaitouTool.saveSanrenpukuOdds(buffer, 3329, raceId, Kakutei.Yosou);
  }
}
