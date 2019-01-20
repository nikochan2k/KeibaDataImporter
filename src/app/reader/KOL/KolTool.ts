import { Inject, Service } from "typedi";
import * as $KY from "../../converters/Choukyoushi";
import * as $C from "../../converters/Common";
import * as $U from "../../converters/Uma";
import { BanushiDao } from "../../daos/BanushiDao";
import { ChoukyoushiDao } from "../../daos/ChoukyoushiDao";
import { KishuDao } from "../../daos/KishuDao";
import { SeisanshaDao } from "../../daos/SeisanshaDao";
import { UmaDao } from "../../daos/UmaDao";
import { Choukyoushi } from "../../entities/Choukyoushi";
import { Kishu } from "../../entities/Kishu";
import { Kyousouba } from "../../entities/Kyousouba";
import { MeishouKubun } from "../../entities/Shoyuu";
import { Uma } from "../../entities/Uma";
import {
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
} from "../Reader";
import { Tool } from "../Tool";

@Service()
export class KolTool {

  @Inject()
  private tool: Tool;

  @Inject()
  private choukyoushiDao: ChoukyoushiDao;

  @Inject()
  private seisanshaDao: SeisanshaDao;

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private banushiDao: BanushiDao;

  @Inject()
  private kishuDao: KishuDao;

  public async saveKishu(buffer: Buffer, offset: number) {
    const kishu = new Kishu();
    kishu.KolKishuCode = readInt(buffer, offset, 5);
    const kishuMei = readStrWithNoSpace(buffer, offset + 5, 32);
    const tanshukuKishuMei = readStrWithNoSpace(buffer, offset + 37, 8);
    return this.kishuDao.saveKishu(kishu, kishuMei, tanshukuKishuMei);
  }

  public async saveBanushi(buffer: Buffer, offset: number, shussoubaId: number) {
    const banushiMei = this.tool.normalizeHoujinMei(buffer, offset, 40);
    if (banushiMei) {
      await this.banushiDao.save(shussoubaId, MeishouKubun.Full, banushiMei);
    }
    const tanshukuBanushiMei = this.tool.normalizeTanshukuHoujinMei(buffer, offset + 40, 20);
    if (tanshukuBanushiMei) {
      await this.banushiDao.save(shussoubaId, MeishouKubun.Tanshuku, tanshukuBanushiMei);
    }
  }

  public async saveKyousouba(buffer: Buffer, offset: number, choukyoushi: Choukyoushi) {
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
    kyousouba.ChoukyoushiId = choukyoushi && choukyoushi.Id;
    kyousouba = await this.umaDao.saveKyousouba(kyousouba);
    return { Kyousouba: kyousouba, Uma: uma };
  }

  public async saveSeisansha(buffer: Buffer, offset: number, umaId: number) {
    const seisanshaMei = this.tool.normalizeHoujinMei(buffer, offset, 40);
    if (seisanshaMei) {
      await this.seisanshaDao.save(umaId, MeishouKubun.Full, seisanshaMei);
    }
    const tanshukuSeisanshaMei = this.tool.normalizeTanshukuHoujinMei(buffer, offset + 40, 20);
    if (tanshukuSeisanshaMei) {
      await this.seisanshaDao.save(umaId, MeishouKubun.Tanshuku, tanshukuSeisanshaMei);
    }
  }

  public async saveShozokuChoukyoushi(buffer: Buffer, offset: number) {
    const kolKyuushaCode = readPositiveInt(buffer, offset, 5);
    if (!kolKyuushaCode) {
      return null;
    }
    let choukyoushi = new Choukyoushi();
    choukyoushi.KolKyuushaCode = kolKyuushaCode;
    choukyoushi = await this.choukyoushiDao.saveChoukyoushi(choukyoushi);
    return choukyoushi.Id;
  }

  public saveChoukyoushi(buffer: Buffer, offset: number) {
    const choukyoushiMei = readStrWithNoSpace(buffer, offset + 5, 32);
    if (!choukyoushiMei) {
      return null;
    }
    const choukyoushi = new Choukyoushi();
    const kolKyuushaCode = readPositiveInt(buffer, offset, 5);
    choukyoushi.KolKyuushaCode = kolKyuushaCode;
    const tanshuku = readStrWithNoSpace(buffer, offset + 37, 8);
    choukyoushi.ShozokuBasho = $C.basho.toCodeFromKol(buffer, offset + 45, 2);
    choukyoushi.TouzaiBetsu = $KY.touzaiBetsu.toCodeFromKol(buffer, offset + 47, 1);
    choukyoushi.RitsuHokuNanBetsu = $KY.ritsuHokuNanBetsu.toCodeFromKol(buffer, offset + 47, 1);
    return this.choukyoushiDao.saveChoukyoushi(choukyoushi, choukyoushiMei, tanshuku);
  }

}