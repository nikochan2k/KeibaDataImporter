import { Baken, Kakutei } from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { readPositiveDouble } from "../Reader";
import { JrdbData } from "./JrdbData";
import { jrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { jrdbRaceTool } from "./JrdbRaceTool";

export class Ov extends JrdbData {
  protected getBufferLength() {
    return 34288;
  }

  public async save(buffer: Buffer) {
    const raceId = jrdbRaceTool.getRaceId(buffer);
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
          const odds1 = readPositiveDouble(buffer, offset, 7, 0.1);
          offset += 7;
          if (!odds1 || 9999999 <= Math.round(odds1 * 10)) {
            // 9999999 は取消
            continue;
          }
          const oddsHaitou = {} as OddsHaitou;
          oddsHaitou.RaceId = raceId;
          oddsHaitou.Kakutei = Kakutei.Yosou;
          oddsHaitou.Baken = Baken.Sanrentan;
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
