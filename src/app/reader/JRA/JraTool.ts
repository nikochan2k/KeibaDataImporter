import * as $U from "../../converters/Uma";
import { choukyoushiDao } from "../../daos/ChoukyoushiDao";
import { kishuDao } from "../../daos/KishuDao";
import { umaDao } from "../../daos/UmaDao";
import { Choukyoushi } from "../../entities/Choukyoushi";
import { Kishu } from "../../entities/Kishu";
import { Kyousouba } from "../../entities/Kyousouba";
import { Uma } from "../../entities/Uma";
import { readPositiveInt, readStr, readStrWithNoSpace } from "../Reader";
import { tool } from "../Tool";

/** 血統登録番号: 生年(西暦)4桁 + 品種1桁 + 数字5桁 */
export interface JraTouroku {
  /** JRDB と同じ 8 桁 (生年の下 2 桁 + 品種 + 数字) */
  bangou: string;
  seinen: number;
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
    const kishu = new Kishu();
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
    const choukyoushi = new Choukyoushi();
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
    let uma = new Uma();
    if (touroku) {
      uma.KettouTourokuBangou = touroku.bangou;
      uma.Seinen = touroku.seinen;
    }
    this.setBamei(uma, bamei);
    uma.Seibetsu = seibetsu;
    uma = await umaDao.saveUma(uma);

    let kyousouba = new Kyousouba();
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.ChoukyoushiId = choukyoushi?.Id;
    kyousouba = await umaDao.saveKyousouba(kyousouba);
    return { Kyousouba: kyousouba, Uma: uma, Seinen: touroku?.seinen };
  }

  /** 年月日(yyyymmdd)が入っていれば数値にする。0 や空白は null */
  public readNengappi(buffer: Buffer, offset: number) {
    return readPositiveInt(buffer, offset, 8);
  }
}

export const jraTool = new JraTool();
