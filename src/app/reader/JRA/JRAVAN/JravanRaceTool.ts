import * as $C from "../../../converters/Common";
import * as $R from "../../../converters/Race";
import * as $U from "../../../converters/Uma";
import { recordDao } from "../../../daos/RecordDao";
import { umaDao } from "../../../daos/UmaDao";
import { Race } from "../../../entities/Race";
import { Record } from "../../../entities/Record";
import { RecordHoyuuba } from "../../../entities/RecordHoyuuba";
import { Uma } from "../../../entities/Uma";
import { readPositiveDouble, readPositiveInt, readRaw, readStr, readTime } from "../../Reader";
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
    toBe.CourseRecordId = (
      await this.saveCourseRecord(buffer, 232, toBe, readRaw(buffer, 136, 2))
    )?.Id;
    return toBe;
  }

  public async saveRaceMeiOf(buffer: Buffer, mei30Offset: number, mei30Length: number, race: Race) {
    await this.saveRaceMei(buffer, mei30Offset, mei30Length, race);
    await this.saveRaceMei(buffer, 77, 6, race);
  }

  /**
   * コースレコード (競走種別に応じて 2 歳か 3 歳以上のもの)。距離・トラックはそのレースのもの。
   * 馬名がない (古いレコードは時計と日付だけ) ときは null
   */
  public async saveCourseRecord(buffer: Buffer, offset: number, race: Race, trackCode: string) {
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
    uma.Seibetsu = $U.seibetsu.toCodeFromJravan(buffer, offset + 53, 1);
    uma = await umaDao.saveUma(uma);
    const kishu = await jraTool.saveKishu(buffer, offset + 57, offset + 62);
    const choukyoushi = await jraTool.saveChoukyoushi(buffer, offset + 71, offset + 76);

    const record = {} as Record;
    record.Shubetsu = $R.RecordShubetsu.Course;
    record.Nengappi = nengappi;
    record.Time = time;
    record.Kubun = $R.recordKubun.toCodeFromJravan(buffer, offset, 1);
    const key = buffer.subarray(offset + 5, offset + 21);
    record.Basho = $C.basho.toCodeFromJravan(key, 8, 2);
    record.RaceId = this.getRaceId(key) ?? undefined;
    record.Kyori = race.Kyori;
    record.TrackCode = Number.parseInt(trackCode, 10) || undefined;
    record.DirtShiba = race.DirtShiba;
    record.MigiHidari = race.MigiHidari;
    record.UchiSoto = race.UchiSoto;
    record.Baba = $R.baba.toCodeFromJravan(buffer, offset + 21, 1);
    record.Tenki = $R.tenki.toCodeFromJravan(buffer, offset + 22, 1);
    return recordDao.saveRecord(record, [
      {
        UmaId: uma.Id,
        Kinryou: readPositiveDouble(buffer, offset + 54, 3, 0.1),
        KishuId: kishu?.Id,
        ChoukyoushiId: choukyoushi?.Id,
      } as RecordHoyuuba,
    ]);
  }
}

export const jravanRaceTool = new JravanRaceTool();
