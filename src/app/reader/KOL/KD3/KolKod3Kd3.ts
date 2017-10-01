import { Inject, Service } from "typedi";
import { Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { KolImportTool } from "../KolImportTool";

@Service()
export class KolKod3Kd3 extends DataToImport {

  @Inject()
  private kolImportTool: KolImportTool;

  protected getBufferLength() {
    return 49123;
  }

  public async save(buffer: Buffer) {
    const raceId = await this.kolImportTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveSanrentan(buffer, raceId);
  }

  protected async saveSanrentan(buffer: Buffer, raceId: number) {
    await this.kolImportTool.saveSanrentanOdds(buffer, 161, raceId, Kakutei.Kakutei);
  }
}