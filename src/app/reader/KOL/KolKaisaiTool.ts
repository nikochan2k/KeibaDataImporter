import { Logger } from "log4js";
import { Service } from "typedi";
import * as $C from "../../converters/Common";
import { getLogger } from "../../LogUtil";
import { KaisaiInfo, KaisaiTool } from "../KaisaiTool";
import {
  readPositiveInt,
  readRaw,
  readDate,
} from "../Reader";

@Service()
export class KolKaisaiTool extends KaisaiTool {

  protected logger: Logger;

  constructor() {
    super();
    this.logger = getLogger(this);
  }

  protected getKaisaiInfo(buffer: Buffer): KaisaiInfo {
    /* tslint:disable:triple-equals */
    const year = readPositiveInt(buffer, 2, 4);
    if (year == null) {
      return null;
    }
    const basho = $C.basho.toCodeFromKol(buffer, 0, 2);
    if (basho == null) {
      this.logger.warn("不正な場所です: " + readRaw(buffer, 0, 2));
      return null;
    }
    const kaiji = readPositiveInt(buffer, 6, 2);
    const nichiji = readPositiveInt(buffer, 8, 2);
    const nengappi = readDate(buffer, 12, 8);
    if (nengappi == null) {
      this.logger.warn("日付が不正です: " + readRaw(buffer, 12, 8));
      return null;
    }
    const month = readPositiveInt(buffer, 16, 2);
    if (month == null || 12 < month) {
      this.logger.warn("月が不正です: " + readRaw(buffer, 16, 2));
      return null;
    }
    const day = readPositiveInt(buffer, 18, 2);
    if (day == null || 31 < month) {
      this.logger.warn("日が不正です: " + readRaw(buffer, 18, 2));
      return null;
    }
    /* tslint:enable:triple-equals */
    return {
      basho: basho,
      kaiji: kaiji,
      nichiji: nichiji,
      nengappi: nengappi,
      year: year,
      month: month,
      day: day
    };
  }


}