import { Logger } from "log4js";
import * as $C from "../../converters/Common";
import { KaisaiKubun } from "../../converters/Kaisai";
import { getLogger } from "../../LogUtil";
import { KaisaiInfo, KaisaiTool } from "../KaisaiTool";
import { readPositiveInt, readRaw } from "../Reader";

/**
 * JRA-VAN と JV-Data のレコードには、「年月日場回日R」(16 バイト) がある。
 * 年 4、月 2、日 2、場 2、回 2、日目 2、レース番号 2 の並び。年間スケジュールは R がなく 14 バイト。
 * 先頭にあるか(JRA-VAN)、レコード種別などの後にあるか(JV-Data)は、サブクラスの keyOffset で決める。
 */
export abstract class JraKaisaiTool extends KaisaiTool {
  protected logger: Logger;

  /** 「年月日場回日R」の位置 */
  protected abstract readonly keyOffset: number;

  constructor() {
    super();
    this.logger = getLogger(this);
  }

  protected getKaisaiInfo(buffer: Buffer): KaisaiInfo {
    const o = this.keyOffset;
    const nen = readPositiveInt(buffer, o, 4);
    if (!nen) {
      return null;
    }
    const bashoStr = readRaw(buffer, o + 8, 2);
    if (bashoStr === "00") {
      // 海外・地方成績時の既定値
      return null;
    }
    const basho = $C.basho.toCodeFromJvData(bashoStr);
    if (basho == null) {
      this.logger.warn(`不正な場所です: ${bashoStr}`);
      return null;
    }
    return {
      basho: basho,
      nen: nen,
      gatsu: readPositiveInt(buffer, o + 4, 2),
      nichi: readPositiveInt(buffer, o + 6, 2),
      kaiji: readPositiveInt(buffer, o + 10, 2),
      nichiji: readPositiveInt(buffer, o + 12, 2),
    };
  }

  /** レース番号 (「年月日場回日R」の最後の 2 バイト) */
  public getRaceBangou(buffer: Buffer) {
    return readPositiveInt(buffer, this.keyOffset + 14, 2);
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

  /** 0:中央 1:南関東 2:公営 3:道営 4:外国 (内部の場所コードから) */
  public convertChuuouChihouGaikoku(basho: number) {
    if (basho <= 9) {
      return 0;
    }
    if (basho <= 13) {
      return 1;
    }
    if (
      (14 <= basho && basho <= 18) ||
      basho === 42 ||
      basho === 54 ||
      (56 <= basho && basho <= 59)
    ) {
      return 3;
    }
    if (60 <= basho) {
      return 4;
    }
    return 2;
  }
}
