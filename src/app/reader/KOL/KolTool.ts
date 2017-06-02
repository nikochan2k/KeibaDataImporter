import { Service, Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager} from "typeorm-typedi-extensions";
import { readInt, readPositiveInt, readStr, readStrWithNoSpace } from "../Reader";
import { DataTool } from "../DataTool";
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

@Service()
export class KolTool {

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: DataTool;

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
    const banushiMei = this.tool.normalizeHoujinMei(buffer, banushiOffset.meishou, 40);
    const tanshukuBanushiMei = this.tool.normalizeTanshukuHoujinMei(buffer, banushiOffset.tanshuku, 20);
    return await this.tool.saveBanushi(banushiMei, tanshukuBanushiMei);
  }

  public async saveUma(buffer: Buffer, umaOffset: UmaOffset, banushiOffset: BanushiOffset) {
    const bamei = readStr(buffer, umaOffset.meishou, 30);
    let uma = await this.tool.getUma(bamei);
    if (!uma.Id) {
      uma.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, umaOffset.umaKigou, 2);
      uma.Seibetsu = $U.seibetsu.toCodeFromKol(buffer, umaOffset.seibetsu, 1);
      uma.Banushi = await this.saveBanushi(buffer, banushiOffset);
      uma = await this.entityManager.persist(uma);
    }
    return uma;
  }

  public async saveSeisansha(buffer: Buffer, seisanshaOffset: SeisanshaOffset) {
    const seisanshaMei = this.tool.normalizeHoujinMei(buffer, seisanshaOffset.meishou, 40);
    const tanshukuSeisanshaMei = this.tool.normalizeTanshukuHoujinMei(buffer, seisanshaOffset.tanshuku, 20);
    return await this.tool.saveSeisansha(seisanshaMei, tanshukuSeisanshaMei);
  }

  public async saveKyuusha(buffer: Buffer, kyuushaOffset: KyuushaOffset) {
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


  public async getKyuushaWith(kolKyuushaCode?: number, kyuushaMei?: string) {
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
      kyuusha = await this.tool.getKyuusha(kyuushaMei);
    }
    if (!kyuusha) {
      kyuusha = new Kyuusha();
      kyuusha.KolKyuushaCode = kolKyuushaCode;
      kyuusha.KyuushaMei = kyuushaMei;
    }
    return kyuusha;
  }

}