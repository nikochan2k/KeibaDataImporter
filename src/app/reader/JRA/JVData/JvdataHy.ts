import { umaDao } from "../../../daos/UmaDao";
import { Uma } from "../../../entities/Uma";
import { readStr } from "../../Reader";
import { jraTool } from "../JraTool";
import { JvdataRecord } from "./JvdataRecord";

/** 馬名の意味由来 (HY)。血統登録番号で馬を引き、馬名の意味由来を入れる。 */
export class JvdataHy extends JvdataRecord {
  public readonly id = "HY";
  public readonly length = 123;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const touroku = jraTool.readTouroku(buffer, 11);
    const yurai = readStr(buffer, 57, 64);
    if (!touroku || !yurai) {
      return;
    }
    const uma = {} as Uma;
    uma.KettouTourokuBangou = touroku.bangou;
    uma.Seinen = touroku.seinen;
    jraTool.setBamei(uma, readStr(buffer, 21, 36));
    uma.BameiYurai = yurai;
    await umaDao.saveUma(uma);
  }
}
