import { Service } from "typedi";
import * as $C from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { OddsHaitouTool } from "../OddsHaitouTool";
import {
  readDouble,
  readPositiveInt,
} from "../Reader";
import { Shussouba } from '../../entities/Shussouba';

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
    oddsHaitou.Odds1 = readDouble(buffer, info.OddsOffset, info.OddsLength);
    oddsHaitou.Haitoukin = (info.HaitoukinOffset ? readPositiveInt(buffer, info.HaitoukinOffset, 7) : undefined);
    oddsHaitou.Ninki = (info.NinkiOffset ? readPositiveInt(buffer, info.NinkiOffset, 2) : undefined);
    await this.saveOddsHaitou(oddsHaitou);
  }

}