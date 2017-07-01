import { Inject, Service } from "typedi";
import { Baken, YosouKakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { DataTool } from "../../DataTool";
import { KolRaceTool } from "../KolRaceTool";
import { KolTool } from "../KolTool";

@Service()
export class KolKodKd3 extends DataToImport {

  @Inject()
  private tool: DataTool;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 1504;
  }

  protected async save(buffer: Buffer) {
    const raceId = await this.kolRaceTool.getRaceId(buffer);
    await this.saveTanshou(buffer, raceId);
    await this.saveWakuren(buffer, raceId);
    await this.saveUmaren(buffer, raceId);
  }

  protected async saveTanshou(buffer: Buffer, raceId: number) {
    const oddsKubun = await this.tool.saveOddsKubun(raceId, Baken.Tanshou, YosouKakutei.Kakutei);
    await this.kolTool.saveTanshouOdds(buffer, 161, oddsKubun.Id);
  }

  protected async saveWakuren(buffer: Buffer, raceId: number) {
    const oddsKubun = await this.tool.saveOddsKubun(raceId, Baken.Wakuren, YosouKakutei.Kakutei);
    await this.kolTool.saveTanshouOdds(buffer, 251, oddsKubun.Id);
  }

  protected async saveUmaren(buffer: Buffer, raceId: number) {
    const oddsKubun = await this.tool.saveOddsKubun(raceId, Baken.Umaren, YosouKakutei.Kakutei);
    await this.kolTool.saveUmarenOdds(buffer, 431, oddsKubun.Id);
  }
}