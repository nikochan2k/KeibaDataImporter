import { Baken, Kakutei } from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { OddsHaitouTool } from "../OddsHaitouTool";
import { readPositiveDouble, readPositiveInt } from "../Reader";

/** JRA-VAN と JV-Data に共通する、オッズの読み取りと保存 */
export abstract class JraOddsHaitouTool extends OddsHaitouTool {
  /**
   * オッズを読みます。単位は 0.1 倍。
   * '9999' は上限以上(999.9 倍以上)。'0000'(無投票)、'----'(発売前取消)、'****'(発売後取消)、空白は null。
   */
  protected getOdds(buffer: Buffer, offset: number, length: number) {
    return readPositiveDouble(buffer, offset, length, 0.1);
  }

  protected async saveOne(
    raceId: number,
    kakutei: Kakutei,
    baken: Baken,
    bangou: number[],
    odds1: number,
    odds2?: number,
    ninki?: number,
  ) {
    const oddsHaitou = new OddsHaitou();
    oddsHaitou.RaceId = raceId;
    oddsHaitou.Kakutei = kakutei;
    oddsHaitou.Baken = baken;
    oddsHaitou.Bangou1 = bangou[0];
    oddsHaitou.Bangou2 = bangou[1];
    oddsHaitou.Bangou3 = bangou[2];
    oddsHaitou.Odds1 = odds1;
    oddsHaitou.Odds2 = odds2;
    oddsHaitou.Ninki = ninki;
    await this.saveOddsHaitou(oddsHaitou);
  }

  /** 成績の出走馬ごとの単勝人気順とオッズ */
  public async saveKakuteiNinkiOdds(
    buffer: Buffer,
    raceId: number,
    umaban: number,
    ninkiOffset: number,
    oddsOffset: number,
  ) {
    // 単勝人気順とオッズは、異常区分によっては既定値 (0) になる
    const ninki = readPositiveInt(buffer, ninkiOffset, 2);
    const odds1 = this.getOdds(buffer, oddsOffset, 4);
    if (!ninki && !odds1) {
      return;
    }
    const oddsHaitou = new OddsHaitou();
    oddsHaitou.RaceId = raceId;
    oddsHaitou.Kakutei = Kakutei.Kakutei;
    oddsHaitou.Baken = Baken.Tanshou;
    oddsHaitou.Bangou1 = umaban;
    oddsHaitou.Ninki = ninki;
    oddsHaitou.Odds1 = odds1;
    await this.saveOddsHaitou(oddsHaitou);
  }
}
