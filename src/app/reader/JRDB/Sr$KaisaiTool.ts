import * as $C from "../../converters/Common";
import { KaisaiInfo, KaisaiTool } from "../KaisaiTool";
import {
  readHex,
  readPositiveInt,
  readRaw
} from "../Reader";

export class Sr$KaisaiTool extends KaisaiTool {

  public nen: number;
  public gatsu: number;
  public nichi: number;

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
      nen: this.nen,
      gatsu: this.gatsu,
      nichi: this.nichi,
      kaiji: readPositiveInt(buffer, 4, 1),
      nichiji: readHex(buffer, 5, 1),
    };
  }

}