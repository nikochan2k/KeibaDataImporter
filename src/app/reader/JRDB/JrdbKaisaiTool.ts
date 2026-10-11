import { Inject, Injectable } from "@nestjs/common";
import * as $C from "../../converters/Common";
import { Bridge } from "../Bridge";
import { KaisaiInfo, KaisaiTool } from "../KaisaiTool";
import { readHex, readPositiveInt, readRaw } from "../Reader";
import { JrdbBridge } from "./JrdbBridge";

@Injectable()
export class JrdbKaisaiTool extends KaisaiTool {
  @Inject()
  private bridge: Bridge;

  protected getBasho(buffer: Buffer) {
    const basho = $C.basho.toCodeFromJrdb(buffer, 0, 2);
    /* tslint:disable:triple-equals */
    if (basho == null) {
      // 前走データの地方・外国などで場コードが空白のレコードは、異常ではないので警告しない
      const raw = readRaw(buffer, 0, 2);
      if (raw.trim() === "") {
        this.logger.debug("場所が空白です");
      } else {
        this.logger.warn(`不正な場所です: ${raw}`);
      }
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
