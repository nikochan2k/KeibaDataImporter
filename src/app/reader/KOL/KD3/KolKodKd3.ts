import { Inject, Service } from "typedi";
import { Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolKodKd3 extends DataToImport {

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 1504;
  }

  public async save(buffer: Buffer) {
    const raceId = await this.kolRaceTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveTanshou(buffer, raceId);
    await this.saveWakuren(buffer, raceId);
    await this.saveUmaren(buffer, raceId);
  }

  protected async saveTanshou(buffer: Buffer, raceId: number) {
    await this.kolRaceTool.saveTanshouOdds(buffer, 161, raceId, Kakutei.Kakutei);
  }

  protected async saveWakuren(buffer: Buffer, raceId: number) {
    await this.kolRaceTool.saveTanshouOdds(buffer, 251, raceId, Kakutei.Kakutei);
  }

  protected async saveUmaren(buffer: Buffer, raceId: number) {
    await this.kolRaceTool.saveUmarenOdds(buffer, 431, raceId, Kakutei.Kakutei);
  }
}