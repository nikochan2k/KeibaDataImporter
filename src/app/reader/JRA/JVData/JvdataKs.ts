import * as $K from "../../../converters/Kishu";
import { kishuDao } from "../../../daos/KishuDao";
import { Kishu } from "../../../entities/Kishu";
import { readPositiveInt, readRaw, readStr, readStrWithNoSpace } from "../../Reader";
import { jraTool } from "../JraTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 騎手マスタ (KS)。
 * 初騎乗・初勝利・最近の重賞勝利の情報と、成績の集計は取り込まない。
 */
export class JvdataKs extends JvdataRecord {
  public readonly id = "KS";
  public readonly length = 4173;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const code = readStr(buffer, 11, 5);
    if (!code || !/^\d{5}$/.test(code)) {
      return;
    }
    const kishu = new Kishu();
    kishu.JvDataKishuCode = code;
    kishu.Seinengappi = readPositiveInt(buffer, 33, 8);
    kishu.MenkyoKoufuNengappi = readPositiveInt(buffer, 17, 8);
    if (readRaw(buffer, 16, 1) === "1") {
      kishu.MenkyoMasshouNengappi = readPositiveInt(buffer, 25, 8);
    }
    // 東西所属コード 1:関東 2:関西 3:地方招待 4:外国招待 → 所属 1:関東 2:関西 3:他、招待区分 1:地方 2:外国
    const touzai = readPositiveInt(buffer, 230, 1);
    kishu.Shozoku = touzai === null ? undefined : Math.min(touzai, 3);
    kishu.ShoutaiKubun = touzai === 3 ? 1 : touzai === 4 ? 2 : undefined;
    kishu.ShozokuBashoMei = readStr(buffer, 231, 20);
    const shozoku = await jraTool.saveChoukyoushi(buffer, 251, 256);
    kishu.ShozokuChoukyoushiId = shozoku?.Id;
    kishu.MinaraiKubun = $K.minaraiKubun.toCodeFromJvData(buffer, 229, 1) ?? 0;
    const kanji = readStrWithNoSpace(buffer, 41, 34);
    const tanshuku = readStrWithNoSpace(buffer, 139, 8);
    const furigana = readStr(buffer, 109, 30);
    await kishuDao.saveKishu(kishu, kanji, tanshuku, furigana);
  }
}
