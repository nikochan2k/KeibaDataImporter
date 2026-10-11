import { HeichiShougai } from "../../../converters/Race";
import { Race } from "../../../entities/Race";
import { Shussouba } from "../../../entities/Shussouba";
import { kolShussoubaTool } from "../../KOL/KolShussoubaTool";
import { readPositiveInt, readSignedInt } from "../../Reader";
import { JraSeisekiOffsets, JraShussoubaOffsets, JraShussoubaTool } from "../JraShussoubaTool";
import { jravanOddsHaitouTool } from "./JravanOddsHaitouTool";
import { jravanRaceTool } from "./JravanRaceTool";

/** 出馬表・成績の馬番ごとの情報の長さ */
export const jravanDenUmaLength = 63;
export const jravanSeiUmaLength = 129;

const shussoubaOffsets: JraShussoubaOffsets = {
  wakuban: 2,
  touroku: 3,
  bamei: 13,
  seibetsu: 31,
  kinryou: 32,
  blinker: 35,
  kishuCode: 36,
  kishuTanshuku: 41,
  minarai: 49,
  choukyoushiCode: 50,
  choukyoushiTanshuku: 55,
};

const seisekiOffsets: JraSeisekiOffsets = {
  kinryou: 32,
  minarai: 49,
  ijou: 63,
  nyuusen: 91,
  kakutei: 93,
  time: 84,
  chakusa: 88,
};

/**
 * 出馬表・成績の馬番ごとの情報 (先頭 63 バイトは共通) を読みます。
 * buffer はその馬番の情報だけを切り出したものです。
 */
export class JravanShussoubaTool extends JraShussoubaTool {
  protected getRaceId(buffer: Buffer) {
    return jravanRaceTool.getRaceId(buffer);
  }

  /** 該当馬番のデータがない(全項目が空白)ときは false */
  public hasUma(buffer: Buffer) {
    return 0 < readPositiveInt(buffer, 0, 2);
  }

  /** レコードの中の n 番目の馬番ごとの情報を切り出します */
  public slice(buffer: Buffer, from: number, index: number, length: number) {
    const begin = from + index * length;
    return buffer.subarray(begin, begin + length);
  }

  /**
   * 出走馬 (と馬、競走馬、騎手、調教師) を保存します。
   * nen はレースの年で、年齢の計算に使います。
   */
  public saveJravanShussoubaOf(buffer: Buffer, race: Race, nen: number) {
    return this.saveShussoubaOf(buffer, 0, race, nen, shussoubaOffsets);
  }

  /** 後 3 ハロンのタイム (0.1 秒単位)。1994 年 7 月 16 日より後は、60 秒を超える分だけが入っている */
  private readAgari3F(buffer: Buffer, raceNengappi: number) {
    const value = readPositiveInt(buffer, 81, 3);
    if (!value) {
      return null;
    }
    return (raceNengappi > 19940716 && value < 200 ? value + 600 : value) * 0.1;
  }

  /**
   * 成績の馬番ごとの情報を保存します。
   * @param saved saveJravanShussoubaOf の結果
   */
  public async saveSeisekiOf(
    buffer: Buffer,
    race: Race,
    raceNengappi: number,
    saved: { shussouba: Shussouba; kishuId?: number },
  ) {
    const { shussouba } = saved;
    const toBe = this.createSeiseki(buffer, saved, seisekiOffsets);
    toBe.Bataijuu = readPositiveInt(buffer, 64, 3);
    toBe.Zougen = readSignedInt(buffer, 67, 3);
    if (race.HeichiShougai === HeichiShougai.Heichi) {
      // 障害競走の後 3 ハロンは、実際には後 1 ハロン
      toBe.Agari3F = this.readAgari3F(buffer, raceNengappi);
      if (toBe.Time && toBe.Agari3F) {
        toBe.Agari3FIzen = toBe.Time - toBe.Agari3F;
      }
    }
    await this.saveSeiseki(toBe);

    await jravanOddsHaitouTool.saveKakuteiNinkiOdds(buffer, race.Id, shussouba.Umaban, 95, 97);
    await kolShussoubaTool.saveShussoubaTsuukaJuni(buffer, 70, shussouba);
  }
}

export const jravanShussoubaTool = new JravanShussoubaTool();
