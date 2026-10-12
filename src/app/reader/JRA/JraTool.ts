import * as $U from "../../converters/Uma";
import { choukyoushiDao } from "../../daos/ChoukyoushiDao";
import { kishuDao } from "../../daos/KishuDao";
import { umaDao } from "../../daos/UmaDao";
import { upsert } from "../../db/helpers";
import { Choukyoushi } from "../../entities/Choukyoushi";
import { Kishu } from "../../entities/Kishu";
import { Kyousouba } from "../../entities/Kyousouba";
import { Race } from "../../entities/Race";
import { TokubetsuTourokuba } from "../../entities/TokubetsuTourokuba";
import { Uma } from "../../entities/Uma";
import { readPositiveDouble, readPositiveInt, readStr, readStrWithNoSpace } from "../Reader";
import { tool } from "../Tool";

/** 血統登録番号: 生年(西暦)4桁 + 品種1桁 + 数字5桁 */
export interface JraTouroku {
  /** JRDB と同じ 8 桁 (生年の下 2 桁 + 品種 + 数字) */
  bangou: string;
  seinen: number;
}

/** 特別登録馬 1 頭ぶんの中の、項目の位置 (0 始まり)。連番は先頭の 3 バイト */
export interface JraTokubetsuTourokubaOffsets {
  touroku: number;
  bamei: number;
  bameiLength: number;
  seibetsu: number;
  choukyoushiCode: number;
  choukyoushiTanshuku: number;
  kinryou: number;
  kouryuuKubun?: number;
}

export class JraTool {
  /** 血統登録番号を読みます。中央初出走などで「初期値」(全部 0 か空白) のときは null */
  public readTouroku(buffer: Buffer, offset: number): JraTouroku | null {
    const str = readStr(buffer, offset, 10);
    if (!str || !/^\d{10}$/.test(str) || /^0+$/.test(str)) {
      return null;
    }
    return { bangou: str.substring(2), seinen: Number.parseInt(str.substring(0, 4), 10) };
  }

  /** 騎手コード(5 桁)と略称から騎手を保存します。コードが初期値のときは null */
  public async saveKishu(buffer: Buffer, codeOffset: number, tanshukuOffset: number) {
    const code = readStr(buffer, codeOffset, 5);
    if (!code || !/^\d{5}$/.test(code) || /^0+$/.test(code)) {
      return null;
    }
    const kishu = {} as Kishu;
    kishu.JvDataKishuCode = code;
    const tanshuku = readStrWithNoSpace(buffer, tanshukuOffset, 8);
    return kishuDao.saveKishu(kishu, undefined, tanshuku);
  }

  /** 調教師コード(5 桁)と略称から調教師を保存します。コードが初期値のときは null */
  public async saveChoukyoushi(buffer: Buffer, codeOffset: number, tanshukuOffset: number) {
    const code = readStr(buffer, codeOffset, 5);
    if (!code || !/^\d{5}$/.test(code) || /^0+$/.test(code)) {
      return null;
    }
    const choukyoushi = {} as Choukyoushi;
    choukyoushi.JvDataChoukyoushiCode = code;
    const tanshuku = readStrWithNoSpace(buffer, tanshukuOffset, 8);
    return choukyoushiDao.saveChoukyoushi(choukyoushi, undefined, tanshuku);
  }

  /** 馬名を、英字ならば英語馬名、そうでなければカナ馬名にする */
  public setBamei(uma: Uma, bamei: string | null) {
    if (!bamei) {
      return;
    }
    if (tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
  }

  /**
   * 出走馬のレコードから馬と競走馬を保存します。
   * 血統登録番号がなく(中央初出走など)馬名もないときは null です。
   */
  public async saveKyousouba(
    buffer: Buffer,
    toroukuOffset: number,
    bameiOffset: number,
    seibetsuOffset: number,
    choukyoushi: Choukyoushi | null,
    bameiLength = 18,
  ) {
    const bamei = readStr(buffer, bameiOffset, bameiLength);
    const touroku = this.readTouroku(buffer, toroukuOffset);
    if (!bamei && !touroku) {
      return null;
    }
    const seibetsu = $U.seibetsu.toCodeFromJravan(buffer, seibetsuOffset, 1);
    let uma = {} as Uma;
    if (touroku) {
      uma.KettouTourokuBangou = touroku.bangou;
      uma.Seinen = touroku.seinen;
    }
    this.setBamei(uma, bamei);
    uma.Seibetsu = seibetsu;
    uma = await umaDao.saveUma(uma);

    let kyousouba = {} as Kyousouba;
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.ChoukyoushiId = choukyoushi?.Id;
    kyousouba = await umaDao.saveKyousouba(kyousouba);
    return { Kyousouba: kyousouba, Uma: uma, Seinen: touroku?.seinen };
  }

  /**
   * 特別登録馬 1 頭ぶんを保存します。buffer はその馬の情報だけを切り出したもの、offsets はその中の位置です。
   * 血統登録番号も馬名もない (該当する連番がない) ときは保存しません。
   */
  public async saveTokubetsuTourokuba(
    buffer: Buffer,
    race: Race,
    offsets: JraTokubetsuTourokubaOffsets,
  ) {
    const choukyoushi = await this.saveChoukyoushi(
      buffer,
      offsets.choukyoushiCode,
      offsets.choukyoushiTanshuku,
    );
    const saved = await this.saveKyousouba(
      buffer,
      offsets.touroku,
      offsets.bamei,
      offsets.seibetsu,
      choukyoushi,
      offsets.bameiLength,
    );
    if (!saved) {
      return null;
    }
    return upsert(TokubetsuTourokuba, {
      RaceId: race.Id,
      UmaId: saved.Uma.Id,
      Renban: readPositiveInt(buffer, 0, 3),
      KyousoubaId: saved.Kyousouba.Id,
      Kinryou: readPositiveDouble(buffer, offsets.kinryou, 3, 0.1),
      KouryuuKubun:
        offsets.kouryuuKubun === undefined
          ? undefined
          : readPositiveInt(buffer, offsets.kouryuuKubun, 1),
    });
  }

  /** 年月日(yyyymmdd)が入っていれば数値にする。0 や空白は null */
  public readNengappi(buffer: Buffer, offset: number) {
    return readPositiveInt(buffer, offset, 8);
  }
}

export const jraTool = new JraTool();
