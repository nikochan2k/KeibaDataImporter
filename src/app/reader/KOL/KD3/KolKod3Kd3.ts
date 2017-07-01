import { Inject, Service } from "typedi";
import { Baken, YosouKakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { DataTool } from "../../DataTool";
import { KolRaceTool } from "../KolRaceTool";
import { KolTool } from "../KolTool";

@Service()
export class KolKod3Kd3 extends DataToImport {

  @Inject()
  private tool: DataTool;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 9043;
  }

  protected async save(buffer: Buffer) {
    const raceId = await this.kolRaceTool.getRaceId(buffer);

    await this.saveSanrentan(buffer, raceId);
  }

  protected async saveSanrentan(buffer: Buffer, raceId: number) {
    const oddsKubun = await this.tool.saveOddsKubun(raceId, Baken.Sanrentan, YosouKakutei.Kakutei);
    await this.kolTool.saveSanrentanOdds(buffer, 161, oddsKubun.Id);
  }
}