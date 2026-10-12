import { umaDao } from "../../../daos/UmaDao";
import { upsert } from "../../../db/helpers";
import { Shijou } from "../../../entities/Shijou";
import { ShijouTorihiki } from "../../../entities/ShijouTorihiki";
import { Uma } from "../../../entities/Uma";
import { readInt, readPositiveInt, readStr } from "../../Reader";
import { jraTool } from "../JraTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 競走馬市場取引価格 (HS)。市場と、市場での馬の取引を保存する。
 * 父・母の繁殖登録番号は、競走馬マスタ・産駒マスタでつなぐので取り込まない。
 */
export class JvdataHs extends JvdataRecord {
  public readonly id = "HS";
  public readonly length = 200;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const touroku = jraTool.readTouroku(buffer, 11);
    const code = readStr(buffer, 45, 6);
    const kaishiNengappi = readPositiveInt(buffer, 171, 8);
    if (!touroku || !code || /^0+$/.test(code) || kaishiNengappi == null) {
      return;
    }
    upsert(Shijou, {
      Code: code,
      ShusaishaMei: readStr(buffer, 51, 40),
      Meishou: readStr(buffer, 91, 80),
    });
    const toBe = {} as Uma;
    toBe.KettouTourokuBangou = touroku.bangou;
    toBe.Seinen = readPositiveInt(buffer, 41, 4) ?? touroku.seinen;
    const uma = await umaDao.saveUma(toBe);
    upsert(ShijouTorihiki, {
      UmaId: uma.Id,
      ShijouCode: code,
      KaishiNengappi: kaishiNengappi,
      ShuuryouNengappi: readPositiveInt(buffer, 179, 8),
      Nenrei: readInt(buffer, 187, 1),
      Kakaku: readPositiveInt(buffer, 188, 10),
    });
  }
}
