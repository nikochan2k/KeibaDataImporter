import { Service } from "typedi";
import { JrdbKaisaiTool } from "./JrdbKaisaiTool";
import * as $C from "../../converters/Common";
import { KaisaiInfo } from "../KaisaiTool";
import {
  readHex,
  readInt,
  readPositiveInt,
  readRaw
} from "../Reader";

@Service()
export class JrdbKaisaiShussoubaTool extends JrdbKaisaiTool {

  /** 場コードが中央競馬(京都〜函館)かどうか */
  public static isJra(basho: number) {
    return 0 <= basho && basho <= 9;
  }

  protected getKaisaiInfo(buffer: Buffer): KaisaiInfo {
    const basho = $C.basho.toCodeFromJrdb(buffer, 0, 2);
    /* tslint:disable:triple-equals */
    if (basho == null) {
      this.logger.warn("不正な場所です: " + readRaw(buffer, 0, 2));
      return null;
    }
    /* tslint:enable:triple-equals */
    const nen = readInt(buffer, 18, 4);
    const gatsu = readInt(buffer, 22, 2);
    const nichi = readInt(buffer, 24, 2);
    // 地方・外国のレースキーは、回・日が月・日の英字変換になっている。
    // 変換規則に頼らず、年月日をそのまま回次・日次として使う(どちらも 5 ビットに収まる)。
    const jra = JrdbKaisaiShussoubaTool.isJra(basho);
    return {
      basho: basho,
      nen: nen,
      gatsu: gatsu,
      nichi: nichi,
      kaiji: jra ? readPositiveInt(buffer, 4, 1) : gatsu,
      nichiji: jra ? readHex(buffer, 5, 1) : nichi,
    };
  }

}