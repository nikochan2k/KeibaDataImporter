import { Inject, Service } from "typedi";
import { Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { KolOddsHaitouTool } from "../KolOddsHaitouTool";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolOds2Kd3 extends DataToImport {

  @Inject()
  private kolRaceTool: KolRaceTool;

  @Inject()
  private kolOddsHaitouTool: KolOddsHaitouTool;

  protected getBufferLength() {
    return 9043;
  }

  public async save(buffer: Buffer) {
    const raceId = await this.kolRaceTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveUmatan(buffer, raceId);
    await this.saveSanrenpuku(buffer, raceId);
  }

  protected async saveUmatan(buffer: Buffer, raceId: number) {
    await this.kolOddsHaitouTool.saveUmatanOdds(buffer, 1799, raceId, Kakutei.Yosou);
  }

  protected async saveSanrenpuku(buffer: Buffer, raceId: number) {
    await this.kolOddsHaitouTool.saveSanrenpukuOdds(buffer, 3329, raceId, Kakutei.Yosou);
  }
}