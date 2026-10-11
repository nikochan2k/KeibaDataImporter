import { Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { kolOddsHaitouTool } from "../KolOddsHaitouTool";
import { kolRaceTool } from "../KolRaceTool";

export class KolKod2Kd3 extends DataToImport {
  protected getBufferLength() {
    return 9043;
  }

  public async save(buffer: Buffer) {
    const raceId = await kolRaceTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveFukushou(buffer, raceId);
    await this.saveWide(buffer, raceId);
    await this.saveUmatan(buffer, raceId);
    await this.saveSanrenpuku(buffer, raceId);
  }

  protected async saveFukushou(buffer: Buffer, raceId: number) {
    await kolOddsHaitouTool.saveFukushouOdds(buffer, 161, raceId, Kakutei.Kakutei);
  }

  protected async saveWide(buffer: Buffer, raceId: number) {
    await kolOddsHaitouTool.saveWideOdds(buffer, 269, raceId, Kakutei.Kakutei);
  }

  protected async saveUmatan(buffer: Buffer, raceId: number) {
    await kolOddsHaitouTool.saveUmatanOdds(buffer, 1799, raceId, Kakutei.Kakutei);
  }

  protected async saveSanrenpuku(buffer: Buffer, raceId: number) {
    await kolOddsHaitouTool.saveSanrenpukuOdds(buffer, 3329, raceId, Kakutei.Kakutei);
  }
}
