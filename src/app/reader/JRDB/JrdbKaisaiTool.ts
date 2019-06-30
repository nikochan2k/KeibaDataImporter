import { Inject, Service } from "typedi";
import { JrdbBridge } from "./JrdbBridge";
import * as $C from "../../converters/Common";
import { Bridge } from "../Bridge";
import { KaisaiInfo, KaisaiTool } from "../KaisaiTool";
import { readHex, readPositiveInt, readRaw } from "../Reader";

@Service()
export class JrdbKaisaiTool extends KaisaiTool {

  @Inject()
  private bridge: Bridge;

  protected getBasho(buffer: Buffer) {
    const basho = $C.basho.toCodeFromJrdb(buffer, 0, 2);
    /* tslint:disable:triple-equals */
    if (basho == null) {
      this.logger.warn("不正な場所です: " + readRaw(buffer, 0, 2));
      return null;
    }
    /* tslint:enable:triple-equals */
    return basho;
  }

  protected getKaisaiInfo(buffer: Buffer): KaisaiInfo {
    const jrdbBridge = <JrdbBridge>this.bridge;
    return {
      basho: this.getBasho(buffer),
      nen: jrdbBridge.nen,
      gatsu: jrdbBridge.gatsu,
      nichi: jrdbBridge.nichi,
      kaiji: readPositiveInt(buffer, 4, 1),
      nichiji: readHex(buffer, 5, 1),
    };
  }

}