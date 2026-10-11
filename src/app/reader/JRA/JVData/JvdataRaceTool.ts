import { Inject, Service } from "typedi";
import { Race } from "../../../entities/Race";
import { readJikan, readPositiveInt, readRaw } from "../../Reader";
import { JraRaceTool } from "../JraRaceTool";
import { JvdataKaisaiTool } from "./JvdataKaisaiTool";

/** レース詳細 (RA) の曜日コードの位置 */
export const jvdataYoubiOffset = 27;

/** レース詳細の本賞金(百円)は、1 着〜5 着と 5 着の同着 2 頭の 7 つ */
export const jvdataHonShoukinOffset = 713;

/** 成績が入っているデータ区分 (3〜7:速報・確定成績, A:地方競馬, B:海外国際レース) */
export function hasSeiseki(kubun: string) {
  return /^[3-7AB]$/.test(kubun);
}

@Service()
export class JvdataRaceTool extends JraRaceTool {
  @Inject()
  private jvdataKaisaiTool: JvdataKaisaiTool;

  protected get jraKaisaiTool() {
    return this.jvdataKaisaiTool;
  }

  /**
   * 開催とレースがなければ作ります。
   * JV-Data はレコードの収録順序が決まっていないので、馬毎レース情報や払戻などがレース詳細より先に来ても取り込めるようにする。
   * 場所や日付が読めないレコード(海外などで開催地が不明のもの)は null。
   */
  public async ensureRace(buffer: Buffer) {
    const kaisai = await this.saveKaisai(buffer);
    if (!kaisai) {
      return null;
    }
    let race = await this.getRace(buffer);
    if (!race) {
      const toBe = this.createRace(buffer, kaisai.Id);
      if (!toBe) {
        return null;
      }
      race = await this.entityManager.save(toBe);
    }
    return { kaisai, race };
  }

  /** レース詳細 (RA) のレースを読みます。成績は別に読みます */
  public createRaceWith(buffer: Buffer, kaisaiId: number): Race | null {
    const toBe = this.createRace(buffer, kaisaiId);
    if (!toBe) {
      return null;
    }
    toBe.JuushouKaisuu = readPositiveInt(buffer, 611, 3);
    this.setRaceCodes(toBe, {
      grade: readRaw(buffer, 614, 1),
      shubetsu: readRaw(buffer, 616, 2),
      kigou: readRaw(buffer, 618, 3),
      juuryou: readRaw(buffer, 621, 1),
      // 競走条件は、年齢別に 5 つある。最若年の条件を使う。
      jouken: readRaw(buffer, 634, 3),
      track: readRaw(buffer, 705, 2),
    });
    toBe.Kyori = readPositiveInt(buffer, 697, 4);
    toBe.YoteiHassouJikan = readJikan(buffer, 873);
    toBe.Tousuu = readPositiveInt(buffer, 881, 2);
    toBe.Shoukin1Chaku = readPositiveInt(buffer, jvdataHonShoukinOffset, 8, 100);
    toBe.Shoukin2Chaku = readPositiveInt(buffer, jvdataHonShoukinOffset + 8, 8, 100);
    toBe.Shoukin3Chaku = readPositiveInt(buffer, jvdataHonShoukinOffset + 16, 8, 100);
    toBe.Shoukin4Chaku = readPositiveInt(buffer, jvdataHonShoukinOffset + 24, 8, 100);
    toBe.Shoukin5Chaku = readPositiveInt(buffer, jvdataHonShoukinOffset + 32, 8, 100);
    // 付加賞金は 1 着〜3 着(と同着 2 頭)。1 着の付加賞金だけ取り込む
    toBe.FukaShou = readPositiveInt(buffer, 809, 8, 100);
    return toBe;
  }

  /** 競走名の本題と、3 文字の略称を保存します */
  public async saveRaceMeiOf(buffer: Buffer, race: Race) {
    await this.saveRaceMei(buffer, 32, 60, race);
    await this.saveRaceMei(buffer, 604, 6, race);
  }
}
