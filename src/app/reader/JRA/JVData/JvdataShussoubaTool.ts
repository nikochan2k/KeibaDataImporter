import { HeichiShougai } from "../../../converters/Race";
import { banushiDao } from "../../../daos/BanushiDao";
import { Race } from "../../../entities/Race";
import { MeishouKubun } from "../../../entities/Shoyuu";
import { Shussouba } from "../../../entities/Shussouba";
import { kolShussoubaTool } from "../../KOL/KolShussoubaTool";
import { readInt, readPositiveInt, readRaw } from "../../Reader";
import { tool } from "../../Tool";
import { JraSeisekiOffsets, JraShussoubaOffsets, JraShussoubaTool } from "../JraShussoubaTool";
import { jvdataOddsHaitouTool } from "./JvdataOddsHaitouTool";
import { jvdataRaceTool } from "./JvdataRaceTool";

/** 馬毎レース情報 (SE) の馬番の位置 */
export const jvdataUmabanOffset = 28;

const shussoubaOffsets: JraShussoubaOffsets = {
  wakuban: 27,
  touroku: 30,
  bamei: 40,
  bameiLength: 36,
  seibetsu: 78,
  nenrei: 82,
  kinryou: 288,
  blinker: 294,
  kishuCode: 296,
  kishuTanshuku: 306,
  minarai: 322,
  choukyoushiCode: 85,
  choukyoushiTanshuku: 90,
};

const seisekiOffsets: JraSeisekiOffsets = {
  kinryou: 288,
  minarai: 322,
  ijou: 331,
  nyuusen: 332,
  kakutei: 334,
  time: 338,
  chakusa: 342,
};

/** 馬毎レース情報 (SE) */
export class JvdataShussoubaTool extends JraShussoubaTool {
  protected getRaceId(buffer: Buffer) {
    return jvdataRaceTool.getRaceId(buffer);
  }

  /** 馬番。出走馬名表(馬番が決まる前)や、馬番が不明の海外レースは null */
  public getUmaban(buffer: Buffer) {
    return readPositiveInt(buffer, jvdataUmabanOffset, 2);
  }

  /** 出走馬 (と馬、競走馬、騎手、調教師、馬主) を保存します */
  public async saveJvdataShussoubaOf(buffer: Buffer, race: Race, nen: number) {
    const saved = await this.saveShussoubaOf(
      buffer,
      jvdataUmabanOffset,
      race,
      nen,
      shussoubaOffsets,
    );
    if (!saved) {
      return null;
    }
    const banushiMei = tool.normalizeHoujinMei(buffer, 104, 64);
    if (banushiMei) {
      await banushiDao.save(saved.shussouba.Id, MeishouKubun.Full, banushiMei);
    }
    return saved;
  }

  /** 馬体重 (kg)。999 は計量不能、000 は出走取消 */
  private readBataijuu(buffer: Buffer) {
    const value = readPositiveInt(buffer, 324, 3);
    return value && value <= 998 ? value : null;
  }

  /** 増減差 (kg)。999 は計量不能、空白は初出走(など) */
  private readZougen(buffer: Buffer) {
    const value = readInt(buffer, 328, 3);
    if (value === null || 998 < value) {
      return null;
    }
    return readRaw(buffer, 327, 1) === "-" ? -value : value;
  }

  /** 後 3 ハロンのタイム (秒)。999 は出走取消、競走中止など */
  private readAgari3F(buffer: Buffer) {
    const value = readPositiveInt(buffer, 390, 3);
    return value && value < 999 ? value * 0.1 : null;
  }

  /** 1 着馬(1 着の馬は 2 着馬)とのタイム差(秒)。符号 + 99 秒 9。9999 は出走取消、競走中止など */
  private readTimeSa(buffer: Buffer) {
    const str = readRaw(buffer, 531, 4);
    return /^[+-]\d{3}$/.test(str) ? Number(str.substring(1)) * 0.1 : null;
  }

  /** 成績を保存します */
  public async saveJvdataSeisekiOf(
    buffer: Buffer,
    race: Race,
    saved: { shussouba: Shussouba; kishuId?: number },
  ) {
    const { shussouba } = saved;
    const toBe = this.createSeiseki(buffer, saved, seisekiOffsets);
    toBe.Bataijuu = this.readBataijuu(buffer);
    toBe.Zougen = this.readZougen(buffer);
    toBe.HonShoukin = readPositiveInt(buffer, 365, 8, 100);
    toBe.Chaku12TimeSa = this.readTimeSa(buffer);
    if (race.HeichiShougai !== HeichiShougai.Shougai) {
      // 障害競走の後 3 ハロンは、実際には後 1 ハロン
      toBe.Agari3F = this.readAgari3F(buffer);
      if (toBe.Time && toBe.Agari3F) {
        toBe.Agari3FIzen = toBe.Time - toBe.Agari3F;
      }
    }
    await this.saveSeiseki(toBe);

    await jvdataOddsHaitouTool.saveKakuteiNinkiOdds(buffer, race.Id, shussouba.Umaban, 363, 359);
    await kolShussoubaTool.saveShussoubaTsuukaJuni(buffer, 351, shussouba);
  }
}

export const jvdataShussoubaTool = new JvdataShussoubaTool();
