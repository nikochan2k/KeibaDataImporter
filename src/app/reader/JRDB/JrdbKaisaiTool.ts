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

  protected getKaisaiInfo(buffer: Buffer): KaisaiInfo {
    const basho = $C.basho.toCodeFromJrdb(buffer, 0, 2);
    /* tslint:disable:triple-equals */
    if (basho == null) {
      this.logger.warn("不正な場所です: " + readRaw(buffer, 0, 2));
      return null;
    }
    /* tslint:enable:triple-equals */
    return {
      basho: basho,
      nen: readInt(buffer, 6, 4),
      gatsu: readInt(buffer, 10, 2),
      nichi: readInt(buffer, 12, 2),
      kaiji: readPositiveInt(buffer, 4, 1),
      nichiji: readHex(buffer, 5, 1),
    };
  }

}