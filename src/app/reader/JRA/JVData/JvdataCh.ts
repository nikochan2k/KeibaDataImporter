import { ChakudosuuTaishou } from "../../../converters/Chakudosuu";
import * as $C from "../../../converters/Common";
import { ChakudosuuWriter } from "../../../daos/ChakudosuuDao";
import { choukyoushiDao } from "../../../daos/ChoukyoushiDao";
import { Choukyoushi } from "../../../entities/Choukyoushi";
import { readPositiveInt, readRaw, readStr, readStrWithNoSpace } from "../../Reader";
import { addMasterJinBlocks } from "./JvdataChakudosuuTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 調教師マスタ (CH)。
 * 本年・前年・累計成績は、データ作成年月日の時点の着度数に入れる (引退した人は 引退年・引退前年・累計)。
 * 最近の重賞勝利の情報は取り込まない。
 */
export class JvdataCh extends JvdataRecord {
  public readonly id = "CH";
  public readonly length = 3862;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const code = readStr(buffer, 11, 5);
    if (!code || !/^\d{5}$/.test(code)) {
      return;
    }
    const choukyoushi = {} as Choukyoushi;
    choukyoushi.JvDataChoukyoushiCode = code;
    choukyoushi.Seinengappi = readPositiveInt(buffer, 33, 8);
    const menkyo = readPositiveInt(buffer, 17, 8);
    choukyoushi.HatsuMenkyoNen = menkyo ? Math.floor(menkyo / 10000) : undefined;
    if (readRaw(buffer, 16, 1) === "1") {
      choukyoushi.MenkyoMasshouNengappi = readPositiveInt(buffer, 25, 8);
    }
    // 東西所属コード 1:関東 2:関西 3:地方招待 4:外国招待
    choukyoushi.TouzaiBetsu = $C.touzaiBetsu.toCodeFromJvData(buffer, 194, 1) ?? undefined;
    const touzai = readPositiveInt(buffer, 194, 1);
    choukyoushi.ShoutaiKubun = touzai === 3 ? 1 : touzai === 4 ? 2 : undefined;
    // 招待地域名 (外国は招待国名、地方は所属地名)
    choukyoushi.ShozokuBashoMei = readStr(buffer, 195, 20);
    const kanji = readStrWithNoSpace(buffer, 41, 34);
    const tanshuku = readStrWithNoSpace(buffer, 105, 8);
    const furigana = readStr(buffer, 75, 30);
    const saved = await choukyoushiDao.saveChoukyoushi(choukyoushi, kanji, tanshuku, furigana);
    const nengappi = readPositiveInt(buffer, 3, 8);
    if (nengappi) {
      const writer = new ChakudosuuWriter();
      addMasterJinBlocks(writer, buffer, ChakudosuuTaishou.Choukyoushi, saved.Id, nengappi, 704);
      writer.save();
    }
  }
}
