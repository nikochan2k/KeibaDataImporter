import { Logger } from "log4js";
import { Inject, Service } from "typedi";
import * as $C from "../../converters/Common";
import * as $K from "../../converters/Kishu";
import * as $KY from "../../converters/Kyuusha";
import * as $U from "../../converters/Uma";
import { BanushiDao } from "../../daos/BanushiDao";
import { KishuDao } from "../../daos/KishuDao";
import { KyuushaDao } from "../../daos/KyuushaDao";
import { SeisanshaDao } from "../../daos/SeisanshaDao";
import { UmaDao } from "../../daos/UmaDao";
import { Banushi } from "../../entities/Banushi";
import { Kishu } from "../../entities/Kishu";
import { KishuRireki } from "../../entities/KishuRireki";
import { Kyousouba } from "../../entities/Kyousouba";
import { Kyuusha } from "../../entities/Kyuusha";
import { Seisansha } from "../../entities/Seisansha";
import { Uma } from "../../entities/Uma";
import { getLogger } from "../../LogUtil";
import {
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
} from "../Reader";
import { Tool } from "../Tool";

@Service()
export class KolTool {

  protected logger: Logger;

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

  public async saveKishu(buffer: Buffer, offset: number) {
    const kishu = new Kishu();
    kishu.KolKishuCode = readInt(buffer, offset, 5);
    const kishuMei = readStrWithNoSpace(buffer, offset + 5, 32);
    const tanshukuKishuMei = readStrWithNoSpace(buffer, offset + 37, 8);
    return this.kishuDao.saveKishu(kishu, kishuMei, tanshukuKishuMei);
  }

  public async saveKishuRireki(buffer: Buffer, offset: number, kishu: Kishu) {
    const kishuRireki = new KishuRireki();
    kishuRireki.KishuId = kishu.Id;
    kishuRireki.KishuTouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, offset, 1);
    kishuRireki.KishuShozokuBasho = $C.basho.toCodeFromKol(buffer, offset + 1, 2);
    kishuRireki.KishuShozokuKyuushaId = await this.saveShozokuKyuusha(buffer, offset + 3);
    kishuRireki.MinaraiKubun = $K.minaraiKubun.toCodeFromKol(buffer, offset + 8, 1);
    kishuRireki.TourokuMasshouFlag = $C.MasshouFlag.Geneki;
    return this.kishuDao.saveKishuRireki(kishuRireki);
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
    const seibetsu = $U.seibetsu.toCodeFromKol(buffer, offset + 39, 1);
    let uma = new Uma();
    uma.KolUmaCode = readInt(buffer, offset, 7);
    const bamei = readStr(buffer, offset + 7, 30);
    if (this.tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.Seibetsu = seibetsu;
    uma = await this.umaDao.saveUma(uma);
    let kyousouba = new Kyousouba();
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, offset + 37, 2);
    const banushi = await this.saveBanushi(buffer, offset + 42);
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

}