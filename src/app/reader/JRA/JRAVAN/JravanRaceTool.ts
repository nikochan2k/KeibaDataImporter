import * as $C from "../../../converters/Common";
import { jinmeiDao } from "../../../daos/JinmeiDao";
import { raceDao } from "../../../daos/RaceDao";
import { umaDao } from "../../../daos/UmaDao";
import { Race } from "../../../entities/Race";
import { Record } from "../../../entities/Record";
import { Uma } from "../../../entities/Uma";
import {
  readPositiveDouble,
  readPositiveInt,
  readRaw,
  readStr,
  readStrWithNoSpace,
  readTime,
} from "../../Reader";
import { JraRaceTool } from "../JraRaceTool";
import { jraTool } from "../JraTool";
import { jravanKaisaiTool } from "./JravanKaisaiTool";

/**
 * 特別登録馬・出馬表１・成績１・オッズ・票数に共通する、先頭 148 バイトまでのレース情報を読みます。
 */
export class JravanRaceTool extends JraRaceTool {
  protected get jraKaisaiTool() {
    return jravanKaisaiTool;
  }

  /** 開催を保存します。曜日コードは、特に指定がなければ 17 バイト目 */
  public saveKaisai(buffer: Buffer, youbiOffset = 16) {
    return super.saveKaisai(buffer, youbiOffset);
  }

  /**
   * 特別登録馬・出馬表１・成績１に共通するレース情報を読みます。
   * 賞金や頭数など、レコードによって位置が違う項目は呼び出し側で読みます。
   */
  public async createRaceWith(buffer: Buffer, kaisaiId: number) {
    const toBe = this.createRace(buffer, kaisaiId);
    if (!toBe) {
      return null;
    }

    toBe.JuushouKaisuu = readPositiveInt(buffer, 83, 3);
    this.setRaceCodes(toBe, {
      grade: readRaw(buffer, 86, 1),
      shubetsu: readRaw(buffer, 87, 2),
      kigou: readRaw(buffer, 89, 3),
      juuryou: readRaw(buffer, 92, 1),
      // 競走条件は、年齢別に 5 つある。最若年の条件を使う。
      jouken: readRaw(buffer, 105, 3),
      track: readRaw(buffer, 136, 2),
    });
    toBe.Kyori = readPositiveInt(buffer, 132, 4);
    toBe.CourseRecordId = (await this.getRecord(buffer, 232))?.Id;
    return toBe;
  }

  public async saveRaceMeiOf(buffer: Buffer, mei30Offset: number, mei30Length: number, race: Race) {
    await this.saveRaceMei(buffer, mei30Offset, mei30Length, race);
    await this.saveRaceMei(buffer, 77, 6, race);
  }

  /** コースレコード。馬名がない(古いレコードは時計と日付だけ)ときは null */
  public async getRecord(buffer: Buffer, offset: number) {
    const nengappi = readPositiveInt(buffer, offset + 5, 8);
    const time = readTime(buffer, offset + 1, 4);
    const bamei = readStr(buffer, offset + 35, 18);
    if (!nengappi || !time || !bamei) {
      return null;
    }
    let uma = {} as Uma;
    const touroku = jraTool.readTouroku(buffer, offset + 25);
    if (touroku) {
      uma.KettouTourokuBangou = touroku.bangou;
      uma.Seinen = touroku.seinen;
    }
    jraTool.setBamei(uma, bamei);
    uma = await umaDao.saveUma(uma);

    const record = {} as Record;
    record.Nengappi = nengappi;
    record.Time = time;
    record.UmaId = uma.Id;
    record.Kinryou = readPositiveDouble(buffer, offset + 54, 3, 0.1);
    const tanshuku = readStrWithNoSpace(buffer, offset + 62, 8);
    const jinmei = await jinmeiDao.save(tanshuku);
    record.TanshukuKishuMeiId = jinmei.Id;
    record.Basho = $C.basho.toCodeFromJravan(buffer, offset + 13, 2);
    return raceDao.saveRecord(record);
  }
}

export const jravanRaceTool = new JravanRaceTool();
