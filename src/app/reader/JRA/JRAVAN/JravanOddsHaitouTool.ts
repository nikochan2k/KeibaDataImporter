import { Baken, Kakutei } from "../../../converters/Common";
import { OddsHaitou } from "../../../entities/OddsHaitou";
import { readInt } from "../../Reader";
import { JraOddsHaitouTool } from "../JraOddsHaitouTool";

/** 馬番の組み合わせ。馬番は 1〜18 */
function* combinations(count: number, size: number, ordered: boolean): Generator<number[]> {
  const pick = (prefix: number[]): Generator<number[]> => {
    return (function* () {
      if (prefix.length === size) {
        yield prefix;
        return;
      }
      const start = ordered || prefix.length === 0 ? 1 : prefix[prefix.length - 1] + 1;
      for (let n = start; n <= count; n++) {
        if (ordered && prefix.includes(n)) {
          continue;
        }
        yield* pick([...prefix, n]);
      }
    })();
  };
  yield* pick([]);
}

/** 枠連: 1-1, 1-2, …, 1-8, 2-2, …, 8-8 の 36 通り */
function* wakurenCombinations(): Generator<number[]> {
  for (let bangou1 = 1; bangou1 <= 8; bangou1++) {
    for (let bangou2 = bangou1; bangou2 <= 8; bangou2++) {
      yield [bangou1, bangou2];
    }
  }
}

/** オッズ・票数の繰り返しに並ぶ、馬番 1〜18 の組の順序 */
function bangouList(baken: Baken): Generator<number[]> {
  switch (baken) {
    case Baken.Tanshou:
    case Baken.Fukushou:
      return combinations(18, 1, false);
    case Baken.Wakuren:
      return wakurenCombinations();
    case Baken.Umaren:
    case Baken.Wide:
      return combinations(18, 2, false);
    case Baken.Umatan:
      return combinations(18, 2, true);
    case Baken.Sanrenpuku:
      return combinations(18, 3, false);
    default:
      throw new Error(`JRA-VAN の蓄積系データにない賭式です: ${baken}`);
  }
}

export class JravanOddsHaitouTool extends JraOddsHaitouTool {
  /** 単勝・馬連・馬単・3連複のように、オッズが 1 つの賭式 */
  public async saveOdds(
    buffer: Buffer,
    offset: number,
    width: number,
    raceId: number,
    kakutei: Kakutei,
    baken: Baken.Tanshou | Baken.Umaren | Baken.Umatan | Baken.Sanrenpuku,
  ) {
    for (const bangou of bangouList(baken)) {
      const odds1 = this.getOdds(buffer, offset, width);
      offset += width;
      if (odds1) {
        await this.saveOne(raceId, kakutei, baken, bangou, odds1);
      }
    }
  }

  /** 枠連: 1-1, 1-2, …, 1-8, 2-2, …, 8-8 の 36 通り */
  public async saveWakurenOdds(buffer: Buffer, offset: number, raceId: number, kakutei: Kakutei) {
    for (const bangou of bangouList(Baken.Wakuren)) {
      const odds1 = this.getOdds(buffer, offset, 4);
      offset += 4;
      if (odds1) {
        await this.saveOne(raceId, kakutei, Baken.Wakuren, bangou, odds1);
      }
    }
  }

  /** 複勝・ワイド: 前半が最低オッズ、後半が最高オッズ */
  public async saveRangeOdds(
    buffer: Buffer,
    offset: number,
    halfWidth: number,
    raceId: number,
    kakutei: Kakutei,
    baken: Baken.Fukushou | Baken.Wide,
  ) {
    for (const bangou of bangouList(baken)) {
      const odds1 = this.getOdds(buffer, offset, halfWidth);
      const odds2 = this.getOdds(buffer, offset + halfWidth, halfWidth);
      offset += halfWidth * 2;
      if (odds1 && odds2) {
        await this.saveOne(raceId, kakutei, baken, bangou, odds1, odds2);
      }
    }
  }

  /**
   * 組み合わせごとの票数。'0…0' は無投票 (0 票)、全スペースは登録無しで保存しない。
   * bangous を省くと、馬番 1〜18 の組の並び。
   */
  public async saveHyousuu(
    buffer: Buffer,
    offset: number,
    width: number,
    raceId: number,
    baken: Baken,
    bangous: Iterable<number[]> = bangouList(baken),
  ) {
    for (const bangou of bangous) {
      const hyousuu = readInt(buffer, offset, width);
      offset += width;
      if (hyousuu === null) {
        continue;
      }
      const toBe = {} as OddsHaitou;
      toBe.RaceId = raceId;
      toBe.Kakutei = Kakutei.Kakutei;
      toBe.Baken = baken;
      toBe.Bangou1 = bangou[0];
      toBe.Bangou2 = bangou[1];
      toBe.Bangou3 = bangou[2];
      toBe.Hyousuu = hyousuu;
      await this.saveOddsHaitou(toBe);
    }
  }

  /** 合計票数 (11 バイト) */
  public async saveGoukeiHyousuu(buffer: Buffer, offset: number, raceId: number, baken: Baken) {
    await this.saveRaceHyousuu(raceId, Kakutei.Kakutei, baken, readInt(buffer, offset, 11));
  }
}

export const jravanOddsHaitouTool = new JravanOddsHaitouTool();
