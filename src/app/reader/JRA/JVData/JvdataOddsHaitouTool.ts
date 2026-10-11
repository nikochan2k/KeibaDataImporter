import { Injectable } from "@nestjs/common";
import { Baken, Kakutei } from "../../../converters/Common";
import { HaitouInfo } from "../../OddsHaitouTool";
import { readPositiveInt } from "../../Reader";
import { JraOddsHaitouTool } from "../JraOddsHaitouTool";

/**
 * オッズ・票数の繰り返しの 1 件の並び: 馬番(または枠番)の組、オッズ、(複勝・ワイドは最高オッズ)、人気順
 */
export interface JvdataOddsLayout {
  /** 組番に含まれる馬番の数 (単勝・複勝は 1、枠連・馬連・ワイド・馬単は 2、3 連複・3 連単は 3) */
  bangouCount: number;
  /** 馬番 1 つのバイト数。枠連は 1、そのほかは 2 */
  bangouLength: number;
  oddsLength: number;
  /** 複勝・ワイドのように最高オッズが続くときのバイト数 */
  odds2Length?: number;
  ninkiLength: number;
}

/** オッズ1(単複枠)〜オッズ6(3連単) の、繰り返し 1 件の並び */
export const jvdataOddsLayouts = {
  tanshou: { bangouCount: 1, bangouLength: 2, oddsLength: 4, ninkiLength: 2 },
  fukushou: { bangouCount: 1, bangouLength: 2, oddsLength: 4, odds2Length: 4, ninkiLength: 2 },
  wakuren: { bangouCount: 2, bangouLength: 1, oddsLength: 5, ninkiLength: 2 },
  umaren: { bangouCount: 2, bangouLength: 2, oddsLength: 6, ninkiLength: 3 },
  wide: { bangouCount: 2, bangouLength: 2, oddsLength: 5, odds2Length: 5, ninkiLength: 3 },
  umatan: { bangouCount: 2, bangouLength: 2, oddsLength: 6, ninkiLength: 3 },
  sanrenpuku: { bangouCount: 3, bangouLength: 2, oddsLength: 6, ninkiLength: 3 },
  sanrentan: { bangouCount: 3, bangouLength: 2, oddsLength: 7, ninkiLength: 4 },
} satisfies { [name: string]: JvdataOddsLayout };

@Injectable()
export class JvdataOddsHaitouTool extends JraOddsHaitouTool {
  /**
   * オッズの繰り返しを保存します。JV-Data のオッズは、組番ごとに馬番が入っている。
   * 馬番が空白の組(登録なし)、無投票、発売前取消、発売後取消は保存しません。
   * @param offset 繰り返しの先頭
   * @param count 繰り返しの回数
   */
  public async saveEntries(
    buffer: Buffer,
    offset: number,
    count: number,
    raceId: number,
    kakutei: Kakutei,
    baken: Baken,
    layout: JvdataOddsLayout,
  ) {
    const bangouBytes = layout.bangouCount * layout.bangouLength;
    const oddsBytes = layout.oddsLength + (layout.odds2Length ?? 0);
    const stride = bangouBytes + oddsBytes + layout.ninkiLength;
    for (let i = 0; i < count; i++) {
      const o = offset + i * stride;
      const bangou: number[] = [];
      for (let b = 0; b < layout.bangouCount; b++) {
        bangou.push(readPositiveInt(buffer, o + b * layout.bangouLength, layout.bangouLength));
      }
      if (bangou.some((n) => !n)) {
        continue;
      }
      const odds1 = this.getOdds(buffer, o + bangouBytes, layout.oddsLength);
      const odds2 = layout.odds2Length
        ? this.getOdds(buffer, o + bangouBytes + layout.oddsLength, layout.odds2Length)
        : undefined;
      if (!odds1 || (layout.odds2Length && !odds2)) {
        continue;
      }
      const ninki = readPositiveInt(buffer, o + bangouBytes + oddsBytes, layout.ninkiLength);
      await this.saveOne(raceId, kakutei, baken, bangou, odds1, odds2, ninki ?? undefined);
    }
  }

  /** 払戻 (HR) の、払戻金の読み取り位置 */
  public static haitouInfos(): HaitouInfo[] {
    const infos: HaitouInfo[] = [];
    const add = (
      baken: Baken,
      offset: number,
      count: number,
      bangouCount: number,
      bangouLength: number,
      ninkiLength: number,
    ) => {
      // 組番、払戻金(9)、人気順
      const stride = bangouCount * bangouLength + 9 + ninkiLength;
      for (let i = 0; i < count; i++) {
        const o = offset + i * stride;
        const info: HaitouInfo = {
          baken,
          index: i + 1,
          bangou1: o,
          bangou1Len: bangouLength,
          haitou: o + bangouCount * bangouLength,
          haitouLen: 9,
          ninki: o + bangouCount * bangouLength + 9,
          ninkiLen: ninkiLength,
        };
        if (2 <= bangouCount) {
          info.bangou2 = o + bangouLength;
          info.bangou2Len = bangouLength;
        }
        if (3 <= bangouCount) {
          info.bangou3 = o + bangouLength * 2;
          info.bangou3Len = bangouLength;
        }
        infos.push(info);
      }
    };
    add(Baken.Tanshou, 102, 3, 1, 2, 2);
    add(Baken.Fukushou, 141, 5, 1, 2, 2);
    add(Baken.Wakuren, 206, 3, 2, 1, 2);
    add(Baken.Umaren, 245, 3, 2, 2, 3);
    add(Baken.Wide, 293, 7, 2, 2, 3);
    add(Baken.Umatan, 453, 6, 2, 2, 3);
    add(Baken.Sanrenpuku, 549, 3, 3, 2, 3);
    add(Baken.Sanrentan, 603, 6, 3, 2, 4);
    return infos;
  }
}
