import { Inject, Service } from "typedi";
import { Baken, YosouKakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { DataTool } from "../../DataTool";
import { KolRaceTool } from "../KolRaceTool";
import { KolTool } from "../KolTool";

@Service()
export class KolKod2Kd3 extends DataToImport {

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

    await this.saveFukushou(buffer, raceId);
    await this.saveWide(buffer, raceId);
    await this.saveUmatan(buffer, raceId);
  }

  protected async saveFukushou(buffer: Buffer, raceId: number) {
    const oddsKubun = await this.tool.saveOddsKubun(raceId, Baken.Fukushou, YosouKakutei.Kakutei);
    await this.kolTool.saveFukushouOdds(buffer, 161, oddsKubun.Id);
  }

  protected async saveWide(buffer: Buffer, raceId: number) {
    const oddsKubun = await this.tool.saveOddsKubun(raceId, Baken.Wide, YosouKakutei.Kakutei);
    await this.kolTool.saveWideOdds(buffer, 269, oddsKubun.Id);
  }

  protected async saveUmatan(buffer: Buffer, raceId: number) {
    const oddsKubun = await this.tool.saveOddsKubun(raceId, Baken.Umatan, YosouKakutei.Kakutei);
    await this.kolTool.saveUmatanOdds(buffer, 1799, oddsKubun.Id);
  }

  protected async saveSanrenpuku(buffer: Buffer, raceId: number) {
    const oddsKubun = await this.tool.saveOddsKubun(raceId, Baken.Sanrenpuku, YosouKakutei.Kakutei);
    await this.kolTool.saveSanrenpukuOdds(buffer, 3329, oddsKubun.Id);
  }
}