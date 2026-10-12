import { Baken } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { jravanOddsHaitouTool } from "./JravanOddsHaitouTool";
import { jravanRaceTool } from "./JravanRaceTool";

/**
 * 票数 (JracHyo*.dat)。蓄積系の票数はレース確定後の票数で、返還分を含む。
 * 票数２以外は、先頭 98 バイトがレース情報で、99 バイト目から合計票数がある。
 * 返還馬番情報は取り込まない (発売後の取消は成績の異常区分で分かる)。
 */
abstract class JravanHyo extends DataToImport {
  public async save(buffer: Buffer) {
    const raceId = jravanRaceTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveHyousuu(buffer, raceId);
  }

  protected abstract saveHyousuu(buffer: Buffer, raceId: number): Promise<void>;
}

/** 票数１ (JracHyo1.dat): 単勝・複勝・枠連 (馬番 01〜18) */
export class JravanHyo1 extends JravanHyo {
  protected getBufferLength() {
    return 815;
  }

  protected async saveHyousuu(buffer: Buffer, raceId: number) {
    const tool = jravanOddsHaitouTool;
    await tool.saveGoukeiHyousuu(buffer, 98, raceId, Baken.Tanshou);
    await tool.saveGoukeiHyousuu(buffer, 109, raceId, Baken.Fukushou);
    await tool.saveGoukeiHyousuu(buffer, 120, raceId, Baken.Wakuren);
    await tool.saveHyousuu(buffer, 165, 9, raceId, Baken.Tanshou);
    await tool.saveHyousuu(buffer, 327, 9, raceId, Baken.Fukushou);
    await tool.saveHyousuu(buffer, 489, 9, raceId, Baken.Wakuren);
  }
}

/** 票数２ (JracHyo2.dat): 出馬登録馬が 18 頭を超える場合の、馬番 19〜28 の単勝・複勝 */
export class JravanHyo2 extends JravanHyo {
  protected getBufferLength() {
    return 208;
  }

  protected async saveHyousuu(buffer: Buffer, raceId: number) {
    const umabans = Array.from({ length: 10 }, (_, i) => [19 + i]);
    await jravanOddsHaitouTool.saveHyousuu(buffer, 26, 9, raceId, Baken.Tanshou, umabans);
    await jravanOddsHaitouTool.saveHyousuu(buffer, 116, 9, raceId, Baken.Fukushou, umabans);
  }
}

/** 票数３〜６: 合計票数のあと、128 バイト目から組み合わせごとの票数が並ぶ */
abstract class JravanHyoKumiai extends JravanHyo {
  protected abstract readonly baken: Baken;

  protected abstract readonly width: number;

  protected async saveHyousuu(buffer: Buffer, raceId: number) {
    await jravanOddsHaitouTool.saveGoukeiHyousuu(buffer, 98, raceId, this.baken);
    await jravanOddsHaitouTool.saveHyousuu(buffer, 127, this.width, raceId, this.baken);
  }
}

/** 票数３ (JracHyo3.dat): 馬連 */
export class JravanHyo3 extends JravanHyoKumiai {
  protected readonly baken = Baken.Umaren;

  protected readonly width = 9;

  protected getBufferLength() {
    return 1506;
  }
}

/** 票数４ (JracHyo4.dat): ワイド */
export class JravanHyo4 extends JravanHyoKumiai {
  protected readonly baken = Baken.Wide;

  protected readonly width = 9;

  protected getBufferLength() {
    return 1506;
  }
}

/** 票数５ (JracHyo5.dat): 馬単 */
export class JravanHyo5 extends JravanHyoKumiai {
  protected readonly baken = Baken.Umatan;

  protected readonly width = 11;

  protected getBufferLength() {
    return 3495;
  }
}

/** 票数６ (JracHyo6.dat): 3連複 */
export class JravanHyo6 extends JravanHyoKumiai {
  protected readonly baken = Baken.Sanrenpuku;

  protected readonly width = 11;

  protected getBufferLength() {
    return 9105;
  }
}
