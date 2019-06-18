import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { JrdbData } from "./JrdbData";
import { JrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { Baken, Kakutei } from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { readDouble } from "../Reader";

export class Ot extends JrdbData {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  @Inject()
  protected jrdbOddsHaitouTool: JrdbOddsHaitouTool;

  protected getBufferLength() {
    return 4912;
  }

  public async save(buffer: Buffer) {
    const raceId = this.jrdbRaceTool.getRaceId(buffer);
    await this.saveSanrenpuku(buffer, raceId);
  }

  protected async saveSanrenpuku(buffer: Buffer, raceId: number) {
    let offset = 10;
    for (let bangou1 = 1; bangou1 <= 16; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 17; bangou2++) {
        for (let bangou3 = bangou2 + 1; bangou3 <= 18; bangou3++) {
          const odds1 = readDouble(buffer, offset, 6);
          offset += 7;
          if (!odds1) {
            continue;
          }
          const oddsHaitou = new OddsHaitou();
          oddsHaitou.RaceId = raceId;
          oddsHaitou.Kakutei = Kakutei.Yosou;
          oddsHaitou.Baken = Baken.Sanrenpuku;
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