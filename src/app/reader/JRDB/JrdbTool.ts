import { Service, Inject } from "typedi";
import { Kishu } from "../../entities/Kishu";
import { Kyuusha } from "../../entities/Kyuusha";
import { Uma } from "../../entities/Uma";
import { Banushi } from "../../entities/Banushi";
import { Kyousouba } from "../../entities/Kyousouba";
import {
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
} from "../Reader";
import * as $KY from "../../converters/Kyuusha";
import * as $U from "../../converters/Uma";
import { BanushiDao } from "../../daos/BanushiDao";
import { KishuDao } from "../../daos/KishuDao";
import { KyuushaDao } from "../../daos/KyuushaDao";
import { UmaDao } from "../../daos/UmaDao";
import { Tool } from "../Tool";

@Service()
export class JrdbTool {

  @Inject()
  private tool: Tool;

  @Inject()
  private kyuushaDao: KyuushaDao;

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private banushiDao: BanushiDao;

  @Inject()
  private kishuDao: KishuDao;

  public async saveKishu(buffer: Buffer, date: number) {
    const kishu = new Kishu();
    const kishuMei = readStrWithNoSpace(buffer, 171, 12);
    kishu.JrdbKishuCode = readInt(buffer, 335, 5);
    return this.kishuDao.saveKishu(kishu, kishuMei);
  }

  public saveKyuusha(buffer: Buffer) {
    const kyuusha = new Kyuusha();
    kyuusha.JrdbKyuushaCode = readPositiveInt(buffer, 340, 5);
    const kyuushaMei = readStrWithNoSpace(buffer, 187, 12);
    kyuusha.TouzaiBetsu = $KY.touzaiBetsu.toCodeFromJrdb(buffer, 199, 4);
    return this.kyuushaDao.saveKyuusha(kyuusha, kyuushaMei);
  }

  public saveBanushi(buffer: Buffer) {
    const banushiMei = this.tool.normalizeHoujinMei(buffer, 404, 40);
    if (!banushiMei) {
      return null;
    }
    const banushi = new Banushi();
    banushi.BanushiMei = banushiMei;
    banushi.BanushiKaiCode = readInt(buffer, 444, 2);
    return this.banushiDao.save(banushi);
  }

  public async saveKyousouba(buffer: Buffer) {
    const seibetsu = $U.seibetsu.toCodeFromJrdb(buffer, 403, 1);
    let uma = new Uma();
    uma.KettouTourokuBangou = readStr(buffer, 10, 8);
    uma.Bamei = readStr(buffer, 18, 36);
    uma.Seibetsu = seibetsu;
    uma = await this.umaDao.saveUma(uma);
    let kyousouba = new Kyousouba();
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromJrdb(buffer, 446, 2);
    const banushi = await this.saveBanushi(buffer);
    kyousouba.BanushiId = banushi && banushi.Id;
    const kyuusha = await this.saveKyuusha(buffer);
    kyousouba.KyuushaId = kyuusha && kyuusha.Id;
    kyousouba = await this.umaDao.saveKyousouba(kyousouba);
    return kyousouba;
  }

  public getDateFromFilename(basename: string) {
    const execed = /^[^0-9]+([0-9]{6})\.txt$/.exec(basename);
    if (!execed) {
      return null;
    }
    const yymmdd = parseInt(execed[1]);
    let yyyymmdd: number;
    if (700000 <= yymmdd) {
      yyyymmdd += 19000000;
    } else {
      yyyymmdd += 20000000;
    }
    return yyyymmdd;
  }

}