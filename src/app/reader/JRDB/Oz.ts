import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { JrdbData } from "./JrdbData";
import { JrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { Baken, Kakutei } from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { readDouble } from "../Reader";

export class Oz extends JrdbData {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  @Inject()
  protected jrdbOddsHaitouTool: JrdbOddsHaitouTool;

  protected getBufferLength() {
    return 957;
  }

  public async save(buffer: Buffer) {
    const raceId = this.jrdbRaceTool.getRaceId(buffer);
    await this.saveTanshou(buffer, raceId);
    await this.saveFukushou(buffer, raceId);
    await this.saveUmaren(buffer, raceId);
  }

  protected async saveTanshou(buffer: Buffer, raceId: number) {
    for (let bangou = 1, offset = 10; bangou <= 18; bangou++ , offset += 5) {
      const odds = readDouble(buffer, offset, 5);
      if (!odds) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Kakutei = Kakutei.Yosou;
      oddsHaitou.Baken = Baken.Tanshou;
      oddsHaitou.Bangou1 = bangou;
      oddsHaitou.Odds1 = odds;
      await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

  protected async saveFukushou(buffer: Buffer, raceId: number) {
    for (let bangou = 1, offset = 100; bangou <= 18; bangou++ , offset += 5) {
      const odds = readDouble(buffer, offset, 5);
      if (!odds) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Kakutei = Kakutei.Yosou;
      oddsHaitou.Baken = Baken.Fukushou;
      oddsHaitou.Bangou1 = bangou;
      oddsHaitou.Odds1 = odds;
      await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

  protected async saveUmaren(buffer: Buffer, raceId: number) {
    let offset = 190;
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