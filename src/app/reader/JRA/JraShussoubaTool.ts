import { Inject } from "typedi";
import * as $K from "../../converters/Kishu";
import * as $S from "../../converters/Shussouba";
import { Bagu } from "../../converters/ShussoubaJoutai";
import { Race } from "../../entities/Race";
import { Shussouba } from "../../entities/Shussouba";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { readInt, readPositiveDouble, readPositiveInt, readRaw, readTime } from "../Reader";
import { ShussoubaTool } from "../ShussoubaTool";
import { Tool } from "../Tool";
import { JraTool } from "./JraTool";

/** 異常区分コード → 取消種別 (1:出走取消 2:発走除外→6 3:競走除外 4:競走中止) */
const torikeshiShubetsuOf: { [code: string]: number } = { "1": 1, "2": 6, "3": 3, "4": 4 };

/** 出馬表の項目の位置 (JRA-VAN と JV-Data で違う) */
export interface JraShussoubaOffsets {
  wakuban: number;
  touroku: number;
  bamei: number;
  /** 馬名の長さ。省略すると 18 バイト */
  bameiLength?: number;
  seibetsu: number;
  kinryou: number;
  blinker: number;
  kishuCode: number;
  kishuTanshuku: number;
  minarai: number;
  choukyoushiCode: number;
  choukyoushiTanshuku: number;
  /** 出走時の馬齢。血統登録番号がないとき(外国馬など)にだけ使う */
  nenrei?: number;
}

/** 成績の項目の位置 (JRA-VAN と JV-Data で違う) */
export interface JraSeisekiOffsets {
  kinryou: number;
  minarai: number;
  /** 異常区分コード */
  ijou: number;
  /** 入線順位 */
  nyuusen: number;
  /** 確定着順 */
  kakutei: number;
  /** 走破タイム (9分99秒9) */
  time: number;
  /** 着差コード (3 バイト) */
  chakusa: number;
}

/** JRA-VAN の出馬表・成績と、JV-Data の馬毎レース情報に共通する出走馬の処理 */
export abstract class JraShussoubaTool extends ShussoubaTool {
  @Inject()
  protected jraTool: JraTool;

  @Inject()
  protected tool: Tool;

  /**
   * 出走馬 (と馬、競走馬、騎手、調教師) を保存します。
   * nen はレースの年で、年齢の計算に使います。
   * @param buffer 馬番が先頭にあるバッファ
   */
  public async saveShussoubaOf(
    buffer: Buffer,
    umabanOffset: number,
    race: Race,
    nen: number,
    o: JraShussoubaOffsets,
  ) {
    let toBe = this.createShussouba(buffer, umabanOffset, race.Id);
    if (!toBe) {
      return null;
    }
    const asIs = await this.entityManager.findOneBy(Shussouba, { Id: toBe.Id });

    toBe.Wakuban = readPositiveInt(buffer, o.wakuban, 1);
    const choukyoushi = await this.jraTool.saveChoukyoushi(
      buffer,
      o.choukyoushiCode,
      o.choukyoushiTanshuku,
    );
    const umaInfo = await this.jraTool.saveKyousouba(
      buffer,
      o.touroku,
      o.bamei,
      o.seibetsu,
      choukyoushi,
      o.bameiLength,
    );
    if (umaInfo) {
      toBe.KyousoubaId = umaInfo.Kyousouba.Id;
      if (umaInfo.Seinen) {
        toBe.Nenrei = this.tool.calculateNenrei(nen, umaInfo.Seinen);
      }
    }
    if (toBe.Nenrei == null && o.nenrei != null) {
      const nenrei = readPositiveInt(buffer, o.nenrei, 2);
      if (nenrei) {
        toBe.Nenrei = this.tool.normalizeNenrei(nenrei, nen);
      }
    }
    toBe.Kinryou = readPositiveDouble(buffer, o.kinryou, 3, 0.1);
    const kishu = await this.jraTool.saveKishu(buffer, o.kishuCode, o.kishuTanshuku);
    toBe.KishuId = kishu?.Id;
    toBe.MinaraiKubun = $K.minaraiKubun.toCodeFromJvData(buffer, o.minarai, 1) ?? 0;

    toBe = await this.tool.saveOrUpdate(Shussouba, asIs, toBe);
    if (readInt(buffer, o.blinker, 1) === 1) {
      await this.saveShussoubaJoutai(toBe.Id, Kubun.Bagu, Bagu.Blinker);
    }
    return { shussouba: toBe, umaInfo, kishuId: kishu?.Id };
  }

  /**
   * 成績のうち、JRA-VAN と JV-Data で読み方が同じ項目を読みます。
   * 馬体重、増減、後 3 ハロンなど、読み方が違う項目は呼び出し側で設定します。
   * @param saved saveShussoubaOf の結果
   */
  public createSeiseki(
    buffer: Buffer,
    saved: { shussouba: Shussouba; kishuId?: number },
    o: JraSeisekiOffsets,
  ) {
    const toBe = new ShussoubaSeiseki();
    toBe.Id = saved.shussouba.Id;
    toBe.Kinryou = readPositiveDouble(buffer, o.kinryou, 3, 0.1);
    toBe.KishuId = saved.kishuId;
    toBe.MinaraiKubun = $K.minaraiKubun.toCodeFromJvData(buffer, o.minarai, 1) ?? 0;
    toBe.KakuteiChakujun = this.tool.getChakujun(buffer, o.kakutei, 2);
    toBe.NyuusenChakujun = this.tool.getChakujun(buffer, o.nyuusen, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromJvData(buffer, o.ijou, 1);
    toBe.TorikeshiShubetsu = torikeshiShubetsuOf[readRaw(buffer, o.ijou, 1)];
    toBe.Time = readTime(buffer, o.time, 4);
    const chakusa = readRaw(buffer, o.chakusa, 3);
    toBe.Chakusa2 = $S.chakura2.toCodeFromJvData(chakusa);
    toBe.Chakusa1 =
      chakusa.charAt(0) === "Z"
        ? 10
        : /^[1-9]$/.test(chakusa.charAt(0))
          ? Number(chakusa.charAt(0))
          : undefined;
    return toBe;
  }

  /** 成績を保存します。既にあれば差分だけを更新します */
  public async saveSeiseki(toBe: ShussoubaSeiseki) {
    const asIs = await this.entityManager.findOneBy(ShussoubaSeiseki, { Id: toBe.Id });
    return this.tool.saveOrUpdate(ShussoubaSeiseki, asIs, toBe);
  }
}
