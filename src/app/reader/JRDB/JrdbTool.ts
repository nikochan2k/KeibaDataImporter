import { Inject, Service } from "typedi";
import * as $C from "../../converters/Common";
import { Shussouba } from "../../entities/Shussouba";
import { Tool } from "../Tool";
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
export class JrdbTool {

  @Inject()
  private tool: Tool;

  public getDateFromFilename(basename: string) {
    const execed = /^[^0-9]+([0-9]{6})\.txt$/.exec(basename);
    if (!execed) {
      return null;
    }
    const yymmdd = parseInt(execed[1]);
    let yyyymmdd: number;
    if (700000 <= yymmdd) {
      yyyymmdd += 19000000;
    } else {
      yyyymmdd += 20000000;
    }
    return yyyymmdd;
  }

  public async saveOddsNinki(buffer: Buffer, shussouba: Shussouba, info: OddsHaitouInfo) {
    await this.tool.saveOddsHaitou({
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