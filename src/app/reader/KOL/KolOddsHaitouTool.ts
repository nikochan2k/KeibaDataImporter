import { Service } from "typedi";
import * as $C from "../../converters/Common";
import { Shussouba } from "../../entities/Shussouba";
import { HaitouInfo, OddsHaitouTool } from "../OddsHaitouTool";
import {
  readDouble,
  readPositiveInt,
  readStr,
} from "../Reader";

@Service()
export class KolOddsHaitouTool extends OddsHaitouTool {

  public async saveNinkiOdds(buffer: Buffer, shussouba: Shussouba, ninkiOffset: number, oddsOffset: number) {
    await this.saveOddsHaitou({
      RaceId: shussouba.RaceId,
      Kakutei: $C.Kakutei.Kakutei,
      Baken: $C.Baken.Tanshou,
      Bangou1: shussouba.Umaban,
      Ninki: readPositiveInt(buffer, ninkiOffset, 2),
      Odds1: readDouble(buffer, oddsOffset, 5, 0.1)
    });
  }

  protected getOdds(buffer: Buffer, offset: number, length: number) {
    let odds: number;
    if (readStr(buffer, offset, length) !== "*") {
      odds = readDouble(buffer, offset, length, 0.1);
    } else {
      odds = 10 ** length;
    }
    return odds;
  }

  public async saveTanshouOdds(buffer: Buffer, offset: number, raceId: number, kakutei: $C.Kakutei) {
    for (let bangou = 1; bangou <= 18; bangou++) {
      const odds1 = this.getOdds(buffer, offset, 5);
      offset += 5;
      if (!odds1) {
        continue;
      }
      await this.saveOddsHaitou({
        RaceId: raceId,
        Kakutei: kakutei,
        Baken: $C.Baken.Tanshou,
        Bangou1: bangou,
        Odds1: odds1
      });
    }
  }

  public async saveWakurenOdds(buffer: Buffer, offset: number, raceId: number, kakutei: $C.Kakutei) {
    for (let bangou1 = 1; bangou1 <= 8; bangou1++) {
      for (let bangou2 = 1; bangou2 <= 8; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 5);
        offset += 5;
        if (!odds1) {
          continue;
        }
        await this.saveOddsHaitou({
          RaceId: raceId,
          Kakutei: kakutei,
          Baken: $C.Baken.Wakuren,
          Bangou1: bangou1,
          Bangou2: bangou2,
          Odds1: odds1
        });
      }
    }
  }

  public async saveUmarenOdds(buffer: Buffer, offset: number, raceId: number, kakutei: $C.Kakutei) {
    for (let bangou1 = 1; bangou1 <= 17; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 18; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 7);
        offset += 7;
        if (!odds1) {
          continue;
        }
        await this.saveOddsHaitou({
          RaceId: raceId,
          Kakutei: kakutei,
          Baken: $C.Baken.Umaren,
          Bangou1: bangou1,
          Bangou2: bangou2,
          Odds1: odds1
        });
      }
    }
  }

  public async saveFukushouOdds(buffer: Buffer, offset: number, raceId: number, kakutei: $C.Kakutei) {
    for (let bangou = 1; bangou <= 18; bangou++) {
      const odds1 = this.getOdds(buffer, offset, 3);
      offset += 3;
      const odds2 = this.getOdds(buffer, offset, 3);
      offset += 3;
      if (!odds1 || !odds2) {
        continue;
      }
      await this.saveOddsHaitou({
        RaceId: raceId,
        Kakutei: kakutei,
        Baken: $C.Baken.Fukushou,
        Bangou1: bangou,
        Odds1: odds1,
        Odds2: odds2
      });
    }
  }

  public async saveWideOdds(buffer: Buffer, offset: number, raceId: number, kakutei: $C.Kakutei) {
    for (let bangou1 = 1; bangou1 <= 17; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 18; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 5);
        offset += 5;
        const odds2 = this.getOdds(buffer, offset, 5);
        offset += 5;
        if (!odds1 || !odds2) {
          continue;
        }
        await this.saveOddsHaitou({
          RaceId: raceId,
          Kakutei: kakutei,
          Baken: $C.Baken.Wide,
          Bangou1: bangou1,
          Bangou2: bangou2,
          Odds1: odds1,
          Odds2: odds2
        });
      }
    }
  }

  public async saveUmatanOdds(buffer: Buffer, offset: number, raceId: number, kakutei: $C.Kakutei) {
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
        await this.saveOddsHaitou({
          RaceId: raceId,
          Kakutei: kakutei,
          Baken: $C.Baken.Umatan,
          Bangou1: bangou1,
          Bangou2: bangou2,
          Odds1: odds1
        });
      }
    }
  }

  public async saveSanrenpukuOdds(buffer: Buffer, offset: number, raceId: number, kakutei: $C.Kakutei) {
    for (let bangou1 = 1; bangou1 <= 16; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 17; bangou2++) {
        for (let bangou3 = bangou2 + 1; bangou3 <= 18; bangou3++) {
          const odds1 = this.getOdds(buffer, offset, 7);
          offset += 7;
          if (!odds1) {
            continue;
          }
          await this.saveOddsHaitou({
            RaceId: raceId,
            Kakutei: kakutei,
            Baken: $C.Baken.Sanrenpuku,
            Bangou1: bangou1,
            Bangou2: bangou2,
            Bangou3: bangou3,
            Odds1: odds1
          });
        }
      }
    }
  }

  public async saveSanrentanOdds(buffer: Buffer, offset: number, raceId: number, kakutei: $C.Kakutei) {
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
          await this.saveOddsHaitou({
            RaceId: raceId,
            Kakutei: kakutei,
            Baken: $C.Baken.Sanrentan,
            Bangou1: bangou1,
            Bangou2: bangou2,
            Bangou3: bangou3,
            Odds1: odds1
          });
        }
      }
    }
  }

  public async saveRaceHaitou(buffer: Buffer, raceId: number, kakutei: $C.Kakutei, infos: HaitouInfo[]) {
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const bangou1 = readPositiveInt(buffer, info.bangou1, info.bangou1Len);
      if (!bangou1) {
        continue;
      }
      let bangou2;
      if (info.bangou2) {
        bangou2 = readPositiveInt(buffer, info.bangou2, info.bangou2Len);
        if (!bangou2 && [$C.Baken.Tanshou, $C.Baken.Fukushou].indexOf(info.baken) === -1) {
          continue;
        }
      }
      let bangou3;
      if (info.bangou3) {
        bangou3 = readPositiveInt(buffer, info.bangou3, info.bangou3Len);
        if (!bangou3 && [$C.Baken.Sanrenpuku, $C.Baken.Sanrentan].indexOf(info.baken) !== -1) {
          continue;
        }
      }
      await this.saveOddsHaitou({
        RaceId: raceId,
        Kakutei: kakutei,
        Baken: info.baken,
        Bangou1: bangou1,
        Bangou2: bangou2,
        Bangou3: bangou3,
        Haitoukin: readPositiveInt(buffer, info.haitou, info.haitouLen),
        Ninki: (info.ninki ? readPositiveInt(buffer, info.ninki, info.ninkiLen) : undefined),
      });
    }
  }}