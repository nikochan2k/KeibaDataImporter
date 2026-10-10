import { HaitouInfo } from "../OddsHaitouTool";

/**
 * 区間 [from, 次の区間の from) の項目が、この世代のレコードでどこにあるか。
 * delta は KD3 のアドレスに足す値で、null はこの世代にはない項目 (読み取らない)。
 */
export interface KolLayoutSegment {
  from: number;
  delta: number | null;
}

/**
 * KD3 のアドレスを基準にして、世代ごとのアドレスに読み替えます。
 *
 * KD2 と KD3 は、項目の意味も並びもほとんど同じで、項目が増えた分だけアドレスがずれています。
 * そのため、取り込み処理は KD3 のアドレスで書いておき、KD2 では「ずれ」の表だけを差し替えます。
 */
export class KolLayout {
  /** KD3 そのまま */
  public static readonly kd3 = new KolLayout([{ from: 0, delta: 0 }]);

  constructor(public readonly segments: readonly KolLayoutSegment[]) {}

  private segmentOf(offset: number) {
    let found = this.segments[0];
    for (const segment of this.segments) {
      if (offset < segment.from) {
        break;
      }
      found = segment;
    }
    return found;
  }

  /** KD3 のアドレスに対応する項目がこの世代にあるか */
  public has(kd3Offset: number) {
    return this.segmentOf(kd3Offset).delta !== null;
  }

  /** KD3 のアドレスをこの世代のアドレスにする。この世代にない項目なら例外 */
  public at(kd3Offset: number) {
    const { delta } = this.segmentOf(kd3Offset);
    if (delta === null) {
      throw new Error(`この世代のデータには、アドレス ${kd3Offset} (KD3) の項目がありません`);
    }
    return kd3Offset + delta;
  }

  /** 配当の読み取り位置をこの世代のアドレスにする */
  public atHaitou(info: HaitouInfo): HaitouInfo {
    const mapped = { ...info, bangou1: this.at(info.bangou1), haitou: this.at(info.haitou) };
    if (info.bangou2) {
      mapped.bangou2 = this.at(info.bangou2);
    }
    if (info.bangou3) {
      mapped.bangou3 = this.at(info.bangou3);
    }
    if (info.ninki) {
      mapped.ninki = this.at(info.ninki);
    }
    return mapped;
  }
}
