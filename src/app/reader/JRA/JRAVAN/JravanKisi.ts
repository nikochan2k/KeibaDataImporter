import { ChakudosuuTaishou } from "../../../converters/Chakudosuu";
import * as $K from "../../../converters/Kishu";
import { ChakudosuuWriter } from "../../../daos/ChakudosuuDao";
import { kishuDao } from "../../../daos/KishuDao";
import { Kishu } from "../../../entities/Kishu";
import { DataToImport } from "../../DataToImport";
import { readPositiveInt, readStr, readStrWithNoSpace } from "../../Reader";
import { jraTool } from "../JraTool";
import { addJravanJinSeiseki } from "./JravanChakudosuu";

/** 騎手 (JracKisi.dat)。成績 (生涯・本年・前年の着回数と賞金) は着度数に入れる。近走重賞勝鞍は取り込まない。 */
export class JravanKisi extends DataToImport {
  protected getBufferLength() {
    return 1161;
  }

  public async save(buffer: Buffer) {
    const code = readStr(buffer, 0, 5);
    if (!code || !/^\d{5}$/.test(code)) {
      return;
    }
    const kishu = {} as Kishu;
    kishu.JvDataKishuCode = code;
    kishu.Seinengappi = readPositiveInt(buffer, 80, 8);
    // 初免許年 (西暦 4 桁)
    kishu.MenkyoKoufuNengappi = readPositiveInt(buffer, 129, 4);
    if (readStr(buffer, 13, 1) === "1") {
      kishu.MenkyoMasshouNengappi = readPositiveInt(buffer, 14, 8);
    }
    // 東西区分 1:東 2:西 3:招待 → 所属 1:関東 2:関西 3:他
    kishu.Shozoku = readPositiveInt(buffer, 88, 1);
    const shozoku = await jraTool.saveChoukyoushi(buffer, 91, 96);
    kishu.ShozokuChoukyoushiId = shozoku?.Id;
    kishu.ShoutaiKubun = readPositiveInt(buffer, 104, 1);
    kishu.ShozokuBashoMei = readStr(buffer, 105, 24);
    kishu.MinaraiKubun = $K.minaraiKubun.toCodeFromJravan(buffer, 90, 1) ?? 0;
    const kanji = readStrWithNoSpace(buffer, 22, 32);
    const tanshuku = readStrWithNoSpace(buffer, 72, 8);
    const furigana = readStr(buffer, 54, 18);
    const saved = await kishuDao.saveKishu(kishu, kanji, tanshuku, furigana);

    const nengappi = readPositiveInt(buffer, 5, 8);
    if (nengappi) {
      const writer = new ChakudosuuWriter();
      addJravanJinSeiseki(
        writer,
        buffer,
        ChakudosuuTaishou.Kishu,
        saved.Id,
        nengappi,
        447,
        { shoukin: 391, chakukaisuu: 487, keibajou: 511, kyori: 751 },
        { shoukin: 419, chakukaisuu: 823, keibajou: 847, kyori: 1087 },
      );
      writer.save();
    }
  }
}
