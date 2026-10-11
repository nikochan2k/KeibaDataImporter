import { EntityManager } from "typeorm";
import { Baken, Kakutei } from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { OrmManager } from "../../OrmManager";
import { readPositiveDouble } from "../Reader";
import { JrdbData } from "./JrdbData";
import { jrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { jrdbRaceTool } from "./JrdbRaceTool";

export class Ow extends JrdbData {
  @OrmManager()
  protected entityManager: EntityManager;

  protected getBufferLength() {
    return 780;
  }

  public async save(buffer: Buffer) {
    const raceId = jrdbRaceTool.getRaceId(buffer);
    await this.saveWide(buffer, raceId);
  }

  protected async saveWide(buffer: Buffer, raceId: number) {
    let offset = 10;
    for (let bangou1 = 1; bangou1 <= 17; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 18; bangou2++) {
        const odds1 = readPositiveDouble(buffer, offset, 5);
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
        await jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
      }
    }
  }
}
