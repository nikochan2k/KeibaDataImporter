import { Service } from "typedi";
import * as $C from "../../converters/Common";
import { KaisaiInfo, KaisaiTool } from "../KaisaiTool";
import {
  readHex,
  readInt,
  readPositiveInt,
  readRaw
} from "../Reader";

@Service()
export class JrdbKaisaiTool extends KaisaiTool {

  protected getYear(buffer: Buffer) {
    const yy = readInt(buffer, 2, 2);
    if (yy === null) {
      return null;
    }

    let year: number;
    if (70 <= yy) {
      year = yy + 1900;
    } else {
      year = yy + 2000;
    }

    return year;
  }

  protected getKaisaiInfo(buffer: Buffer): KaisaiInfo {
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
    const kaiji = readPositiveInt(buffer, 4, 1);
    const nichiji = readHex(buffer, 5, 1);
    /* tslint:enable:triple-equals */
    return {
      basho: basho,
      kaiji: kaiji,
      nichiji: nichiji,
      year: year
    };
  }

}