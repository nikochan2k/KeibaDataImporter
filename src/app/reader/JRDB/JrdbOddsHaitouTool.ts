import { Service } from "typedi";
import * as $C from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { RaceShussoubaId } from "../ShussoubaTool";
import { OddsHaitouTool } from "../OddsHaitouTool";
import {
  readDouble,
  readPositiveInt,
} from "../Reader";

export interface OddsHaitouInfo {
  Kakutei: $C.Kakutei;
  Baken: $C.Baken;
  OddsOffset: number;
  OddsLength: number;
  NinkiOffset?: number;
  HaitoukinOffset?: number;
}

@Service()
export class JrdbOddsHaitouTool extends OddsHaitouTool {

  public async saveOddsNinki(buffer: Buffer, rsId: RaceShussoubaId, info: OddsHaitouInfo) {
    const oddsHaitou = new OddsHaitou();
    oddsHaitou.RaceId = rsId.raceId;
    oddsHaitou.Kakutei = info.Kakutei;
    oddsHaitou.Baken = info.Baken;
    oddsHaitou.Bangou1 = rsId.umaban;
    oddsHaitou.Odds1 = readDouble(buffer, info.OddsOffset, info.OddsLength);
    oddsHaitou.Haitoukin = (info.HaitoukinOffset ? readPositiveInt(buffer, info.HaitoukinOffset, 7) : undefined);
    oddsHaitou.Ninki = (info.NinkiOffset ? readPositiveInt(buffer, info.NinkiOffset, 2) : undefined);
    await this.saveOddsHaitou(oddsHaitou);
  }

}