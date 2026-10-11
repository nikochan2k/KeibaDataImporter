import { Inject, Injectable } from "@nestjs/common";
import { Kakutei } from "../../converters/Common";
import { DataToImport } from "../DataToImport";
import { KolOddsHaitouTool } from "./KolOddsHaitouTool";
import { KolRaceTool } from "./KolRaceTool";

@Injectable()
export class KolKod extends DataToImport {
  @Inject()
  private kolRaceTool: KolRaceTool;

  @Inject()
  private kolOddsHaitouTool: KolOddsHaitouTool;

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
    await this.kolOddsHaitouTool.saveTanshouOdds(buffer, 161, raceId, Kakutei.Kakutei);
  }

  protected async saveWakuren(buffer: Buffer, raceId: number) {
    await this.kolOddsHaitouTool.saveWakurenOdds(buffer, 251, raceId, Kakutei.Kakutei);
  }

  protected async saveUmaren(buffer: Buffer, raceId: number) {
    await this.kolOddsHaitouTool.saveUmarenOdds(buffer, 431, raceId, Kakutei.Kakutei);
  }
}
