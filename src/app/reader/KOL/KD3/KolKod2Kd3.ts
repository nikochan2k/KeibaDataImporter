import { Inject, Service } from "typedi";
import { YosouKakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { KolRaceTool } from "../KolRaceTool";
import { KolTool } from "../KolTool";

@Service()
export class KolKod2Kd3 extends DataToImport {

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
    await this.kolTool.saveFukushouOdds(buffer, 161, raceId, YosouKakutei.Kakutei);
  }

  protected async saveWide(buffer: Buffer, raceId: number) {
    await this.kolTool.saveWideOdds(buffer, 269, raceId, YosouKakutei.Kakutei);
  }

  protected async saveUmatan(buffer: Buffer, raceId: number) {
    await this.kolTool.saveUmatanOdds(buffer, 1799, raceId, YosouKakutei.Kakutei);
  }

  protected async saveSanrenpuku(buffer: Buffer, raceId: number) {
    await this.kolTool.saveSanrenpukuOdds(buffer, 3329, raceId, YosouKakutei.Kakutei);
  }
}