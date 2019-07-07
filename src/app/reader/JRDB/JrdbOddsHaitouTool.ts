import { Service } from "typedi";
import * as $C from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { Shussouba } from "../../entities/Shussouba";
import { OddsHaitouTool } from "../OddsHaitouTool";
import {
  readPositiveInt,
  readPositiveDouble,
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

  public async saveOddsNinki(buffer: Buffer, shussouba: Shussouba, info: OddsHaitouInfo) {
    const oddsHaitou = new OddsHaitou();
    oddsHaitou.RaceId = shussouba.RaceId;
    oddsHaitou.Kakutei = info.Kakutei;
    oddsHaitou.Baken = info.Baken;
    oddsHaitou.Bangou1 = shussouba.Umaban;
    oddsHaitou.Odds1 = readPositiveDouble(buffer, info.OddsOffset, info.OddsLength, 0.1);
    oddsHaitou.Haitoukin = (info.HaitoukinOffset ? readPositiveInt(buffer, info.HaitoukinOffset, 7) : undefined);
    oddsHaitou.Ninki = (info.NinkiOffset ? readPositiveInt(buffer, info.NinkiOffset, 2) : undefined);
    await this.saveOddsHaitou(oddsHaitou);
  }

}