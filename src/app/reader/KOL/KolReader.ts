import { EntityManager } from "typeorm";
import { readInt, readPositiveInt, readStr, readStrWithNoSpace } from "../ReadTool";
import { DataSupport } from "../DataSupport";
import { DataReader } from "../DataReader";
import { Kyuusha } from "../../entities/Kyuusha";
import * as $C from "../../converters/Common";
import * as $U from "../../converters/Uma";
import * as $KY from "../../converters/Kyuusha";

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

export abstract class KolReader extends DataReader {

  protected support: DataSupport;

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
    this.support = new DataSupport(this.logger, entityManager);
  }

  protected getRaceId(buffer: Buffer) {
    const yyyymmdd = readPositiveInt(buffer, 12, 8);
    const basho = $C.basho.toCodeFromKol(buffer, 0, 2);
    const raceBangou = readInt(buffer, 10, 2);
    if (yyyymmdd === null || basho === null || raceBangou === null) {
      return null;
    }
    const id = this.support.getRaceId(yyyymmdd, basho, raceBangou);
    return id;
  }

  protected async saveKolBanushi(buffer: Buffer, banushiOffset: BanushiOffset) {
    const banushiMei = this.support.normalizeHoujinMei(buffer, banushiOffset.meishou, 40);
    const tanshukuBanushiMei = this.support.normalizeTanshukuHoujinMei(buffer, banushiOffset.tanshuku, 20);
    return await this.support.saveBanushi(banushiMei, tanshukuBanushiMei);
  }

  protected async saveKolUma(buffer: Buffer, umaOffset: UmaOffset, banushiOffset: BanushiOffset) {
    const bamei = readStr(buffer, umaOffset.meishou, 30);
    let uma = await this.support.getUma(bamei);
    if (!uma.Id) {
      uma.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, umaOffset.umaKigou, 2);
      uma.Seibetsu = $U.seibetsu.toCodeFromKol(buffer, umaOffset.seibetsu, 1);
      uma.Banushi = await this.saveKolBanushi(buffer, banushiOffset);
      uma = await this.entityManager.persist(uma);
    }
    return uma;
  }

  protected async saveKolSeisansha(buffer: Buffer, seisanshaOffset: SeisanshaOffset) {
    const seisanshaMei = this.support.normalizeHoujinMei(buffer, seisanshaOffset.meishou, 40);
    const tanshukuSeisanshaMei = this.support.normalizeTanshukuHoujinMei(buffer, seisanshaOffset.tanshuku, 20);
    return await this.support.saveSeisansha(seisanshaMei, tanshukuSeisanshaMei);
  }

  protected async saveKolKyuusha(buffer: Buffer, kyuushaOffset: KyuushaOffset) {
    const kolKyuushaCode = readPositiveInt(buffer, kyuushaOffset.kolKyuushaCode, 5);
    const kyuushaMei = readStrWithNoSpace(buffer, kyuushaOffset.meishou, 32);
    let kyuusha = await this.getKyuushaWith(kolKyuushaCode, kyuushaMei);
    if (!kyuusha.Id || !kyuusha.KolKyuushaCode || !kyuusha.KyuushaMei) {
      kyuusha.KolKyuushaCode = kolKyuushaCode;
      kyuusha.KyuushaMei = kyuushaMei;
      kyuusha.TanshukuKyuushaMei = readStrWithNoSpace(buffer, kyuushaOffset.tanshuku, 8);
      kyuusha.ShozokuBasho = $C.basho.toCodeFromKol(buffer, kyuushaOffset.shozokuBasho, 2);
      kyuusha.RitsuHokuNanBetsu = $KY.ritsuHokuNanBetsu.toCodeFromKol(buffer, kyuushaOffset.ritsuHokuNanBetsu, 1);
      kyuusha = await this.entityManager.persist(kyuusha);
    }
    return kyuusha;
  }


  protected async getKyuushaWith(kolKyuushaCode?: number, kyuushaMei?: string) {
    let kyuusha: Kyuusha;
    if (kolKyuushaCode) {
      kyuusha = await this.entityManager
        .getRepository(Kyuusha)
        .createQueryBuilder("k")
        .where("k.KolKyuushaCode = :kolKyuushaCode")
        .setParameter("kolKyuushaCode", kolKyuushaCode)
        .getOne();
    }
    if (!kyuusha && kyuushaMei) {
      kyuusha = await this.support.getKyuusha(kyuushaMei);
    }
    if (!kyuusha) {
      kyuusha = new Kyuusha();
      kyuusha.KolKyuushaCode = kolKyuushaCode;
      kyuusha.KyuushaMei = kyuushaMei;
    }
    return kyuusha;
  }

}
