import { Logger } from "log4js";
import { Service } from "typedi";
import * as $C from "../../converters/Common";
import { KaisaiKubun } from "../../converters/Kaisai";
import { getLogger } from "../../LogUtil";
import { KaisaiInfo, KaisaiTool } from "../KaisaiTool";
import { readPositiveInt, readRaw } from "../Reader";

@Service()
export class KolKaisaiTool extends KaisaiTool {

  protected logger: Logger;

  constructor() {
    super();
    this.logger = getLogger(this);
  }

  protected getKaisaiInfo(buffer: Buffer): KaisaiInfo {
    /* tslint:disable:triple-equals */
    const nen = readPositiveInt(buffer, 12, 4);
    if (!nen) {
      return null;
    }
    const basho = $C.basho.toCodeFromKol(buffer, 0, 2);
    if (basho == null) {
      this.logger.warn("不正な場所です: " + readRaw(buffer, 0, 2));
      return null;
    }
    /* tslint:enable:triple-equals */
    return {
      basho: basho,
      nen: nen,
      gatsu: readPositiveInt(buffer, 16, 2),
      nichi: readPositiveInt(buffer, 18, 2),
      kaiji: readPositiveInt(buffer, 6, 2),
      nichiji: readPositiveInt(buffer, 8, 2)
    };
  }

  public convertKaisaiKubunFrom(basho: number) {
    switch (basho) {
      case 0:
      case 1:
        return KaisaiKubun.Kansai;
      case 4:
      case 5:
        return KaisaiKubun.Kantou;
      case 2:
      case 3:
      case 6:
      case 7:
      case 8:
      case 9:
        return KaisaiKubun.Local;
    }
    return null;
  }

}