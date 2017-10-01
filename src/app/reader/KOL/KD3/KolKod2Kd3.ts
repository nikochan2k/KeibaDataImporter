import { Inject, Service } from "typedi";
import { Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { KolImportTool } from "../KolImportTool";

@Service()
export class KolKod2Kd3 extends DataToImport {

  @Inject()
  private kolImportTool: KolImportTool;

  protected getBufferLength() {
    return 9043;
  }

  public async save(buffer: Buffer) {
    const raceId = await this.kolImportTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveFukushou(buffer, raceId);
    await this.saveWide(buffer, raceId);
    await this.saveUmatan(buffer, raceId);
  }

  protected async saveFukushou(buffer: Buffer, raceId: number) {
    await this.kolImportTool.saveFukushouOdds(buffer, 161, raceId, Kakutei.Kakutei);
  }

  protected async saveWide(buffer: Buffer, raceId: number) {
    await this.kolImportTool.saveWideOdds(buffer, 269, raceId, Kakutei.Kakutei);
  }

  protected async saveUmatan(buffer: Buffer, raceId: number) {
    await this.kolImportTool.saveUmatanOdds(buffer, 1799, raceId, Kakutei.Kakutei);
  }

  protected async saveSanrenpuku(buffer: Buffer, raceId: number) {
    await this.kolImportTool.saveSanrenpukuOdds(buffer, 3329, raceId, Kakutei.Kakutei);
  }
}