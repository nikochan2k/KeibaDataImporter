import { Inject, Service } from "typedi";
import { Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolKod3Kd3 extends DataToImport {

  @Inject()
  private kolRaceTool: KolRaceTool;

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
    await this.kolRaceTool.saveSanrentanOdds(buffer, 161, raceId, Kakutei.Kakutei);
  }
}