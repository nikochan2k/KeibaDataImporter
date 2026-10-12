import { umaDao } from "../../../daos/UmaDao";
import { upsert } from "../../../db/helpers";
import { TouhyouJogaiba } from "../../../entities/TouhyouJogaiba";
import { Uma } from "../../../entities/Uma";
import { readInt, readPositiveInt, readStr } from "../../Reader";
import { jraTool } from "../JraTool";
import { jvdataRaceTool } from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";

/** 競走馬除外情報 (JG)。出馬投票で除外された馬を、レースごとに TouhyouJogaiba に保存する。 */
export class JvdataJg extends JvdataRecord {
  public readonly id = "JG";
  public readonly length = 80;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const touroku = jraTool.readTouroku(buffer, 27);
    const uketsukeJun = readInt(buffer, 73, 3);
    if (!touroku || uketsukeJun === null) {
      return;
    }
    const ensured = await jvdataRaceTool.ensureRace(buffer);
    if (!ensured) {
      return;
    }
    const toBe = {} as Uma;
    toBe.KettouTourokuBangou = touroku.bangou;
    toBe.Seinen = touroku.seinen;
    jraTool.setBamei(toBe, readStr(buffer, 37, 36));
    const uma = await umaDao.saveUma(toBe);
    upsert(TouhyouJogaiba, {
      RaceId: ensured.race.Id,
      UmaId: uma.Id,
      UketsukeJun: uketsukeJun,
      ShussouKubun: readPositiveInt(buffer, 76, 1),
      JogaiJoutai: readPositiveInt(buffer, 77, 1),
    });
  }
}
