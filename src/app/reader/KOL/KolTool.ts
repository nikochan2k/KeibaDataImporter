import { Logger } from "log4js";
import { Inject, Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmEntityManager, OrmRepository } from "typeorm-typedi-extensions";
import { Baken, YosouKakutei } from "../../converters/Common";
import * as $C from "../../converters/Common";
import * as $KI from "../../converters/Kishu";
import * as $KY from "../../converters/Kyuusha";
import * as $U from "../../converters/Uma";
import { HaitouInfo } from "../../converters/RaceHaitou";
import { BanushiDao } from "../../daos/BanushiDao";
import { KishuDao } from "../../daos/KishuDao";
import { KyuushaDao } from "../../daos/KyuushaDao";
import { SeisanshaDao } from "../../daos/SeisanshaDao";
import { UmaDao } from "../../daos/UmaDao";
import { Banushi } from "../../entities/Banushi";
import { Kishu } from "../../entities/Kishu";
import { Kyousouba } from "../../entities/Kyousouba";
import { Kyuusha } from "../../entities/Kyuusha";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { Seisansha } from "../../entities/Seisansha";
import { Shozoku } from "../../entities/Shozoku";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaTsuukaJuni } from "../../entities/ShussoubaTsuukaJuni";
import { Uma } from "../../entities/Uma";
import { getLogger } from "../../LogUtil";
import { Tool } from "../Tool";
import {
  readDouble,
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
} from "../Reader";

@Service()
export class KolTool {

  private logger: Logger;

  @OrmEntityManager()
  private entityManager: EntityManager;

  @OrmRepository(OddsHaitou)
  private oddsHaitouRepository: Repository<OddsHaitou>;

  @Inject()
  private tool: Tool;

  @Inject()
  private kyuushaDao: KyuushaDao;

  @Inject()
  private seisanshaDao: SeisanshaDao;

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private banushiDao: BanushiDao;

  @Inject()
  private kishuDao: KishuDao;

  constructor() {
    this.logger = getLogger(this);
  }

