import { ChakudosuuTaishou } from "../../../converters/Chakudosuu";
import { banushiDao } from "../../../daos/BanushiDao";
import { ChakudosuuWriter } from "../../../daos/ChakudosuuDao";
import { readPositiveInt, readStr } from "../../Reader";
import { tool } from "../../Tool";
import { addShoyuushaBlocks } from "./JvdataChakudosuuTool";
import { jvdataKettouTool } from "./JvdataKettouTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 馬主マスタ (BN)。馬主名は生産者マスタと同じく法人格無の名前を、法人格を除いて保存する。
 * 法人格有の名前は取り込まない。
 * 本年・累計成績は、データ作成年月日の時点の着度数に入れる。
 */
export class JvdataBn extends JvdataRecord {
  public readonly id = "BN";
  public readonly length = 477;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const code = jvdataKettouTool.readBanushiCode(buffer, 11);
    const meishou = tool.normalizeHoujinMei(buffer, 81, 64);
    if (!code || !meishou) {
      return;
    }
    const saved = await banushiDao.saveBanushi({
      JvDataCode: code,
      meishou,
      // 半角カナは読むときに全角になる
      furigana: readStr(buffer, 145, 50),
      eigo: readStr(buffer, 195, 100),
      Fukushoku: readStr(buffer, 295, 60),
    });
    const nengappi = readPositiveInt(buffer, 3, 8);
    if (nengappi) {
      const writer = new ChakudosuuWriter();
      addShoyuushaBlocks(writer, buffer, ChakudosuuTaishou.Banushi, saved.Id, nengappi, 355);
      writer.save();
    }
  }
}
