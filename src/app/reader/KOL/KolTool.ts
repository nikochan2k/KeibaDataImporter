import * as $KY from "../../converters/Choukyoushi";
import * as $C from "../../converters/Common";
import * as $U from "../../converters/Uma";
import { banushiDao } from "../../daos/BanushiDao";
import { choukyoushiDao } from "../../daos/ChoukyoushiDao";
import { kishuDao } from "../../daos/KishuDao";
import { seisanshaDao } from "../../daos/SeisanshaDao";
import { umaDao } from "../../daos/UmaDao";
import { Choukyoushi } from "../../entities/Choukyoushi";
import { Kishu } from "../../entities/Kishu";
import { Kyousouba } from "../../entities/Kyousouba";
import { Shussouba } from "../../entities/Shussouba";
import { Uma } from "../../entities/Uma";
import { readInt, readPositiveInt, readStr, readStrWithNoSpace } from "../Reader";
import { tool } from "../Tool";

export class KolTool {
  public async saveKishu(buffer: Buffer, offset: number) {
    const kishu = {} as Kishu;
    kishu.KolKishuCode = readPositiveInt(buffer, offset, 5);
    if (!kishu.KolKishuCode) {
      // 騎手が不明なとき。中身のない騎手を作らない
      return null;
    }
    const kishuMei = readStrWithNoSpace(buffer, offset + 5, 32);
    const tanshukuKishuMei = readStrWithNoSpace(buffer, offset + 37, 8);
    return kishuDao.saveKishu(kishu, kishuMei, tanshukuKishuMei);
  }

  /** 馬主 (正式名と略称) を保存し、レースの日の馬の馬主にします */
  public async saveBanushi(
    buffer: Buffer,
    offset: number,
    shussouba: Pick<Shussouba, "Id" | "KyousoubaId">,
  ) {
    await banushiDao.saveShussoubaBanushi(shussouba, {
      meishou: tool.normalizeHoujinMei(buffer, offset, 40),
      tanshuku: tool.normalizeHoujinMei(buffer, offset + 40, 20),
    });
  }

  public async saveKyousouba(buffer: Buffer, offset: number, choukyoushi: Choukyoushi) {
    const seibetsu = $U.seibetsu.toCodeFromKol(buffer, offset + 39, 1);
    let uma = {} as Uma;
    uma.KolUmaCode = readInt(buffer, offset, 7);
    const bamei = readStr(buffer, offset + 7, 30);
    if (tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.Seibetsu = seibetsu;
    uma = await umaDao.saveUma(uma);

    let kyousouba = {} as Kyousouba;
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, offset + 37, 2);
    kyousouba.ChoukyoushiId = choukyoushi?.Id;
    kyousouba = await umaDao.saveKyousouba(kyousouba);
    return { Kyousouba: kyousouba, Uma: uma };
  }

  /** 生産者の正式名と略称 */
  public async saveSeisansha(buffer: Buffer, offset: number, umaId: number) {
    await seisanshaDao.saveSeisanba(umaId, {
      meishou: tool.normalizeHoujinMei(buffer, offset, 40),
      tanshuku: tool.normalizeHoujinMei(buffer, offset + 40, 20),
    });
  }

  public async saveShozokuChoukyoushi(buffer: Buffer, offset: number) {
    const kolKyuushaCode = readPositiveInt(buffer, offset, 5);
    if (!kolKyuushaCode) {
      return null;
    }
    let choukyoushi = {} as Choukyoushi;
    choukyoushi.KolKyuushaCode = kolKyuushaCode;
    choukyoushi = await choukyoushiDao.saveChoukyoushi(choukyoushi);
    return choukyoushi.Id;
  }

  public saveChoukyoushi(buffer: Buffer, offset: number) {
    const choukyoushiMei = readStrWithNoSpace(buffer, offset + 5, 32);
    if (!choukyoushiMei) {
      return null;
    }
    const choukyoushi = {} as Choukyoushi;
    const kolKyuushaCode = readPositiveInt(buffer, offset, 5);
    choukyoushi.KolKyuushaCode = kolKyuushaCode;
    const tanshuku = readStrWithNoSpace(buffer, offset + 37, 8);
    choukyoushi.ShozokuBasho = $C.basho.toCodeFromKol(buffer, offset + 45, 2);
    choukyoushi.TouzaiBetsu = $KY.touzaiBetsu.toCodeFromKol(buffer, offset + 47, 1);
    choukyoushi.RitsuHokuNanBetsu = $KY.ritsuHokuNanBetsu.toCodeFromKol(buffer, offset + 47, 1);
    return choukyoushiDao.saveChoukyoushi(choukyoushi, choukyoushiMei, tanshuku);
  }
}

export const kolTool = new KolTool();
