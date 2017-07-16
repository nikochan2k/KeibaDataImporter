import { Service } from "typedi";
import * as $C from "../../converters/Common";
import { RaceTool, RaceInfo } from "../RaceTool";
import {
  readHex,
  readInt,
  readPositiveInt,
  readRaw,
} from "../Reader";

@Service()
export class JrdbRaceTool extends RaceTool {

  protected getYear(buffer: Buffer) {
    const yy = readInt(buffer, 2, 2);
    if (yy === null) {
      return null;
    }

    let year: number;
    if (70 <= yy) {
      year += 1900;
    } else {
      year += 2000;
    }

    return year;
  }

  protected getRaceInfo(buffer: Buffer): RaceInfo {
    /* tslint:disable:triple-equals */
    const year = this.getYear(buffer);
    if (year == null) {
      return null;
    }
    const basho = $C.basho.toCodeFromJrdb(buffer, 0, 2);
    if (basho == null) {
      this.logger.warn("不正な場所です: " + readRaw(buffer, 0, 2));
      return null;
    }
    const years = year - 1970;
    const kaiji = readPositiveInt(buffer, 4, 1);
    const nichiji = readHex(buffer, 5, 1);
    const raceBangou = readPositiveInt(buffer, 6, 2);
    if (raceBangou == null) {
      this.logger.warn("不正なレース番号です: " + readRaw(buffer, 6, 2));
      return null;
    }
    /* tslint:enable:triple-equals */
    return {
      basho: basho,
      years: years,
      kaiji: kaiji,
      nichiji: nichiji,
      raceBangou: raceBangou
    };
  }

}