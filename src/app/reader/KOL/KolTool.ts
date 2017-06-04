import { Inject, Service } from "typedi";
import * as $C from "../../converters/Common";
import * as $KY from "../../converters/Kyuusha";
import * as $U from "../../converters/Uma";
import { Banushi } from "../../entities/Banushi";
import { Kyuusha } from "../../entities/Kyuusha";
import { Seisansha } from "../../entities/Seisansha";
import { Uma } from "../../entities/Uma";
import { BanushiDao } from "../../daos/BanushiDao";
import { KyuushaDao } from "../../daos/KyuushaDao";
import { SeisanshaDao } from "../../daos/SeisanshaDao";
import { UmaDao } from "../../daos/UmaDao";
import { DataTool } from "../DataTool";
import {
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
} from "../Reader";

interface MeishouOffset {
  meishou: number;
  tanshuku?: number;
}

interface UmaOffset extends MeishouOffset {
  umaKigou: number;
  seibetsu: number;
}

interface BanushiOffset extends MeishouOffset {
}

interface SeisanshaOffset extends MeishouOffset {
}

interface KyuushaOffset extends MeishouOffset {
  kolKyuushaCode: number;
  shozokuBasho: number;
  ritsuHokuNanBetsu: number;
}

@Service()
export class KolTool {

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

  public getRaceId(buffer: Buffer) {
    const yyyymmdd = readPositiveInt(buffer, 12, 8);
    const basho = $C.basho.toCodeFromKol(buffer, 0, 2);
    const raceBangou = readInt(buffer, 10, 2);
    if (yyyymmdd === null || basho === null || raceBangou === null) {
      return null;
    }
    const id = this.tool.getRaceId(yyyymmdd, basho, raceBangou);
    return id;
  }

  public async saveBanushi(buffer: Buffer, banushiOffset: BanushiOffset) {
    const banushi = new Banushi();
    banushi.BanushiMei = this.tool.normalizeHoujinMei(buffer, banushiOffset.meishou, 40);
    banushi.TanshukuBanushiMei = this.tool.normalizeTanshukuHoujinMei(buffer, banushiOffset.tanshuku, 20);
    return await this.banushiDao.saveBanushi(banushi);
  }

  public async saveUma(buffer: Buffer, umaOffset: UmaOffset, banushiOffset: BanushiOffset) {
    const uma = new Uma();
    uma.Bamei = readStr(buffer, umaOffset.meishou, 30);
    uma.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, umaOffset.umaKigou, 2);
    uma.Seibetsu = $U.seibetsu.toCodeFromKol(buffer, umaOffset.seibetsu, 1);
    uma.Banushi = await this.saveBanushi(buffer, banushiOffset);
    return await this.umaDao.saveUma(uma);
  }

  public async saveSeisansha(buffer: Buffer, seisanshaOffset: SeisanshaOffset) {
    const seisansha = new Seisansha();
    seisansha.SeisanshaMei = this.tool.normalizeHoujinMei(buffer, seisanshaOffset.meishou, 40);
    seisansha.TanshukuSeisanshaMei = this.tool.normalizeTanshukuHoujinMei(buffer, seisanshaOffset.tanshuku, 20);
    return await this.seisanshaDao.saveSeisansha(seisansha);
  }

  public async saveKyuusha(buffer: Buffer, kyuushaOffset: KyuushaOffset) {
    const kyuusha = new Kyuusha();
    kyuusha.KolKyuushaCode = readPositiveInt(buffer, kyuushaOffset.kolKyuushaCode, 5);
    kyuusha.KyuushaMei = readStrWithNoSpace(buffer, kyuushaOffset.meishou, 32);
    kyuusha.TanshukuKyuushaMei = readStrWithNoSpace(buffer, kyuushaOffset.tanshuku, 8);
    kyuusha.ShozokuBasho = $C.basho.toCodeFromKol(buffer, kyuushaOffset.shozokuBasho, 2);
    kyuusha.RitsuHokuNanBetsu = $KY.ritsuHokuNanBetsu.toCodeFromKol(buffer, kyuushaOffset.ritsuHokuNanBetsu, 1);
    return await this.kyuushaDao.saveKyuusha(kyuusha);
  }

}