import { Logger } from "log4js";
import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import * as $C from "../../converters/Common";
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
import { Seisansha } from "../../entities/Seisansha";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaTsuukaJuni } from "../../entities/ShussoubaTsuukaJuni";
import { Uma } from "../../entities/Uma";
import { getLogger } from "../../LogUtil";
import { Tool, HaitouInfo } from "../Tool";
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

  @OrmManager()
  private entityManager: EntityManager;

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

  public async saveKishu(buffer: Buffer, offset: number, date: number) {
    const kishu = new Kishu();
    kishu.KolKishuCode = readInt(buffer, offset, 5);
    const kishuMei = readStrWithNoSpace(buffer, offset + 5, 32);
    const tanshukuKishuMei = readStrWithNoSpace(buffer, offset + 37, 8);
    return this.kishuDao.saveKishu(kishu, kishuMei, tanshukuKishuMei);
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
    return this.seisanshaDao.saveSeisansha(seisansha);
  }

  public async saveShozokuKyuusha(buffer: Buffer, offset: number) {
    const kolKyuushaCode = readPositiveInt(buffer, offset, 5);
    if (!kolKyuushaCode) {
      return null;
    }
    let kyuusha = new Kyuusha();
    kyuusha.KolKyuushaCode = kolKyuushaCode;
    kyuusha = await this.kyuushaDao.saveKyuusha(kyuusha);
    return kyuusha.Id;
  }

  public saveKyuusha(buffer: Buffer, offset: number) {
    const kyuushaMei = readStrWithNoSpace(buffer, offset + 5, 32);
    if (!kyuushaMei) {
      return null;
    }
    const kyuusha = new Kyuusha();
    kyuusha.KolKyuushaCode = readPositiveInt(buffer, offset, 5);
    const tanshukuKyuushaMei = readStrWithNoSpace(buffer, offset + 37, 8);
    kyuusha.ShozokuBasho = $C.basho.toCodeFromKol(buffer, offset + 45, 2);
    kyuusha.TouzaiBetsu = $KY.touzaiBetsu.toCodeFromKol(buffer, offset + 47, 1);
    kyuusha.RitsuHokuNanBetsu = $KY.ritsuHokuNanBetsu.toCodeFromKol(buffer, offset + 47, 1);
    return this.kyuushaDao.saveKyuusha(kyuusha, kyuushaMei, tanshukuKyuushaMei);
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
      await this.tool.saveOddsHaitou({
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
  }
}