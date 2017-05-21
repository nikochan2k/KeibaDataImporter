import { EntityManager } from "typeorm";
import { readPositiveInt, readRaw, readStr, readStrWithNoSpace } from "../ReadTool";
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

  protected async saveKolBanushi(buffer: Buffer, banushiOffset: BanushiOffset) {
    const banushiMei = this.support.normalizeMeishou(buffer, banushiOffset.meishou, 40);
    const tanshukuBanushiMei = this.support.normalizeTanshukuMei(buffer, banushiOffset.tanshuku, 20);
    return await this.support.saveBanushi(banushiMei, tanshukuBanushiMei);
  }

  protected async saveKolUma(buffer: Buffer, umaOffset: UmaOffset, banushiOffset: BanushiOffset) {
    const bamei = readStr(buffer, umaOffset.meishou, 30);
    const uma = await this.support.getUma(bamei);
    if (!uma.Id) {
      uma.UmaKigou = $U.umaKigou.toCodeFromKol(readRaw(buffer, umaOffset.umaKigou, 2));
      uma.Seibetsu = $U.seibetsu.toCodeFromKol(readRaw(buffer, umaOffset.seibetsu, 1));
      uma.Banushi = await this.saveKolBanushi(buffer, banushiOffset);
      await this.entityManager.persist(uma);
    }
    return uma;
  }

  protected async saveKolSeisansha(buffer: Buffer, seisanshaOffset: SeisanshaOffset) {
    const seisanshaMei = this.support.normalizeMeishou(buffer, seisanshaOffset.meishou, 40);
    const tanshukuSeisanshaMei = this.support.normalizeTanshukuMei(buffer, seisanshaOffset.tanshuku, 20);
    return await this.support.saveSeisansha(seisanshaMei, tanshukuSeisanshaMei);
  }

  protected async saveKolKyuusha(buffer: Buffer, kyuushaOffset: KyuushaOffset) {
    const kolKyuushaCode = readPositiveInt(buffer, kyuushaOffset.kolKyuushaCode, 5);
    const kyuushaMei = readStrWithNoSpace(buffer, kyuushaOffset.meishou, 32);
    const kyuusha = await this.getKyuushaWith(kolKyuushaCode, kyuushaMei);
    if (!kyuusha.Id || !kyuusha.KolKyuushaCode || !kyuusha.KyuushaMei) {
      kyuusha.KolKyuushaCode = kolKyuushaCode;
      kyuusha.KyuushaMei = kyuushaMei;
      kyuusha.TanshukuKyuushaMei = readStrWithNoSpace(buffer, kyuushaOffset.tanshuku, 8);
      kyuusha.ShozokuBasho = $C.basho.toCodeFromKol(readRaw(buffer, kyuushaOffset.shozokuBasho, 2));
      kyuusha.RitsuHokuNanBetsu = $KY.ritsuHokuNanBetsu.toCodeFromKol(readRaw(buffer, kyuushaOffset.ritsuHokuNanBetsu, 1));
      await this.entityManager.persist(kyuusha);
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
