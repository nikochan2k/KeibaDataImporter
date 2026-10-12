import * as $U from "../../../converters/Uma";
import { umaDao } from "../../../daos/UmaDao";
import { Uma } from "../../../entities/Uma";
import { readPositiveInt, readStr } from "../../Reader";
import { tool } from "../../Tool";
import { jraTool } from "../JraTool";
import { jvdataKettouTool } from "./JvdataKettouTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 繁殖馬マスタ (HN)。繁殖登録番号で馬を引き、父・母も繁殖登録番号でつなぐ。
 * 馬名半角カナは取り込まない。
 */
export class JvdataHn extends JvdataRecord {
  public readonly id = "HN";
  public readonly length = 251;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const bangou = jvdataKettouTool.readHanshokuBangou(buffer, 11);
    if (!bangou) {
      return;
    }
    const sosen = [229, 239].map((offset) => ({
      bangou: jvdataKettouTool.readHanshokuBangou(buffer, offset),
      bamei: null,
    }));
    const parents = await jvdataKettouTool.saveSosen(umaDao.findHanshokuba(bangou), sosen);

    const uma = {} as Uma;
    // 外国の繁殖馬は血統登録番号が初期値で、馬名は馬名欧字の頭 36 バイト
    const touroku = jraTool.readTouroku(buffer, 29);
    if (touroku) {
      uma.KettouTourokuBangou = touroku.bangou;
    }
    const bamei = readStr(buffer, 40, 36);
    if (bamei && !tool.isEnglish(bamei)) {
      uma.KanaBamei = bamei;
    }
    uma.EigoBamei =
      readStr(buffer, 116, 80) ?? (bamei && tool.isEnglish(bamei) ? bamei : undefined);
    // 1980 年以前生まれは、血統登録番号の上 4 桁が生年でないことがあるので、生年の項目を使う
    uma.Seinen = readPositiveInt(buffer, 196, 4);
    uma.Seibetsu = $U.seibetsu.toCodeFromJvData(buffer, 200, 1);
    uma.Kesshu = $U.kesshu.toCodeFromJvData(buffer, 201, 1);
    uma.Keiro = $U.keiro.toCodeFromJvData(buffer, 202, 2);
    uma.YunyuubaFlag = $U.yunyuubaFlag.toCodeFromJvData(buffer, 204, 1);
    uma.YunyuuNen = readPositiveInt(buffer, 205, 4);
    uma.SanchiMei = readStr(buffer, 209, 20);
    uma.ChichiUmaId = parents[0]?.Id;
    uma.HahaUmaId = parents[1]?.Id;
    await umaDao.saveHanshokuba(bangou, uma);
  }
}
