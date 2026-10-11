import { Injectable } from "@nestjs/common";
import { Baken, Kakutei } from "../../../converters/Common";
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

@Injectable()
export class JravanOddsHaitouTool extends JraOddsHaitouTool {
  /** 単勝・馬連・馬単・3連複のように、オッズが 1 つの賭式 */
  public async saveOdds(
    buffer: Buffer,
    offset: number,
    width: number,
    raceId: number,
    kakutei: Kakutei,
    baken: Baken,
  ) {
    let list: Generator<number[]>;
    switch (baken) {
      case Baken.Tanshou:
        list = combinations(18, 1, false);
        break;
      case Baken.Umaren:
        list = combinations(18, 2, false);
        break;
      case Baken.Umatan:
        list = combinations(18, 2, true);
        break;
      case Baken.Sanrenpuku:
        list = combinations(18, 3, false);
        break;
      default:
        throw new Error(`オッズが 1 つの賭式ではありません: ${baken}`);
    }
    for (const bangou of list) {
      const odds1 = this.getOdds(buffer, offset, width);
      offset += width;
      if (odds1) {
        await this.saveOne(raceId, kakutei, baken, bangou, odds1);
      }
    }
  }

  /** 枠連: 1-1, 1-2, …, 1-8, 2-2, …, 8-8 の 36 通り */
  public async saveWakurenOdds(buffer: Buffer, offset: number, raceId: number, kakutei: Kakutei) {
    for (let bangou1 = 1; bangou1 <= 8; bangou1++) {
      for (let bangou2 = bangou1; bangou2 <= 8; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 4);
        offset += 4;
        if (odds1) {
          await this.saveOne(raceId, kakutei, Baken.Wakuren, [bangou1, bangou2], odds1);
        }
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
    const list = baken === Baken.Fukushou ? combinations(18, 1, false) : combinations(18, 2, false);
    for (const bangou of list) {
      const odds1 = this.getOdds(buffer, offset, halfWidth);
      const odds2 = this.getOdds(buffer, offset + halfWidth, halfWidth);
      offset += halfWidth * 2;
      if (odds1 && odds2) {
        await this.saveOne(raceId, kakutei, baken, bangou, odds1, odds2);
      }
    }
  }
}
