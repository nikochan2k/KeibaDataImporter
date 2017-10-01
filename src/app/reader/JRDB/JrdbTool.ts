import { Inject, Service } from "typedi";
import * as $C from "../../converters/Common";
import { Shussouba } from "../../entities/Shussouba";
import { Tool } from "../Tool";
import {
  readDouble,
  readPositiveInt,
} from "../Reader";

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

  public async saveOddsNinki(buffer: Buffer, shussouba: Shussouba, kakutei: $C.Kakutei, baken: $C.Baken, oddsOffset: number, oddsLength: number, ninkiOffset: number) {
    await this.tool.saveOddsHaitou({
      RaceId: shussouba.RaceId,
      Kakutei: kakutei,
      Baken: baken,
      Bangou1: shussouba.Umaban,
      Odds1: readDouble(buffer, oddsOffset, oddsLength),
      Ninki: readPositiveInt(buffer, ninkiOffset, 2)
    });
  }

}