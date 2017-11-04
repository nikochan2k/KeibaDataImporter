import { Service } from "typedi";
import { Kakutei, Baken } from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { Shussouba } from "../../entities/Shussouba";
import { HaitouInfo, OddsHaitouTool } from "../OddsHaitouTool";
import {
  readDouble,
  readPositiveInt,
  readStr,
} from "../Reader";

@Service()
export class KolOddsHaitouTool extends OddsHaitouTool {

  public async saveKakuteiNinkiOdds(buffer: Buffer, shussouba: Shussouba, ninkiOffset: number, oddsOffset: number) {
    const oddsHaitou = new OddsHaitou();
    oddsHaitou.RaceId = shussouba.RaceId;
    oddsHaitou.Kakutei = Kakutei.Kakutei;
    oddsHaitou.Baken = Baken.Tanshou;
    oddsHaitou.Bangou1 = shussouba.Umaban;
    oddsHaitou.Ninki = readPositiveInt(buffer, ninkiOffset, 2);
    oddsHaitou.Odds1 = readDouble(buffer, oddsOffset, 5, 0.1);
    await this.saveOddsHaitou(oddsHaitou);
  }

  protected getOdds(buffer: Buffer, offset: number, length: number) {
    let odds: number;
    if (readStr(buffer, offset, length) !== "*") {
      odds = readDouble(buffer, offset, length, 0.1);
    } else {
      odds = 10 ** (length - 2);
    }
    return odds;
  }

  public async saveTanshouOdds(buffer: Buffer, offset: number, raceId: number, kakutei: Kakutei) {
    for (let bangou = 1; bangou <= 18; bangou++) {
      const odds1 = this.getOdds(buffer, offset, 5);
      offset += 5;
      if (!odds1) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Kakutei = kakutei;
      oddsHaitou.Baken = Baken.Tanshou;
      oddsHaitou.Bangou1 = bangou;
      oddsHaitou.Odds1 = odds1;
      await this.saveOddsHaitou(oddsHaitou);
    }
  }

