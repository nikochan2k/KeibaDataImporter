import { EntityManager } from "typeorm";
import { Baken, Kakutei } from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { OrmManager } from "../../OrmManager";
import { readPositiveDouble, readPositiveInt } from "../Reader";
import { JrdbData } from "./JrdbData";
import { jrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { jrdbRaceTool } from "./JrdbRaceTool";

export class Oz extends JrdbData {
  @OrmManager()
  protected entityManager: EntityManager;

  protected getBufferLength() {
    return 957;
  }

  public async save(buffer: Buffer) {
    const raceId = jrdbRaceTool.getRaceId(buffer);
    await this.saveTanshou(buffer, raceId);
    await this.saveFukushou(buffer, raceId);
    await this.saveUmaren(buffer, raceId);
  }

  /**
   * 連勝オッズは、8頭立以下のときは枠連、9頭立以上のときは馬連のオッズです(仕様書の説明)。
   * 8頭立以下では枠番と馬番が同じ並びになるので、番号の付け方は変わりません。
   */
  protected getRenshouBaken(buffer: Buffer) {
    const tousuu = readPositiveInt(buffer, 8, 2);
    return tousuu !== null && tousuu <= 8 ? Baken.Wakuren : Baken.Umaren;
  }

  protected async saveTanshou(buffer: Buffer, raceId: number) {
    for (let bangou = 1, offset = 10; bangou <= 18; bangou++, offset += 5) {
      const odds = readPositiveDouble(buffer, offset, 5);
      if (!odds) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Kakutei = Kakutei.Yosou;
      oddsHaitou.Baken = Baken.Tanshou;
      oddsHaitou.Bangou1 = bangou;
      oddsHaitou.Odds1 = odds;
      await jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

  protected async saveFukushou(buffer: Buffer, raceId: number) {
    for (let bangou = 1, offset = 100; bangou <= 18; bangou++, offset += 5) {
      const odds = readPositiveDouble(buffer, offset, 5);
      if (!odds) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Kakutei = Kakutei.Yosou;
      oddsHaitou.Baken = Baken.Fukushou;
      oddsHaitou.Bangou1 = bangou;
      oddsHaitou.Odds1 = odds;
      await jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

  protected async saveUmaren(buffer: Buffer, raceId: number) {
    const baken = this.getRenshouBaken(buffer);
    let offset = 190;
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
        oddsHaitou.Baken = baken;
        oddsHaitou.Bangou1 = bangou1;
        oddsHaitou.Bangou2 = bangou2;
        oddsHaitou.Odds1 = odds1;
        await jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
      }
    }
  }
}
