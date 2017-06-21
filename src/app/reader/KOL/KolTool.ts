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
import { KyousoubaRireki } from "../../entities/KyousoubaRireki";
import { Kishu } from "../../entities/Kishu";
import { KishuShozoku } from "../../entities/KishuShozoku";
import { Kyuusha } from "../../entities/Kyuusha";
import { Race } from "../../entities/Race";
import { Seisansha } from "../../entities/Seisansha";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaTsuukaJuni } from "../../entities/ShussoubaTsuukaJuni";
import { Uma } from "../../entities/Uma";
import { getLogger } from "../../LogUtil";
import { DataTool } from "../DataTool";
import {
  readDate,
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

  public async getRace(buffer: Buffer) {
    const yyyymmdd = readPositiveInt(buffer, 12, 8);
    const basho = $C.basho.toCodeFromKol(buffer, 0, 2);
    const raceBangou = readInt(buffer, 10, 2);
    if (yyyymmdd === null || basho === null || raceBangou === null) {
      return null;
    }
    const id = this.tool.getRaceId(yyyymmdd, basho, raceBangou);
    let race = await this.entityManager.getRepository(Race).findOneById(id);
    if (!race) {
      race = new Race();
      race.Id = id;
      race.Basho = basho;
      race.Nen = readPositiveInt(buffer, 2, 4);
      race.Kaiji = readPositiveInt(buffer, 6, 2);
      race.Nichiji = readPositiveInt(buffer, 8, 2);
      race.RaceBangou = raceBangou;
      race.Nengappi = readDate(buffer, 12, 8);
    }
    return race;
  }

  public async saveKijouKishu(buffer: Buffer, offset: number, date: Date) {
    const kishu = new Kishu();
    kishu.FromDate = date;
    kishu.ToDate = date;
    kishu.KolKishuCode = readInt(buffer, offset, 5);
    kishu.KishuMei = readStrWithNoSpace(buffer, offset + 5, 32);
    kishu.TanshukuKishuMei = readStrWithNoSpace(buffer, offset + 37, 8);
    const kishuShozoku = new KishuShozoku();
    kishuShozoku.TouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, offset + 45, 1);
    kishuShozoku.ShozokuBasho = $C.basho.toCodeFromKol(buffer, offset + 46, 2);
    const kyuushaCode = readPositiveInt(buffer, offset + 48, 5);
    if (kyuushaCode) {
      let kyuusha = new Kyuusha();
      kyuusha.KolKyuushaCode = kyuushaCode;
      kyuusha = await this.kyuushaDao.saveKyuusha(kyuusha);
      kishuShozoku.Kyuusha = kyuusha;
    }
    const minaraiKubun = $KI.minaraiKubun.toCodeFromKol(buffer, offset + 53, 1);
    return this.kishuDao.saveKijouKishu(kishu, kishuShozoku, minaraiKubun);
  }

  public saveBanushi(buffer: Buffer, offset: number) {
    const banushi = new Banushi();
    banushi.BanushiMei = this.tool.normalizeHoujinMei(buffer, offset, 40);
    banushi.TanshukuBanushiMei = this.tool.normalizeTanshukuHoujinMei(buffer, offset + 40, 20);
    return this.banushiDao.saveBanushi(banushi);
  }

  public async saveKyousouba(buffer: Buffer, offset: number, kyuusha: Kyuusha) {
    const uma = new Uma();
    uma.Bamei = readStr(buffer, offset, 30);
    uma.Seibetsu = $U.seibetsu.toCodeFromKol(buffer, offset + 32, 1);
    const kyousoubaRireki = new KyousoubaRireki();
    kyousoubaRireki.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, offset + 30, 2);
    kyousoubaRireki.Banushi = await this.saveBanushi(buffer, offset + 35);
    kyousoubaRireki.Kyuusha = kyuusha;
    return this.umaDao.saveKyousouba(uma, kyousoubaRireki);
  }

  public saveSeisansha(buffer: Buffer, offset: number) {
    const seisansha = new Seisansha();
    seisansha.SeisanshaMei = this.tool.normalizeHoujinMei(buffer, offset, 40);
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
      shussoubaTsuukaJuni.Shussouba = shussouba;
      shussoubaTsuukaJuni.Bangou = bangou;
      await this.entityManager.persist(shussoubaTsuukaJuni);
    }
  }


}