  public async saveWakurenOdds(buffer: Buffer, offset: number, raceId: number, kakutei: Kakutei) {
    for (let bangou1 = 1; bangou1 <= 8; bangou1++) {
      for (let bangou2 = 1; bangou2 <= 8; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 5);
        offset += 5;
        if (!odds1) {
          continue;
        }
        const oddsHaitou = new OddsHaitou();
        oddsHaitou.RaceId = raceId;
        oddsHaitou.Kakutei = kakutei;
        oddsHaitou.Baken = Baken.Wakuren;
        oddsHaitou.Bangou1 = bangou1;
        oddsHaitou.Bangou2 = bangou2;
        oddsHaitou.Odds1 = odds1;
        await this.saveOddsHaitou(oddsHaitou);
      }
    }
  }

  public async saveUmarenOdds(buffer: Buffer, offset: number, raceId: number, kakutei: Kakutei) {
    for (let bangou1 = 1; bangou1 <= 17; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 18; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 7);
        offset += 7;
        if (!odds1) {
          continue;
        }
        const oddsHaitou = new OddsHaitou();
        oddsHaitou.RaceId = raceId;
        oddsHaitou.Kakutei = kakutei;
        oddsHaitou.Baken = Baken.Umaren;
        oddsHaitou.Bangou1 = bangou1;
        oddsHaitou.Bangou2 = bangou2;
        oddsHaitou.Odds1 = odds1;
        await this.saveOddsHaitou(oddsHaitou);
      }
    }
  }

  public async saveFukushouOdds(buffer: Buffer, offset: number, raceId: number, kakutei: Kakutei) {
    for (let bangou = 1; bangou <= 18; bangou++) {
      const odds1 = this.getOdds(buffer, offset, 3);
      offset += 3;
      const odds2 = this.getOdds(buffer, offset, 3);
      offset += 3;
      if (!odds1 || !odds2) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Kakutei = kakutei;
      oddsHaitou.Baken = Baken.Fukushou;
      oddsHaitou.Bangou1 = bangou;
      oddsHaitou.Odds1 = odds1;
      oddsHaitou.Odds2 = odds2;
      await this.saveOddsHaitou(oddsHaitou);
    }
  }

  public async saveWideOdds(buffer: Buffer, offset: number, raceId: number, kakutei: Kakutei) {
    for (let bangou1 = 1; bangou1 <= 17; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 18; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 5);
        offset += 5;
        const odds2 = this.getOdds(buffer, offset, 5);
        offset += 5;
        if (!odds1 || !odds2) {
          continue;
        }
        const oddsHaitou = new OddsHaitou();
        oddsHaitou.RaceId = raceId;
        oddsHaitou.Kakutei = kakutei;
        oddsHaitou.Baken = Baken.Wide;
        oddsHaitou.Bangou1 = bangou1;
        oddsHaitou.Bangou2 = bangou2;
        oddsHaitou.Odds1 = odds1;
        await this.saveOddsHaitou(oddsHaitou);
      }
    }
  }

  public async saveUmatanOdds(buffer: Buffer, offset: number, raceId: number, kakutei: Kakutei) {
    for (let bangou1 = 1; bangou1 <= 18; bangou1++) {
      for (let bangou2 = 1; bangou2 <= 18; bangou2++) {
        if (bangou1 === bangou2) {
          continue;
        }
        const odds1 = this.getOdds(buffer, offset, 5);
        offset += 5;
        if (!odds1) {
          continue;
        }
        const oddsHaitou = new OddsHaitou();
        oddsHaitou.RaceId = raceId;
        oddsHaitou.Kakutei = kakutei;
        oddsHaitou.Baken = Baken.Umatan;
        oddsHaitou.Bangou1 = bangou1;
        oddsHaitou.Bangou2 = bangou2;
        oddsHaitou.Odds1 = odds1;
        await this.saveOddsHaitou(oddsHaitou);
      }
    }
  }

  public async saveSanrenpukuOdds(buffer: Buffer, offset: number, raceId: number, kakutei: Kakutei) {
    for (let bangou1 = 1; bangou1 <= 16; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 17; bangou2++) {
        for (let bangou3 = bangou2 + 1; bangou3 <= 18; bangou3++) {
          const odds1 = this.getOdds(buffer, offset, 7);
          offset += 7;
          if (!odds1) {
            continue;
          }
          const oddsHaitou = new OddsHaitou();
          oddsHaitou.RaceId = raceId;
          oddsHaitou.Kakutei = kakutei;
          oddsHaitou.Baken = Baken.Sanrenpuku;
          oddsHaitou.Bangou1 = bangou1;
          oddsHaitou.Bangou2 = bangou2;
          oddsHaitou.Bangou3 = bangou3;
          oddsHaitou.Odds1 = odds1;
          await this.saveOddsHaitou(oddsHaitou);
        }
      }
    }
  }

  public async saveSanrentanOdds(buffer: Buffer, offset: number, raceId: number, kakutei: Kakutei) {
    for (let bangou1 = 1; bangou1 <= 18; bangou1++) {
      for (let bangou2 = 1; bangou2 <= 18; bangou2++) {
        for (let bangou3 = 1; bangou3 <= 18; bangou3++) {
          if (bangou1 === bangou2 || bangou2 === bangou3 || bangou3 === bangou1) {
            continue;
          }
          const odds1 = this.getOdds(buffer, offset, 10);
          offset += 10;
          if (!odds1) {
            continue;
          }
          const oddsHaitou = new OddsHaitou();
          oddsHaitou.RaceId = raceId;
          oddsHaitou.Kakutei = kakutei;
          oddsHaitou.Baken = Baken.Sanrentan;
          oddsHaitou.Bangou1 = bangou1;
          oddsHaitou.Bangou2 = bangou2;
          oddsHaitou.Bangou3 = bangou3;
          oddsHaitou.Odds1 = odds1;
          await this.saveOddsHaitou(oddsHaitou);
        }
      }
    }
  }

  public async saveRaceHaitou(buffer: Buffer, raceId: number, kakutei: Kakutei, infos: HaitouInfo[]) {
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const bangou1 = readPositiveInt(buffer, info.bangou1, info.bangou1Len);
      if (!bangou1) {
        continue;
      }
      let bangou2;
      if (info.bangou2) {
        bangou2 = readPositiveInt(buffer, info.bangou2, info.bangou2Len);
        if (!bangou2 && [Baken.Tanshou, Baken.Fukushou].indexOf(info.baken) === -1) {
          continue;
        }
      }
      let bangou3;
      if (info.bangou3) {
        bangou3 = readPositiveInt(buffer, info.bangou3, info.bangou3Len);
        if (!bangou3 && [Baken.Sanrenpuku, Baken.Sanrentan].indexOf(info.baken) !== -1) {
          continue;
        }
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Kakutei = kakutei;
      oddsHaitou.Baken = Baken.Sanrentan;
      oddsHaitou.Bangou1 = bangou1;
      oddsHaitou.Bangou2 = bangou2;
      oddsHaitou.Bangou3 = bangou3;
      oddsHaitou.Haitoukin = readPositiveInt(buffer, info.haitou, info.haitouLen);
      oddsHaitou.Ninki = (info.ninki ? readPositiveInt(buffer, info.ninki, info.ninkiLen) : undefined);
      await this.saveOddsHaitou(oddsHaitou);
    }
  }
}