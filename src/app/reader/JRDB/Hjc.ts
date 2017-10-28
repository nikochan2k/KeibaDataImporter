import { Hj$ } from "./Hj$";
import { Baken, Kakutei } from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { readPositiveInt } from "../Reader";

export class Hjc extends Hj$ {

  protected getBufferLength() {
    return 444;
  }

  protected async saveUmatan(buffer: Buffer, raceId: number) {
    for (let i = 0, offset = 227; i < 6; i++ , offset += 12) {
      const umaban1 = readPositiveInt(buffer, offset, 2);
      if (!umaban1) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Baken = Baken.Umatan;
      oddsHaitou.Kakutei = Kakutei.Kakutei;
      oddsHaitou.Bangou1 = umaban1;
      oddsHaitou.Bangou2 = readPositiveInt(buffer, offset + 2, 2);
      oddsHaitou.Haitoukin = readPositiveInt(buffer, offset + 4, 8);
      await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

  protected async saveSanrenpuku(buffer: Buffer, raceId: number) {
    for (let i = 0, offset = 300; i < 3; i++ , offset += 14) {
      const umaban1 = readPositiveInt(buffer, offset, 2);
      if (!umaban1) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Baken = Baken.Umatan;
      oddsHaitou.Kakutei = Kakutei.Kakutei;
      oddsHaitou.Bangou1 = umaban1;
      oddsHaitou.Bangou2 = readPositiveInt(buffer, offset + 2, 2);
      oddsHaitou.Bangou3 = readPositiveInt(buffer, offset + 4, 2);
      oddsHaitou.Haitoukin = readPositiveInt(buffer, offset + 6, 8);
      await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

  protected async saveSanrentan(buffer: Buffer, raceId: number) {
    for (let i = 0, offset = 342; i < 3; i++ , offset += 15) {
      const umaban1 = readPositiveInt(buffer, offset, 2);
      if (!umaban1) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Baken = Baken.Umatan;
      oddsHaitou.Kakutei = Kakutei.Kakutei;
      oddsHaitou.Bangou1 = umaban1;
      oddsHaitou.Bangou2 = readPositiveInt(buffer, offset + 2, 2);
      oddsHaitou.Bangou3 = readPositiveInt(buffer, offset + 4, 2);
      oddsHaitou.Haitoukin = readPositiveInt(buffer, offset + 6, 9);
      await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

}