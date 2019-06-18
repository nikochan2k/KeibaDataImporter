import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { JrdbData } from "./JrdbData";
import { JrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { Baken, Kakutei } from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { readDouble } from "../Reader";

export class Ov extends JrdbData {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  @Inject()
  protected jrdbOddsHaitouTool: JrdbOddsHaitouTool;

  protected getBufferLength() {
    return 34288;
  }

  public async save(buffer: Buffer) {
    const raceId = this.jrdbRaceTool.getRaceId(buffer);
    await this.saveSanrentan(buffer, raceId);
  }

  protected async saveSanrentan(buffer: Buffer, raceId: number) {
    let offset = 10;
    for (let bangou1 = 1; bangou1 <= 18; bangou1++) {
      for (let bangou2 = 1; bangou2 <= 18; bangou2++) {
        for (let bangou3 = 1; bangou3 <= 18; bangou3++) {
          if (bangou1 === bangou2 || bangou2 === bangou3 || bangou3 === bangou1) {
            continue;
          }
          const odds1 = readDouble(buffer, offset, 7, 0.1);
          offset += 7;
          if (!odds1) {
            continue;
          }
          const oddsHaitou = new OddsHaitou();
          oddsHaitou.RaceId = raceId;
          oddsHaitou.Kakutei = Kakutei.Yosou;
          oddsHaitou.Baken = Baken.Sanrentan;
          oddsHaitou.Bangou1 = bangou1;
          oddsHaitou.Bangou2 = bangou2;
          oddsHaitou.Bangou3 = bangou3;
          oddsHaitou.Odds1 = odds1;
          await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
        }
      }
    }
  }
}