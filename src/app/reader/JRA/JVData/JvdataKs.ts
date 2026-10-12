import { ChakudosuuTaishou } from "../../../converters/Chakudosuu";
import * as $K from "../../../converters/Kishu";
import { ChakudosuuWriter } from "../../../daos/ChakudosuuDao";
import { kishuDao } from "../../../daos/KishuDao";
import { Kishu } from "../../../entities/Kishu";
import { readPositiveInt, readRaw, readStr, readStrWithNoSpace } from "../../Reader";
import { jraTool } from "../JraTool";
import { addMasterJinBlocks } from "./JvdataChakudosuuTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 騎手マスタ (KS)。
 * 本年・前年・累計成績は、データ作成年月日の時点の着度数に入れる (引退した人は 引退年・引退前年・累計)。
 * 初騎乗・初勝利・最近の重賞勝利の情報は取り込まない。
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
    const kishu = {} as Kishu;
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
    const saved = await kishuDao.saveKishu(kishu, kanji, tanshuku, furigana);
    const nengappi = readPositiveInt(buffer, 3, 8);
    if (nengappi) {
      const writer = new ChakudosuuWriter();
      addMasterJinBlocks(writer, buffer, ChakudosuuTaishou.Kishu, saved.Id, nengappi, 1015);
      writer.save();
    }
  }
}
