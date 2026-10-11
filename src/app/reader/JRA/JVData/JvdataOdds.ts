import { Inject, Service } from "typedi";
import { Baken, Kakutei } from "../../../converters/Common";
import { JvdataOddsHaitouTool, jvdataOddsLayouts } from "./JvdataOddsHaitouTool";
import { JvdataRaceTool } from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * オッズ (O1〜O6)。
 * データ区分 1(中間)は、何度も提供され時刻の列もないので取り込まない。
 * 2:前日売最終、3:最終、4:確定、5:確定(月曜)を取り込む。
 * 票数は取り込まない。
 */
abstract class JvdataOdds extends JvdataRecord {
  @Inject()
  protected jvdataRaceTool: JvdataRaceTool;

  @Inject()
  protected jvdataOddsHaitouTool: JvdataOddsHaitouTool;

  private getKakutei(buffer: Buffer) {
    switch (this.getKubun(buffer)) {
      case "2":
        return Kakutei.Zenjitsu;
      case "3":
        return Kakutei.Chokuzen;
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
    const ensured = await this.jvdataRaceTool.ensureRace(buffer);
    if (!ensured) {
      return;
    }
    await this.saveOdds(buffer, ensured.race.Id, kakutei);
  }

  protected abstract saveOdds(buffer: Buffer, raceId: number, kakutei: Kakutei): Promise<void>;
}

/** オッズ1 (O1): 単勝・複勝・枠連 */
@Service()
export class JvdataO1 extends JvdataOdds {
  public readonly id = "O1";
  public readonly length = 962;

  protected async saveOdds(buffer: Buffer, raceId: number, kakutei: Kakutei) {
    const tool = this.jvdataOddsHaitouTool;
    const layouts = jvdataOddsLayouts;
    await tool.saveEntries(buffer, 43, 28, raceId, kakutei, Baken.Tanshou, layouts.tanshou);
    await tool.saveEntries(buffer, 267, 28, raceId, kakutei, Baken.Fukushou, layouts.fukushou);
    await tool.saveEntries(buffer, 603, 36, raceId, kakutei, Baken.Wakuren, layouts.wakuren);
  }
}

/** オッズ2 (O2): 馬連 */
@Service()
export class JvdataO2 extends JvdataOdds {
  public readonly id = "O2";
  public readonly length = 2042;

  protected async saveOdds(buffer: Buffer, raceId: number, kakutei: Kakutei) {
    const layout = jvdataOddsLayouts.umaren;
    await this.jvdataOddsHaitouTool.saveEntries(
      buffer,
      40,
      153,
      raceId,
      kakutei,
      Baken.Umaren,
      layout,
    );
  }
}

/** オッズ3 (O3): ワイド */
@Service()
export class JvdataO3 extends JvdataOdds {
  public readonly id = "O3";
  public readonly length = 2654;

  protected async saveOdds(buffer: Buffer, raceId: number, kakutei: Kakutei) {
    const layout = jvdataOddsLayouts.wide;
    await this.jvdataOddsHaitouTool.saveEntries(
      buffer,
      40,
      153,
      raceId,
      kakutei,
      Baken.Wide,
      layout,
    );
  }
}

/** オッズ4 (O4): 馬単 */
@Service()
export class JvdataO4 extends JvdataOdds {
  public readonly id = "O4";
  public readonly length = 4031;

  protected async saveOdds(buffer: Buffer, raceId: number, kakutei: Kakutei) {
    const layout = jvdataOddsLayouts.umatan;
    await this.jvdataOddsHaitouTool.saveEntries(
      buffer,
      40,
      306,
      raceId,
      kakutei,
      Baken.Umatan,
      layout,
    );
  }
}

/** オッズ5 (O5): 3連複 */
@Service()
export class JvdataO5 extends JvdataOdds {
  public readonly id = "O5";
  public readonly length = 12293;

  protected async saveOdds(buffer: Buffer, raceId: number, kakutei: Kakutei) {
    const layout = jvdataOddsLayouts.sanrenpuku;
    const tool = this.jvdataOddsHaitouTool;
    await tool.saveEntries(buffer, 40, 816, raceId, kakutei, Baken.Sanrenpuku, layout);
  }
}

/** オッズ6 (O6): 3連単 */
@Service()
export class JvdataO6 extends JvdataOdds {
  public readonly id = "O6";
  public readonly length = 83285;

  protected async saveOdds(buffer: Buffer, raceId: number, kakutei: Kakutei) {
    const layout = jvdataOddsLayouts.sanrentan;
    const tool = this.jvdataOddsHaitouTool;
    await tool.saveEntries(buffer, 40, 4896, raceId, kakutei, Baken.Sanrentan, layout);
  }
}
