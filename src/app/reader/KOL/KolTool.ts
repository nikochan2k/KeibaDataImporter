import { Logger } from "log4js";
import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import * as $C from "../../converters/Common";
import * as $KI from "../../converters/Kishu";
import * as $KY from "../../converters/Kyuusha";
import * as $U from "../../converters/Uma";
import { BanushiDao } from "../../daos/BanushiDao";
import { KishuDao } from "../../daos/KishuDao";
import { KyuushaDao } from "../../daos/KyuushaDao";
import { SeisanshaDao } from "../../daos/SeisanshaDao";
import { UmaDao } from "../../daos/UmaDao";
import { Banushi } from "../../entities/Banushi";
import { Kishu } from "../../entities/Kishu";
import { Kyousouba } from "../../entities/Kyousouba";
import { Kyuusha } from "../../entities/Kyuusha";
import { Odds } from "../../entities/Odds";
import { Seisansha } from "../../entities/Seisansha";
import { Shozoku } from "../../entities/Shozoku";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaTsuukaJuni } from "../../entities/ShussoubaTsuukaJuni";
import { Uma } from "../../entities/Uma";
import { getLogger } from "../../LogUtil";
import { DataTool } from "../DataTool";
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

  @Inject()
  private tool: DataTool;

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

  public async saveKijou(buffer: Buffer, offset: number, date: Date) {
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
    kyousouba.Id = uma.Id;
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
    return this.seisanshaDao.saveSeisansha(seisansha);
  }

  public saveKyuusha(buffer: Buffer, offset: number) {
    const kyuushaMei = readStrWithNoSpace(buffer, offset + 5, 32);
    if (!kyuushaMei) {
      return null;
    }
    const kyuusha = new Kyuusha();
    kyuusha.KolKyuushaCode = readPositiveInt(buffer, offset, 5);
    kyuusha.KyuushaMei = kyuushaMei;
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

      shussoubaTsuukaJuni.Id = shussouba.Id * 10 + bangou;
      shussoubaTsuukaJuni.ShussoubaId = shussouba.Id;
      shussoubaTsuukaJuni.Bangou = bangou;
      await this.entityManager.save(shussoubaTsuukaJuni);
    }
  }

  protected async deleteOdds(oddsKubunId: number) {
    await this.entityManager
      .createQueryBuilder()
      .delete()
      .from(Odds)
      .where("OddsKubunId =:oddsKubunId")
      .setParameter("oddsKubunId", oddsKubunId)
      .execute();
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

  public async saveTanshouOdds(buffer: Buffer, offset: number, oddsKubunId: number) {
    await this.deleteOdds(oddsKubunId);
    for (let bangou = 1; bangou <= 18; bangou++) {
      const odds1 = this.getOdds(buffer, offset, 5);
      offset += 5;
      if (!odds1) {
        continue;
      }
      const odds = new Odds();
      odds.OddsKubunId = oddsKubunId;
      odds.Bangou1 = bangou;
      odds.Odds1 = odds1;
      await this.entityManager.getRepository(Odds).save(odds);
    }
  }

  public async saveWakurenOdds(buffer: Buffer, offset: number, oddsKubunId: number) {
    await this.deleteOdds(oddsKubunId);
    for (let bangou1 = 1; bangou1 <= 8; bangou1++) {
      for (let bangou2 = 1; bangou2 <= 8; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 5);
        offset += 5;
        if (!odds1) {
          continue;
        }
        const odds = new Odds();
        odds.OddsKubunId = oddsKubunId;
        odds.Bangou1 = bangou1;
        odds.Bangou2 = bangou2;
        odds.Odds1 = odds1;
        await this.entityManager.getRepository(Odds).save(odds);
      }
    }
  }

  public async saveUmarenOdds(buffer: Buffer, offset: number, oddsKubunId: number) {
    await this.deleteOdds(oddsKubunId);
    for (let bangou1 = 1; bangou1 <= 17; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 18; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 7);
        offset += 7;
        if (!odds1) {
          continue;
        }
        const odds = new Odds();
        odds.OddsKubunId = oddsKubunId;
        odds.Bangou1 = bangou1;
        odds.Bangou2 = bangou2;
        odds.Odds1 = odds1;
        await this.entityManager.getRepository(Odds).save(odds);
      }
    }
  }

  public async saveFukushouOdds(buffer: Buffer, offset: number, oddsKubunId: number) {
    await this.deleteOdds(oddsKubunId);
    for (let bangou = 1; bangou <= 18; bangou++) {
      const odds1 = this.getOdds(buffer, offset, 3);
      offset += 3;
      const odds2 = this.getOdds(buffer, offset, 3);
      offset += 3;
      if (!odds1 || !odds2) {
        continue;
      }
      const odds = new Odds();
      odds.OddsKubunId = oddsKubunId;
      odds.Bangou1 = bangou;
      odds.Odds1 = odds1;
      odds.Odds2 = odds2;
      await this.entityManager.getRepository(Odds).save(odds);
    }
  }

  public async saveWideOdds(buffer: Buffer, offset: number, oddsKubunId: number) {
    await this.deleteOdds(oddsKubunId);
    for (let bangou1 = 1; bangou1 <= 17; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 18; bangou2++) {
        const odds1 = this.getOdds(buffer, offset, 5);
        offset += 5;
        const odds2 = this.getOdds(buffer, offset, 5);
        offset += 5;
        if (!odds1 || !odds2) {
          continue;
        }
        const odds = new Odds();
        odds.OddsKubunId = oddsKubunId;
        odds.Bangou1 = bangou1;
        odds.Bangou2 = bangou2;
        odds.Odds1 = odds1;
        odds.Odds2 = odds2;
        await this.entityManager.getRepository(Odds).save(odds);
      }
    }
  }

  public async saveUmatanOdds(buffer: Buffer, offset: number, oddsKubunId: number) {
    await this.deleteOdds(oddsKubunId);
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
        const odds = new Odds();
        odds.OddsKubunId = oddsKubunId;
        odds.Bangou1 = bangou1;
        odds.Bangou2 = bangou2;
        odds.Odds1 = odds1;
        await this.entityManager.getRepository(Odds).save(odds);
      }
    }
  }

  public async saveSanrenpukuOdds(buffer: Buffer, offset: number, oddsKubunId: number) {
    await this.deleteOdds(oddsKubunId);
    for (let bangou1 = 1; bangou1 <= 16; bangou1++) {
      for (let bangou2 = bangou1 + 1; bangou2 <= 17; bangou2++) {
        for (let bangou3 = bangou2 + 1; bangou3 <= 18; bangou3++) {
          const odds1 = this.getOdds(buffer, offset, 7);
          offset += 7;
          if (!odds1) {
            continue;
          }
          const odds = new Odds();
          odds.OddsKubunId = oddsKubunId;
          odds.Bangou1 = bangou1;
          odds.Bangou2 = bangou2;
          odds.Bangou3 = bangou3;
          odds.Odds1 = odds1;
          await this.entityManager.getRepository(Odds).save(odds);
        }
      }
    }
  }

  public async saveSanrentanOdds(buffer: Buffer, offset: number, oddsKubunId: number) {
    await this.deleteOdds(oddsKubunId);
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
          const odds = new Odds();
          odds.OddsKubunId = oddsKubunId;
          odds.Bangou1 = bangou1;
          odds.Bangou2 = bangou2;
          odds.Bangou3 = bangou3;
          odds.Odds1 = odds1;
          await this.entityManager.getRepository(Odds).save(odds);
        }
      }
    }
  }
}