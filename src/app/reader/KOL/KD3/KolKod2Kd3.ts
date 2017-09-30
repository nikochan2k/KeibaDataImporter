import { Inject, Service } from "typedi";
import { Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolKod2Kd3 extends DataToImport {

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 9043;
  }

  public async save(buffer: Buffer) {
    const raceId = await this.kolRaceTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveFukushou(buffer, raceId);
    await this.saveWide(buffer, raceId);
    await this.saveUmatan(buffer, raceId);
  }

  protected async saveFukushou(buffer: Buffer, raceId: number) {
    await this.kolRaceTool.saveFukushouOdds(buffer, 161, raceId, Kakutei.Kakutei);
  }

  protected async saveWide(buffer: Buffer, raceId: number) {
    await this.kolRaceTool.saveWideOdds(buffer, 269, raceId, Kakutei.Kakutei);
  }

  protected async saveUmatan(buffer: Buffer, raceId: number) {
    await this.kolRaceTool.saveUmatanOdds(buffer, 1799, raceId, Kakutei.Kakutei);
  }

  protected async saveSanrenpuku(buffer: Buffer, raceId: number) {
    await this.kolRaceTool.saveSanrenpukuOdds(buffer, 3329, raceId, Kakutei.Kakutei);
  }
}