import * as $C from "../../../converters/Common";
import * as $R from "../../../converters/Race";
import * as $U from "../../../converters/Uma";
import { choukyoushiDao } from "../../../daos/ChoukyoushiDao";
import { kishuDao } from "../../../daos/KishuDao";
import { recordDao } from "../../../daos/RecordDao";
import { umaDao } from "../../../daos/UmaDao";
import { Choukyoushi } from "../../../entities/Choukyoushi";
import { Kishu } from "../../../entities/Kishu";
import { Record } from "../../../entities/Record";
import { RecordHoyuuba } from "../../../entities/RecordHoyuuba";
import { Uma } from "../../../entities/Uma";
import {
  readPositiveDouble,
  readPositiveInt,
  readRaw,
  readStr,
  readStrWithNoSpace,
  readTime,
} from "../../Reader";
import { jraTool } from "../JraTool";
import { getJraTrack } from "../JraTrack";
import { jvdataRaceTool } from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";

/** レコード保持馬 1 頭ぶんのバイト数 */
const hoyuubaLength = 130;

/**
 * レコードマスタ (RC)。コースレコードと G1 レコード、その保持馬 (同着を考えて 3 頭まで)。
 * 競走名とグレード、保持馬の馬記号は取り込まない。
 */
export class JvdataRc extends JvdataRecord {
  public readonly id = "RC";
  public readonly length = 501;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const nengappi = readPositiveInt(buffer, 12, 8);
    const time = readTime(buffer, 102, 4);
    if (!nengappi || !time) {
      return;
    }
    const record = {} as Record;
    record.Shubetsu =
      readRaw(buffer, 11, 1) === "2" ? $R.RecordShubetsu.Race : $R.RecordShubetsu.Course;
    record.Nengappi = nengappi;
    record.Time = time;
    record.Kubun = $R.recordKubun.toCodeFromJvData(buffer, 101, 1);
    record.Basho = $C.basho.toCodeFromJvData(buffer, 20, 2);
    // レースのキー (開催年〜レース番号) は、レコード識別区分の 1 バイトだけ後ろにずれている
    record.RaceId = jvdataRaceTool.getRaceId(buffer.subarray(1)) ?? undefined;
    record.Kyori = readPositiveInt(buffer, 95, 4);
    const trackCode = readRaw(buffer, 99, 2);
    record.TrackCode = Number.parseInt(trackCode, 10) || undefined;
    const track = getJraTrack(trackCode);
    record.DirtShiba = track?.dirtShiba;
    record.MigiHidari = track?.migiHidari;
    record.UchiSoto = track?.uchiSoto;
    record.KyousouShubetsuCode = readPositiveInt(buffer, 93, 2);
    record.TokubetsuBangou = readPositiveInt(buffer, 28, 4);
    record.Tenki = $R.tenki.toCodeFromJvData(buffer, 106, 1);
    // 馬場状態は芝とダートがある。障害の芝→ダートはダートの馬場状態を使う (レース詳細と同じ)
    const dirt = track?.dirtShiba === $R.DirtShiba.Dirt || trackCode === "52";
    const shiba = $R.baba.toCodeFromJvData(buffer, 107, 1);
    const dart = $R.baba.toCodeFromJvData(buffer, 108, 1);
    record.Baba = (dirt ? (dart ?? shiba) : (shiba ?? dart)) ?? undefined;

    const hoyuuba: RecordHoyuuba[] = [];
    for (let i = 0; i < 3; i++) {
      const begin = 109 + i * hoyuubaLength;
      const h = await this.saveHoyuuba(buffer.subarray(begin, begin + hoyuubaLength));
      if (h) {
        hoyuuba.push(h);
      }
    }
    await recordDao.saveRecord(record, hoyuuba);
  }

  /** 保持馬 1 頭ぶん。血統登録番号も馬名もなければ null */
  private async saveHoyuuba(buffer: Buffer) {
    const touroku = jraTool.readTouroku(buffer, 0);
    const bamei = readStr(buffer, 10, 36);
    if (!touroku && !bamei) {
      return null;
    }
    let uma = {} as Uma;
    if (touroku) {
      uma.KettouTourokuBangou = touroku.bangou;
      uma.Seinen = touroku.seinen;
    }
    jraTool.setBamei(uma, bamei);
    uma.Seibetsu = $U.seibetsu.toCodeFromJvData(buffer, 48, 1);
    uma = await umaDao.saveUma(uma);
    return {
      UmaId: uma.Id,
      Kinryou: readPositiveDouble(buffer, 88, 3, 0.1),
      KishuId: (await this.saveKishu(buffer))?.Id,
      ChoukyoushiId: (await this.saveChoukyoushi(buffer))?.Id,
    } as RecordHoyuuba;
  }

  /** 騎手コード (5 桁) と姓名。コードが初期値のときは null */
  private async saveKishu(buffer: Buffer) {
    const code = readStr(buffer, 91, 5);
    if (!code || !/^\d{5}$/.test(code) || /^0+$/.test(code)) {
      return null;
    }
    const kishu = {} as Kishu;
    kishu.JvDataKishuCode = code;
    return kishuDao.saveKishu(kishu, readStrWithNoSpace(buffer, 96, 34) ?? undefined);
  }

  /** 調教師コード (5 桁) と姓名。コードが初期値のときは null */
  private async saveChoukyoushi(buffer: Buffer) {
    const code = readStr(buffer, 49, 5);
    if (!code || !/^\d{5}$/.test(code) || /^0+$/.test(code)) {
      return null;
    }
    const choukyoushi = {} as Choukyoushi;
    choukyoushi.JvDataChoukyoushiCode = code;
    return choukyoushiDao.saveChoukyoushi(
      choukyoushi,
      readStrWithNoSpace(buffer, 54, 34) ?? undefined,
    );
  }
}
