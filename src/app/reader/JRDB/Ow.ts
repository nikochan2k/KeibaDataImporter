import { Inject } from "typedi";
import { Kakutei, Baken } from "../../converters/Common";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { JrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { readDouble } from "../Reader";

export class Ow extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  @Inject()
  protected jrdbOddsHaitouTool: JrdbOddsHaitouTool;

  protected getBufferLength() {
    return 780;
  }

  public async save(buffer: Buffer, bridge: Bridge) {
    const raceId = this.jrdbRaceTool.getRaceId(buffer);
    await this.saveWide(buffer, raceId);
  }

  protected async saveWide(buffer: Buffer, raceId: number) {
    let offset = 10;
    for (let bangou1 = 1; bangou1 <= 17; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 18; bangou2++) {
        const odds1 = readDouble(buffer, offset, 5);
        offset += 5;
        if (!odds1) {
          continue;
        }
        const oddsHaitou = new OddsHaitou();
        oddsHaitou.RaceId = raceId;
        oddsHaitou.Kakutei = Kakutei.Yosou;
        oddsHaitou.Baken = Baken.Wide;
        oddsHaitou.Bangou1 = bangou1;
        oddsHaitou.Bangou2 = bangou2;
        oddsHaitou.Odds1 = odds1;
        await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
      }
    }
  }
}