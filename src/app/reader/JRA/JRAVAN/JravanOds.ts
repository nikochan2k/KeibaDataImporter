import { Baken, Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { jravanOddsHaitouTool } from "./JravanOddsHaitouTool";
import { jravanRaceTool } from "./JravanRaceTool";

/**
 * オッズ (JracOds*.dat)。蓄積系のオッズはレース確定後のオッズ。
 * どのオッズも、先頭 98 バイトはレース情報で、オッズは 128 バイト目以降 (オッズ１は 166 バイト目以降) にある。
 */
abstract class JravanOds extends DataToImport {
  public async save(buffer: Buffer) {
    const raceId = jravanRaceTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.saveOdds(buffer, raceId);
  }

  protected abstract saveOdds(buffer: Buffer, raceId: number): Promise<void>;
}

/** オッズ１ (JracOds1.dat): 単勝・複勝・枠連 */
export class JravanOds1 extends JravanOds {
  protected getBufferLength() {
    return 491;
  }

  protected async saveOdds(buffer: Buffer, raceId: number) {
    const tool = jravanOddsHaitouTool;
    await tool.saveOdds(buffer, 165, 4, raceId, Kakutei.Kakutei, Baken.Tanshou);
    await tool.saveRangeOdds(buffer, 237, 3, raceId, Kakutei.Kakutei, Baken.Fukushou);
    await tool.saveWakurenOdds(buffer, 345, raceId, Kakutei.Kakutei);
  }
}

/** オッズ３ (JracOds3.dat): 馬連 */
export class JravanOds3 extends JravanOds {
  protected getBufferLength() {
    return 894;
  }

  protected async saveOdds(buffer: Buffer, raceId: number) {
    await jravanOddsHaitouTool.saveOdds(buffer, 127, 5, raceId, Kakutei.Kakutei, Baken.Umaren);
  }
}

/** オッズ４ (JracOds4.dat): ワイド */
export class JravanOds4 extends JravanOds {
  protected getBufferLength() {
    return 1659;
  }

  protected async saveOdds(buffer: Buffer, raceId: number) {
    await jravanOddsHaitouTool.saveRangeOdds(buffer, 127, 5, raceId, Kakutei.Kakutei, Baken.Wide);
  }
}

/** オッズ５ (JracOds5.dat): 馬単 */
export class JravanOds5 extends JravanOds {
  protected getBufferLength() {
    return 1659;
  }

  protected async saveOdds(buffer: Buffer, raceId: number) {
    await jravanOddsHaitouTool.saveOdds(buffer, 127, 5, raceId, Kakutei.Kakutei, Baken.Umatan);
  }
}

/** オッズ６ (JracOds6.dat): 3連複 */
export class JravanOds6 extends JravanOds {
  protected getBufferLength() {
    return 4209;
  }

  protected async saveOdds(buffer: Buffer, raceId: number) {
    await jravanOddsHaitouTool.saveOdds(buffer, 127, 5, raceId, Kakutei.Kakutei, Baken.Sanrenpuku);
  }
}
