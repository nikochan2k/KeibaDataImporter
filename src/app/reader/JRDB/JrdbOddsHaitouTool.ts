import * as $C from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { Shussouba } from "../../entities/Shussouba";
import { OddsHaitouTool } from "../OddsHaitouTool";
import { readJikan, readPositiveDouble, readPositiveInt } from "../Reader";

export interface OddsHaitouInfo {
  Kakutei: $C.Kakutei;
  Baken: $C.Baken;
  OddsOffset: number;
  OddsLength: number;
  NinkiOffset?: number;
  HaitoukinOffset?: number;
  /** オッズ取得時刻(HHMM)のオフセット */
  JikanOffset?: number;
}

export class JrdbOddsHaitouTool extends OddsHaitouTool {
  public async saveOddsNinki(buffer: Buffer, shussouba: Shussouba, info: OddsHaitouInfo) {
    const oddsHaitou = new OddsHaitou();
    oddsHaitou.RaceId = shussouba.RaceId;
    oddsHaitou.Kakutei = info.Kakutei;
    oddsHaitou.Baken = info.Baken;
    oddsHaitou.Bangou1 = shussouba.Umaban;
    oddsHaitou.Odds1 = readPositiveDouble(buffer, info.OddsOffset, info.OddsLength);
    oddsHaitou.Haitoukin = info.HaitoukinOffset
      ? readPositiveInt(buffer, info.HaitoukinOffset, 7)
      : undefined;
    oddsHaitou.Ninki = info.NinkiOffset ? readPositiveInt(buffer, info.NinkiOffset, 2) : undefined;
    if (oddsHaitou.Odds1 == null && oddsHaitou.Haitoukin == null && oddsHaitou.Ninki == null) {
      return; // 空白の項目(速報版など)で空の行を作らない
    }
    oddsHaitou.ShutokuJikan = info.JikanOffset ? readJikan(buffer, info.JikanOffset) : undefined;
    await this.saveOddsHaitou(oddsHaitou);
  }
}

export const jrdbOddsHaitouTool = new JrdbOddsHaitouTool();
