import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { Logger } from "log4js";
import { save, updateBy, type Where } from "../db/helpers";
import { getLogger } from "../LogUtil";
import { readInt, readPositiveInt, readStrWithNoSpace } from "./Reader";

/**
 * 調教の ID を返します。KOL・JRDB のどちらから取り込んでも同じ調教が同じ ID になるよう、
 * レコードの書式に依存しない項目だけで組み立てます。
 * 馬ID * 2^30 + 1970年からの日数(16ビット) * 2^14 + 場所(8ビット) * 2^6 + 種別(4ビット) * 2^2 + (連番 - 1)(2ビット)
 * 場所が不明なら 255、種別が不明なら 0 とします。
 */
export function getChoukyouId(
  umaId: number,
  days: number,
  basho: number,
  type: number,
  renban: number,
) {
  const b = basho ?? 255;
  const t = type ?? 0;
  if (
    days < 0 ||
    2 ** 16 <= days ||
    b < 0 ||
    2 ** 8 <= b ||
    t < 0 ||
    2 ** 4 <= t ||
    renban < 1 ||
    4 < renban
  ) {
    throw new Error(`調教IDの範囲外です: ${JSON.stringify({ umaId, days, basho, type, renban })}`);
  }
  const id = umaId * 2 ** 30 + days * 2 ** 14 + b * 2 ** 6 + t * 2 ** 2 + (renban - 1);
  if (!Number.isSafeInteger(id)) {
    throw new Error(`調教IDが安全な整数の範囲を超えます: umaId=${umaId}`);
  }
  return id;
}

export class Tool {
  protected logger: Logger;

  constructor() {
    this.logger = getLogger(this);
  }

  /**
   * 既存の行があれば差分だけを更新し、なければ保存します。
   * @param skipNull true (既定) のとき、toBe の null で既存の値を消しません(別のデータ元や速報版で項目が空白のとき用)
   */
  public async saveOrUpdate<E extends SQLiteTable, T extends E["$inferSelect"]>(
    entity: E,
    asIs: T,
    toBe: T,
    skipNull = true,
  ): Promise<T> {
    if (asIs) {
      const updateSet = this.createUpdateSet(asIs, toBe, skipNull);
      updateBy(entity, { Id: (asIs as unknown as { Id: number }).Id } as Where<E>, updateSet);
      return asIs;
    }
    return save(entity, toBe) as T;
  }

  protected createUpdateSet<T>(asIs: T, toBe: T, skipNull = true) {
    const updateSet = <T>{};
    const keys = Object.keys(toBe);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const toBeValue = toBe[key];
      if (toBeValue === undefined || (skipNull && toBeValue === null)) {
        continue;
      }
      if (asIs[key] !== toBeValue) {
        updateSet[key] = toBeValue;
        asIs[key] = toBeValue;
      }
    }
    return updateSet;
  }

  public getDaysFrom1970With(nen: number, gatsu: number, nichi: number) {
    // 実行環境のタイムゾーンに依存しないよう UTC で計算する(ID が環境で変わらないように)
    const time = Date.UTC(nen, gatsu - 1, nichi);
    return time / (24 * 60 * 60 * 1000);
  }

  /**
   * 年月日を示すIDを返します。
   * 年(7ビット)、月(4ビット)、日(5ビット)の計16ビットです。
   * @param {Buffer} buffer バッファ
   * @param {number} offset オフセット
   * @returns 年月日を示すID
   * @memberof ImportTool
   */
  public getDaysFrom1970(buffer: Buffer, offset: number) {
    /* tslint:disable:triple-equals */
    const nen = readInt(buffer, offset, 4);
    if (nen == null) {
      return null;
    }
    const gatsu = readInt(buffer, offset + 4, 2);
    if (gatsu == null) {
      return null;
    }
    const nichi = readInt(buffer, offset + 6, 2);
    if (nichi == null) {
      return null;
    }
    /* tslint:enable:triple-equals */
    return this.getDaysFrom1970With(nen, gatsu, nichi);
  }

  public normalizeHoujinMei(buffer: Buffer, offset: number, length: number) {
    let meishou = readStrWithNoSpace(buffer, offset, length);
    if (!meishou) {
      return meishou;
    }
    meishou = meishou.replace(/\(株\)|㈱|株式会社/, "");
    meishou = meishou.replace(/\(有\)|㈲|有限会社/, "");
    meishou = meishou.replace(/・/g, "");
    meishou = meishou.replace(/氏$/, "");
    return meishou;
  }

  public normalizeTokubetsuMei(buffer, offset, length) {
    let meishou = readStrWithNoSpace(buffer, offset, length);
    if (!meishou) {
      return meishou;
    }
    meishou = meishou.replace(/S$/, "ステークス");
    meishou = meishou.replace(/T$/, "トロフィー");
    meishou = meishou.replace(/H$|ハンデ$/, "ハンデキャップ");
    return meishou;
  }
  public normalizeNenrei(nenrei: number, nen: number) {
    if (nen < 2001) {
      nenrei--;
    }
    return nenrei;
  }

  public calculateNenrei(nen: number, seinen: number) {
    return nen - seinen;
  }

  public isEnglish(name: string) {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: ASCII範囲の判定が目的
    return /^[\x00-\x7F]*$/.test(name);
  }

  public getChakujun(buffer, offset, length) {
    const chakujun = readPositiveInt(buffer, offset, length);
    if (1 <= chakujun && chakujun <= 28) {
      return chakujun;
    }
    return null;
  }
}

export const tool = new Tool();
