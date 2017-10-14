import { Service } from "typedi";
import * as $C from "../../converters/Common";
import { Shussouba } from "../../entities/Shussouba";
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

  public async saveOddsNinki(buffer: Buffer, shussouba: Shussouba, info: OddsHaitouInfo) {
    await this.saveOddsHaitou({
      RaceId: shussouba.RaceId,
      Kakutei: info.Kakutei,
      Baken: info.Baken,
      Bangou1: shussouba.Umaban,
      Odds1: readDouble(buffer, info.OddsOffset, info.OddsLength),
      Ninki: (info.NinkiOffset ? readPositiveInt(buffer, info.NinkiOffset, 2) : undefined),
      Haitoukin: (info.HaitoukinOffset ? readPositiveInt(buffer, info.HaitoukinOffset, 7) : undefined)
    });
  }

}