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
import { Kyousouba } from "../../entities/Kyousouba";
import { Banushi } from "../../entities/Banushi";
import { Kishu } from "../../entities/Kishu";
import { Shozoku } from "../../entities/Shozoku";
import { Kyuusha } from "../../entities/Kyuusha";
import { Seisansha } from "../../entities/Seisansha";
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


}