  public async saveKijou(buffer: Buffer, offset: number, date: number) {
    const kishu = new Kishu();
    kishu.FromDate = date;
    kishu.ToDate = date;
    kishu.KolKishuCode = readInt(buffer, offset, 5);
    kishu.KishuMei = readStrWithNoSpace(buffer, offset + 5, 32);
    kishu.TanshukuKishuMei = readStrWithNoSpace(buffer, offset + 37, 8);
    const shozoku = new Shozoku();
    shozoku.TouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, offset + 45, 1);
    shozoku.ShozokuBasho = $C.basho.toCodeFromKol(buffer, offset + 46, 2);
    const kyuushaCode = readPositiveInt(buffer, offset + 48, 5);
    if (kyuushaCode) {
      let kyuusha = new Kyuusha();
      kyuusha.KolKyuushaCode = kyuushaCode;
      kyuusha = await this.kyuushaDao.saveKyuusha(kyuusha);
      shozoku.KyuushaId = kyuusha.Id;
    }
    const minaraiKubun = $KI.minaraiKubun.toCodeFromKol(buffer, offset + 53, 1);
    return this.kishuDao.saveKijou(kishu, shozoku, minaraiKubun);
  }

  public saveBanushi(buffer: Buffer, offset: number) {
    const banushiMei = this.tool.normalizeHoujinMei(buffer, offset, 40);
    if (!banushiMei) {
      return null;
    }
    const banushi = new Banushi();
    banushi.BanushiMei = banushiMei;
    banushi.TanshukuBanushiMei = this.tool.normalizeTanshukuHoujinMei(buffer, offset + 40, 20);
    return this.banushiDao.save(banushi);
  }

  public async saveKyousouba(buffer: Buffer, offset: number, kyuusha: Kyuusha) {
    const seibetsu = $U.seibetsu.toCodeFromKol(buffer, offset + 32, 1);
    let uma = new Uma();
    uma.Bamei = readStr(buffer, offset, 30);
    uma.Seibetsu = seibetsu;
    uma = await this.umaDao.saveUma(uma);
    let kyousouba = new Kyousouba();
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, offset + 30, 2);
    const banushi = await this.saveBanushi(buffer, offset + 35);
    kyousouba.BanushiId = banushi && banushi.Id;
    kyousouba.KyuushaId = kyuusha && kyuusha.Id;
    kyousouba = await this.umaDao.saveKyousouba(kyousouba);
    return { Kyousouba: kyousouba, Uma: uma };
  }

  public saveSeisansha(buffer: Buffer, offset: number) {
    const seisanshaMei = this.tool.normalizeHoujinMei(buffer, offset, 40);
    if (!seisanshaMei) {
      return null;
    }
    const seisansha = new Seisansha();
    seisansha.SeisanshaMei = seisanshaMei;
    seisansha.TanshukuSeisanshaMei = this.tool.normalizeTanshukuHoujinMei(buffer, offset + 40, 20);
    if (!seisansha.TanshukuSeisanshaMei) {
      seisansha.TanshukuSeisanshaMei = seisanshaMei;
    }
    return this.seisanshaDao.saveSeisansha(seisansha);
  }

  public saveKyuusha(buffer: Buffer, offset: number) {
    const kyuusha = new Kyuusha();
    kyuusha.KolKyuushaCode = readPositiveInt(buffer, offset, 5);
    kyuusha.KyuushaMei = readStrWithNoSpace(buffer, offset + 5, 32);
    kyuusha.TanshukuKyuushaMei = readStrWithNoSpace(buffer, offset + 37, 8);
    kyuusha.ShozokuBasho = $C.basho.toCodeFromKol(buffer, offset + 45, 2);
    kyuusha.RitsuHokuNanBetsu = $KY.ritsuHokuNanBetsu.toCodeFromKol(buffer, offset + 47, 1);
    return this.kyuushaDao.saveKyuusha(kyuusha);
  }

  public getTimeSa(buffer: Buffer, offset: number) {
    const timeSa = readDouble(buffer, offset, 3, 0.1);
    if (99.8 <= timeSa) {
      return 0.0;
    }
    return timeSa;
  }

  public async saveShussoubaTsuukaJuni(buffer: Buffer, offset: number, shussouba: Shussouba) {
    for (let bangou = 1; bangou <= 4; bangou++ , offset += 2) {
      const shussoubaTsuukaJuni = new ShussoubaTsuukaJuni();

      const juni = readPositiveInt(buffer, offset, 2);
      if (juni === null) {
        continue;
      }
      if (1 <= juni && juni <= 28) {
        shussoubaTsuukaJuni.Juni = juni;
      } else if (juni === 31 || juni === 32) {
        shussoubaTsuukaJuni.Joukyou = juni;
      } else if (41 <= juni && juni <= 68) {
        shussoubaTsuukaJuni.Juni = juni - 40;
        shussoubaTsuukaJuni.Joukyou = 40;
      } else {
        this.logger.warn("不正な順位: " + juni);
        continue;
      }

      shussoubaTsuukaJuni.Id = shussouba.Id * (2 ** 3) + bangou;
      shussoubaTsuukaJuni.ShussoubaId = shussouba.Id;
      shussoubaTsuukaJuni.Bangou = bangou;
      await this.entityManager.save(shussoubaTsuukaJuni);
    }
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

  public getOddsHaitou(raceId: number, baken: Baken, bangou1: number, bangou2?: number, bangou3?: number) {
    const id = this.getOddsHaitouId(raceId, baken, bangou1, bangou2, bangou3);
    return this.entityManager
      .getRepository(OddsHaitou)
      .findOneById(id);
  }

  public getOddsHaitouId(raceId: number, baken: Baken, bangou1: number, bangou2?: number, bangou3?: number) {
    bangou2 = bangou2 || 0;
    bangou3 = bangou3 || 0;
    const id = raceId * (2 ** (4 + 5 + 5 + 5)) + baken * (2 ** (5 + 5 + 5))
      + bangou1 * (2 ** (5 + 5)) + bangou2 * (2 ** 5) + bangou3;
    return id;
  }

  public createOddsHaitou(raceId: number, baken: Baken, bangou1: number, bangou2?: number, bangou3?: number) {
    const oddsHaitou = new OddsHaitou();
    oddsHaitou.Id = this.getOddsHaitouId(raceId, Baken.Tanshou, bangou1, bangou2, bangou3);
    oddsHaitou.RaceId = raceId;
    oddsHaitou.Baken = baken;
    oddsHaitou.Bangou1 = bangou1;
    oddsHaitou.Bangou2 = bangou2;
    oddsHaitou.Bangou3 = bangou3;
    return oddsHaitou;
  }

  public async saveTanshouOdds(buffer: Buffer, offset: number, raceId: number, yosouKakutei: YosouKakutei) {
    for (let bangou = 1; bangou <= 18; bangou++) {
      const odds1 = this.getOdds(buffer, offset, 5);
      offset += 5;
      if (!odds1) {
        continue;
      }
      let oddsHaitou = await this.getOddsHaitou(raceId, Baken.Tanshou, bangou);
      if (oddsHaitou) {
        if (oddsHaitou.YosouKakutei === YosouKakutei.Kakutei) {
          continue;
        }
      } else {
        oddsHaitou = this.createOddsHaitou(raceId, Baken.Tanshou, bangou);
      }
      oddsHaitou.YosouKakutei = yosouKakutei;
      oddsHaitou.Odds1 = odds1;
      await this.oddsHaitouRepository.save(oddsHaitou);
    }
  }

  public async saveWakurenOdds(buffer: Buffer, offset: number, raceId: number, yosouKakutei: YosouKakutei) {
    for (let bangou1 = 1; bangou1 <= 8; bangou1++) {
      for (let bangou2 = 1; bangou2 <= 8; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 5);
        offset += 5;
        if (!odds1) {
          continue;
        }
        let oddsHaitou = await this.getOddsHaitou(raceId, Baken.Wakuren, bangou1, bangou2);
        if (oddsHaitou) {
          if (oddsHaitou.YosouKakutei === YosouKakutei.Kakutei) {
            continue;
          }
        } else {
          oddsHaitou = this.createOddsHaitou(raceId, Baken.Wakuren, bangou1, bangou2);
        }
        oddsHaitou.YosouKakutei = yosouKakutei;
        oddsHaitou.Odds1 = odds1;
        await this.oddsHaitouRepository.save(oddsHaitou);
      }
    }
  }

  public async saveUmarenOdds(buffer: Buffer, offset: number, raceId: number, yosouKakutei: YosouKakutei) {
    for (let bangou1 = 1; bangou1 <= 17; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 18; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 7);
        offset += 7;
        if (!odds1) {
          continue;
        }
        let oddsHaitou = await this.getOddsHaitou(raceId, Baken.Umaren, bangou1, bangou2);
        if (oddsHaitou) {
          if (oddsHaitou.YosouKakutei === YosouKakutei.Kakutei) {
            continue;
          }
        } else {
          oddsHaitou = this.createOddsHaitou(raceId, Baken.Umaren, bangou1, bangou2);
        }
        oddsHaitou.YosouKakutei = yosouKakutei;
        oddsHaitou.Odds1 = odds1;
        await this.oddsHaitouRepository.save(oddsHaitou);
      }
    }
  }

  public async saveFukushouOdds(buffer: Buffer, offset: number, raceId: number, yosouKakutei: YosouKakutei) {
    for (let bangou = 1; bangou <= 18; bangou++) {
      const odds1 = this.getOdds(buffer, offset, 3);
      offset += 3;
      const odds2 = this.getOdds(buffer, offset, 3);
      offset += 3;
      if (!odds1 || !odds2) {
        continue;
      }
      let oddsHaitou = await this.getOddsHaitou(raceId, Baken.Fukushou, bangou);
      if (oddsHaitou) {
        if (oddsHaitou.YosouKakutei === YosouKakutei.Kakutei) {
          continue;
        }
      } else {
        oddsHaitou = this.createOddsHaitou(raceId, Baken.Fukushou, bangou);
      }
      oddsHaitou.YosouKakutei = yosouKakutei;
      oddsHaitou.Odds1 = odds1;
      oddsHaitou.Odds2 = odds2;
      await this.oddsHaitouRepository.save(oddsHaitou);
    }
  }

  public async saveWideOdds(buffer: Buffer, offset: number, raceId: number, yosouKakutei: YosouKakutei) {
    for (let bangou1 = 1; bangou1 <= 17; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 18; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 5);
        offset += 5;
        const odds2 = this.getOdds(buffer, offset, 5);
        offset += 5;
        if (!odds1 || !odds2) {
          continue;
        }
        let oddsHaitou = await this.getOddsHaitou(raceId, Baken.Wide, bangou1, bangou2);
        if (oddsHaitou) {
          if (oddsHaitou.YosouKakutei === YosouKakutei.Kakutei) {
            continue;
          }
        } else {
          oddsHaitou = this.createOddsHaitou(raceId, Baken.Wide, bangou1, bangou2);
        }
        oddsHaitou.YosouKakutei = yosouKakutei;
        oddsHaitou.Odds1 = odds1;
        oddsHaitou.Odds2 = odds2;
        await this.oddsHaitouRepository.save(oddsHaitou);
      }
    }
  }

  public async saveUmatanOdds(buffer: Buffer, offset: number, raceId: number, yosouKakutei: YosouKakutei) {
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
        let oddsHaitou = await this.getOddsHaitou(raceId, Baken.Umatan, bangou1, bangou2);
        if (oddsHaitou) {
          if (oddsHaitou.YosouKakutei === YosouKakutei.Kakutei) {
            continue;
          }
        } else {
          oddsHaitou = this.createOddsHaitou(raceId, Baken.Umatan, bangou1, bangou2);
        }
        oddsHaitou.YosouKakutei = yosouKakutei;
        oddsHaitou.Odds1 = odds1;
        await this.oddsHaitouRepository.save(oddsHaitou);
      }
    }
  }

  public async saveSanrenpukuOdds(buffer: Buffer, offset: number, raceId: number, yosouKakutei: YosouKakutei) {
    for (let bangou1 = 1; bangou1 <= 16; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 17; bangou2++) {
        for (let bangou3 = bangou2 + 1; bangou3 <= 18; bangou3++) {
          const odds1 = this.getOdds(buffer, offset, 7);
          offset += 7;
          if (!odds1) {
            continue;
          }
          let oddsHaitou = await this.getOddsHaitou(raceId, Baken.Sanrenpuku, bangou1, bangou2, bangou3);
          if (oddsHaitou) {
            if (oddsHaitou.YosouKakutei === YosouKakutei.Kakutei) {
              continue;
            }
          } else {
            oddsHaitou = this.createOddsHaitou(raceId, Baken.Sanrenpuku, bangou1, bangou2, bangou3);
          }
          oddsHaitou.YosouKakutei = yosouKakutei;
          oddsHaitou.Odds1 = odds1;
          await this.oddsHaitouRepository.save(oddsHaitou);
        }
      }
    }
  }

  public async saveSanrentanOdds(buffer: Buffer, offset: number, raceId: number, yosouKakutei: YosouKakutei) {
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
          let oddsHaitou = await this.getOddsHaitou(raceId, Baken.Sanrentan, bangou1, bangou2, bangou3);
          if (oddsHaitou) {
            if (oddsHaitou.YosouKakutei === YosouKakutei.Kakutei) {
              continue;
            }
          } else {
            oddsHaitou = this.createOddsHaitou(raceId, Baken.Sanrentan, bangou1, bangou2, bangou3);
          }
          oddsHaitou.YosouKakutei = yosouKakutei;
          oddsHaitou.Odds1 = odds1;
          await this.oddsHaitouRepository.save(oddsHaitou);
        }
      }
    }
  }

  public async saveRaceHaitou(buffer: Buffer, raceId: number, infos: HaitouInfo[]) {
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
      let oddsHaitou = await this.getOddsHaitou(raceId, info.baken, bangou1, bangou2, bangou3);
      if (oddsHaitou) {
        if (oddsHaitou.Haitoukin) {
          continue;
        }
      } else {
        oddsHaitou = this.createOddsHaitou(raceId, info.baken, bangou1, bangou2, bangou3);
      }
      oddsHaitou.Haitoukin = readPositiveInt(buffer, info.haitou, info.haitouLen);
      if (info.ninki) {
        oddsHaitou.Ninki = readPositiveInt(buffer, info.ninki, info.ninkiLen);
      }
      await this.oddsHaitouRepository.save(oddsHaitou);
    }
  }
}