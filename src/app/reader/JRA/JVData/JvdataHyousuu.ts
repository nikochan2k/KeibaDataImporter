import { Baken, Kakutei } from "../../../converters/Common";
import { readInt } from "../../Reader";
import {
  type JvdataOddsLayout,
  jvdataOddsHaitouTool,
  jvdataOddsLayouts,
} from "./JvdataOddsHaitouTool";
import { jvdataRaceTool } from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 票数 (H1・H6)。票数は返還分を含み、単位は百円 (1 票)。
 * データ区分 2:前日売最終、4:確定、5:確定(月曜)を取り込む。
 * 返還馬番情報は取り込まない (返還票数合計は取り込む)。
 */
abstract class JvdataHyousuu extends JvdataRecord {
  private getKakutei(buffer: Buffer) {
    switch (this.getKubun(buffer)) {
      case "2":
        return Kakutei.Zenjitsu;
      case "4":
      case "5":
        return Kakutei.Kakutei;
    }
    return null;
  }

  public async save(buffer: Buffer) {
    const kakutei = this.getKakutei(buffer);
    if (kakutei === null) {
      return;
    }
    const ensured = await jvdataRaceTool.ensureRace(buffer);
    if (!ensured) {
      return;
    }
    await this.saveHyousuu(buffer, ensured.race.Id, kakutei);
  }

  protected abstract saveHyousuu(buffer: Buffer, raceId: number, kakutei: Kakutei): Promise<void>;

  /** 合計票数と返還票数合計 (各 11 バイト) */
  protected async saveGoukei(
    buffer: Buffer,
    raceId: number,
    kakutei: Kakutei,
    baken: Baken,
    goukeiOffset: number,
    henkanOffset: number,
  ) {
    await jvdataOddsHaitouTool.saveRaceHyousuu(
      raceId,
      kakutei,
      baken,
      readInt(buffer, goukeiOffset, 11),
      readInt(buffer, henkanOffset, 11),
    );
  }
}

/** 票数1 (H1): 単勝・複勝・枠連・馬連・ワイド・馬単・3連複 */
export class JvdataH1 extends JvdataHyousuu {
  public readonly id = "H1";
  public readonly length = 28955;

  protected async saveHyousuu(buffer: Buffer, raceId: number, kakutei: Kakutei) {
    const tool = jvdataOddsHaitouTool;
    const layouts = jvdataOddsLayouts;
    // 賭式、繰り返しの先頭、繰り返しの回数、1 件の並び。合計票数と返還票数合計は、この順に 11 バイトずつ並ぶ
    const entries: [Baken, number, number, JvdataOddsLayout][] = [
      [Baken.Tanshou, 83, 28, layouts.tanshou],
      [Baken.Fukushou, 503, 28, layouts.fukushou],
      [Baken.Wakuren, 923, 36, layouts.wakuren],
      [Baken.Umaren, 1463, 153, layouts.umaren],
      [Baken.Wide, 4217, 153, layouts.wide],
      [Baken.Umatan, 6971, 306, layouts.umatan],
      [Baken.Sanrenpuku, 12479, 816, layouts.sanrenpuku],
    ];
    for (const [i, [baken, offset, count, layout]] of entries.entries()) {
      await tool.saveHyousuuEntries(buffer, offset, count, raceId, kakutei, baken, layout);
      await this.saveGoukei(buffer, raceId, kakutei, baken, 28799 + i * 11, 28876 + i * 11);
    }
  }
}

/** 票数6 (H6): 3連単 */
export class JvdataH6 extends JvdataHyousuu {
  public readonly id = "H6";
  public readonly length = 102890;

  protected async saveHyousuu(buffer: Buffer, raceId: number, kakutei: Kakutei) {
    const tool = jvdataOddsHaitouTool;
    const layout = jvdataOddsLayouts.sanrentan;
    await tool.saveHyousuuEntries(buffer, 50, 4896, raceId, kakutei, Baken.Sanrentan, layout);
    await this.saveGoukei(buffer, raceId, kakutei, Baken.Sanrentan, 102866, 102877);
  }
}
