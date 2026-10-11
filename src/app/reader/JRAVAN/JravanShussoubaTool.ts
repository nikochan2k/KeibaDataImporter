import { Inject, Service } from "typedi";
import * as $K from "../../converters/Kishu";
import { HeichiShougai } from "../../converters/Race";
import * as $S from "../../converters/Shussouba";
import { Bagu } from "../../converters/ShussoubaJoutai";
import { Race } from "../../entities/Race";
import { Shussouba } from "../../entities/Shussouba";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { KolShussoubaTool } from "../KOL/KolShussoubaTool";
import {
  readInt,
  readPositiveDouble,
  readPositiveInt,
  readRaw,
  readSignedInt,
  readTime,
} from "../Reader";
import { ShussoubaTool } from "../ShussoubaTool";
import { Tool } from "../Tool";
import { JravanOddsHaitouTool } from "./JravanOddsHaitouTool";
import { JravanRaceTool } from "./JravanRaceTool";
import { JravanTool } from "./JravanTool";

/** 出馬表・成績の馬番ごとの情報の長さ */
export const jravanDenUmaLength = 63;
export const jravanSeiUmaLength = 129;

/** 異常区分コード → 取消種別 (1:出走取消 2:発走除外→6 3:競走除外 4:競走中止) */
const torikeshiShubetsuOf: { [code: string]: number } = { "1": 1, "2": 6, "3": 3, "4": 4 };

/**
 * 出馬表・成績の馬番ごとの情報 (先頭 63 バイトは共通) を読みます。
 * buffer はその馬番の情報だけを切り出したものです。
 */
@Service()
export class JravanShussoubaTool extends ShussoubaTool {
  @Inject()
  private jravanRaceTool: JravanRaceTool;

  @Inject()
  private jravanTool: JravanTool;

  @Inject()
  private tool: Tool;

  @Inject()
  private oddsHaitouTool: JravanOddsHaitouTool;

  @Inject()
  private kolShussoubaTool: KolShussoubaTool;

  protected getRaceId(buffer: Buffer) {
    return this.jravanRaceTool.getRaceId(buffer);
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
  public async saveShussoubaOf(buffer: Buffer, race: Race, nen: number) {
    let toBe = this.createShussouba(buffer, 0, race.Id);
    if (!toBe) {
      return null;
    }
    const asIs = await this.entityManager.findOneBy(Shussouba, { Id: toBe.Id });

    toBe.Wakuban = readPositiveInt(buffer, 2, 1);
    const choukyoushi = await this.jravanTool.saveChoukyoushi(buffer, 50, 55);
    const umaInfo = await this.jravanTool.saveKyousouba(buffer, 3, 13, 31, choukyoushi);
    if (umaInfo) {
      toBe.KyousoubaId = umaInfo.Kyousouba.Id;
      if (umaInfo.Seinen) {
        toBe.Nenrei = this.tool.calculateNenrei(nen, umaInfo.Seinen);
      }
    }
    toBe.Kinryou = readPositiveDouble(buffer, 32, 3, 0.1);
    const kishu = await this.jravanTool.saveKishu(buffer, 36, 41);
    toBe.KishuId = kishu?.Id;
    toBe.MinaraiKubun = $K.minaraiKubun.toCodeFromJravan(buffer, 49, 1) ?? 0;

    toBe = await this.tool.saveOrUpdate(Shussouba, asIs, toBe);
    if (readInt(buffer, 35, 1) === 1) {
      await this.saveShussoubaJoutai(toBe.Id, Kubun.Bagu, Bagu.Blinker);
    }
    return { shussouba: toBe, umaInfo, kishuId: kishu?.Id };
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
   * @param saved saveShussoubaOf の結果
   */
  public async saveSeisekiOf(
    buffer: Buffer,
    race: Race,
    raceNengappi: number,
    saved: { shussouba: Shussouba; kishuId?: number },
  ) {
    const { shussouba } = saved;
    const asIs = await this.entityManager.findOneBy(ShussoubaSeiseki, { Id: shussouba.Id });
    const toBe = new ShussoubaSeiseki();
    toBe.Id = shussouba.Id;
    toBe.Kinryou = readPositiveDouble(buffer, 32, 3, 0.1);
    toBe.Bataijuu = readPositiveInt(buffer, 64, 3);
    toBe.Zougen = readSignedInt(buffer, 67, 3);
    toBe.KishuId = saved.kishuId;
    toBe.MinaraiKubun = $K.minaraiKubun.toCodeFromJravan(buffer, 49, 1) ?? 0;
    toBe.KakuteiChakujun = this.tool.getChakujun(buffer, 93, 2);
    toBe.NyuusenChakujun = this.tool.getChakujun(buffer, 91, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromJravan(buffer, 63, 1);
    toBe.TorikeshiShubetsu = torikeshiShubetsuOf[readRaw(buffer, 63, 1)];
    toBe.Time = readTime(buffer, 84, 4);
    const chakusa = readRaw(buffer, 88, 3);
    toBe.Chakusa2 = $S.chakura2.toCodeFromJravan(chakusa);
    toBe.Chakusa1 =
      chakusa.charAt(0) === "Z"
        ? 10
        : /^[1-9]$/.test(chakusa.charAt(0))
          ? Number(chakusa.charAt(0))
          : undefined;
    if (race.HeichiShougai === HeichiShougai.Heichi) {
      // 障害競走の後 3 ハロンは、実際には後 1 ハロン
      toBe.Agari3F = this.readAgari3F(buffer, raceNengappi);
      if (toBe.Time && toBe.Agari3F) {
        toBe.Agari3FIzen = toBe.Time - toBe.Agari3F;
      }
    }
    await this.tool.saveOrUpdate(ShussoubaSeiseki, asIs, toBe);

    await this.oddsHaitouTool.saveKakuteiNinkiOdds(buffer, race.Id, shussouba.Umaban, 95, 97);
    await this.kolShussoubaTool.saveShussoubaTsuukaJuni(buffer, 70, shussouba);
  }
}
