import { umaDao } from "../../../daos/UmaDao";
import { upsert } from "../../../db/helpers";
import { Keitou } from "../../../entities/Keitou";
import { Uma } from "../../../entities/Uma";
import { readStr } from "../../Reader";
import { jvdataKettouTool } from "./JvdataKettouTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 系統情報 (BT)。系統 (系統 ID・系統名・説明) を保存し、繁殖登録番号の馬をその系統につなぐ。
 * 繁殖馬マスタより先に来たときは、繁殖登録番号だけの馬を作っておく (繁殖馬マスタが同じ馬に入る)。
 */
export class JvdataBt extends JvdataRecord {
  public readonly id = "BT";
  public readonly length = 6889;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const bangou = jvdataKettouTool.readHanshokuBangou(buffer, 11);
    const keitouId = readStr(buffer, 21, 30);
    if (!bangou || !keitouId) {
      return;
    }
    upsert(Keitou, {
      Id: keitouId,
      Meishou: readStr(buffer, 51, 36),
      Setsumei: readStr(buffer, 87, 6800),
    });
    const uma = {} as Uma;
    uma.KeitouId = keitouId;
    await umaDao.saveHanshokuba(bangou, uma);
  }
}
