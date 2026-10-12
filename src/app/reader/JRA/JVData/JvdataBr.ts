import { ChakudosuuTaishou } from "../../../converters/Chakudosuu";
import { ChakudosuuWriter } from "../../../daos/ChakudosuuDao";
import { seisanshaDao } from "../../../daos/SeisanshaDao";
import { readPositiveInt, readStr } from "../../Reader";
import { tool } from "../../Tool";
import { addShoyuushaBlocks } from "./JvdataChakudosuuTool";
import { jvdataKettouTool } from "./JvdataKettouTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 生産者マスタ (BR)。生産者名は競走馬マスタと同じく法人格無の名前を、法人格を除いて保存する。
 * 本年・累計成績は、データ作成年月日の時点の着度数に入れる。
 */
export class JvdataBr extends JvdataRecord {
  public readonly id = "BR";
  public readonly length = 545;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const code = jvdataKettouTool.readSeisanshaCode(buffer, 11);
    const meishou = tool.normalizeHoujinMei(buffer, 91, 72);
    if (!code || !meishou) {
      return;
    }
    const saved = await seisanshaDao.saveSeisansha({
      JvDataCode: code,
      meishou,
      // 半角カナは読むときに全角になる
      furigana: readStr(buffer, 163, 72),
      eigo: readStr(buffer, 235, 168),
      Juusho: readStr(buffer, 403, 20),
    });
    const nengappi = readPositiveInt(buffer, 3, 8);
    if (nengappi) {
      const writer = new ChakudosuuWriter();
      addShoyuushaBlocks(writer, buffer, ChakudosuuTaishou.Seisansha, saved.Id, nengappi, 423);
      writer.save();
    }
  }
}
