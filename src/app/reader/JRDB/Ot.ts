import { EntityManager } from "typeorm";
import { Baken, Kakutei } from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { OrmManager } from "../../OrmManager";
import { readPositiveDouble } from "../Reader";
import { JrdbData } from "./JrdbData";
import { jrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { jrdbRaceTool } from "./JrdbRaceTool";

export class Ot extends JrdbData {
  @OrmManager()
  protected entityManager: EntityManager;

  protected getBufferLength() {
    return 4912;
  }

  public async save(buffer: Buffer) {
    const raceId = jrdbRaceTool.getRaceId(buffer);
    await this.saveSanrenpuku(buffer, raceId);
  }

  protected async saveSanrenpuku(buffer: Buffer, raceId: number) {
    let offset = 10;
    for (let bangou1 = 1; bangou1 <= 16; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 17; bangou2++) {
        for (let bangou3 = bangou2 + 1; bangou3 <= 18; bangou3++) {
          const odds1 = readPositiveDouble(buffer, offset, 6);
          offset += 6;
          if (!odds1 || 9999.9 <= odds1) {
            // 9999.9 は取消
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
          await jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
        }
      }
    }
  }
}
