import { Inject, Service } from "typedi";
import { Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { KolOddsHaitouTool } from "../KolOddsHaitouTool";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolKod3Kd3 extends DataToImport {

  @Inject()
  private kolRaceTool: KolRaceTool;

  @Inject()
  private kolOddsHaitouTool: KolOddsHaitouTool;

  protected getBufferLength() {
    return 49123;
  }

  public async save(buffer: Buffer) {
    const raceId = await this.kolRaceTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveSanrentan(buffer, raceId);
  }

  protected async saveSanrentan(buffer: Buffer, raceId: number) {
    await this.kolOddsHaitouTool.saveSanrentanOdds(buffer, 161, raceId, Kakutei.Kakutei);
  }
}