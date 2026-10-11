import * as $C from "../../../converters/Common";
import * as $U from "../../../converters/Uma";
import { seisanshaDao } from "../../../daos/SeisanshaDao";
import { umaDao } from "../../../daos/UmaDao";
import { Kyousouba } from "../../../entities/Kyousouba";
import { MeishouKubun } from "../../../entities/Shoyuu";
import { Uma } from "../../../entities/Uma";
import { DataToImport } from "../../DataToImport";
import { readPositiveInt, readStr } from "../../Reader";
import { tool } from "../../Tool";
import { jraTool } from "../JraTool";

/**
 * 競走馬 (JracUmaj.dat)。
 * 過去 5 走・前 6〜55 走の出走情報は取り込まない (レースの成績は成績１・２から取り込む)。
 */
export class JravanUmaj extends DataToImport {
  protected getBufferLength() {
    return 2881;
  }

  public async save(buffer: Buffer) {
    const touroku = jraTool.readTouroku(buffer, 0);
    const bamei = readStr(buffer, 28, 36);
    if (!touroku && !bamei) {
      return;
    }
    const seibetsu = $U.seibetsu.toCodeFromJravan(buffer, 73, 1);

    // 父・母・母の父・母の母は、馬名だけがある
    const chichi = await this.saveOyaUma(buffer, 78, $U.Seibetsu.Boba);
    const hahaChichi = await this.saveOyaUma(buffer, 192, $U.Seibetsu.Boba);
    const hahaHaha = await this.saveOyaUma(buffer, 249, $U.Seibetsu.Hinba);
    const haha = await this.saveOyaUma(buffer, 135, $U.Seibetsu.Hinba, hahaChichi, hahaHaha);

    let uma = {} as Uma;
    if (touroku) {
      uma.KettouTourokuBangou = touroku.bangou;
    }
    jraTool.setBamei(uma, bamei);
    uma.Seinengappi = readPositiveInt(buffer, 64, 8);
    uma.Seinen = uma.Seinengappi ? Math.floor(uma.Seinengappi / 10000) : touroku?.seinen;
    uma.Kesshu = $U.kesshu.toCodeFromJravan(buffer, 72, 1);
    uma.Seibetsu = seibetsu;
    uma.Keiro = $U.keiro.toCodeFromJravan(buffer, 74, 2);
    uma.ChichiUmaId = chichi?.Id;
    uma.HahaUmaId = haha?.Id;
    uma.SanchiMei = readStr(buffer, 420, 24);
    uma.MasshouFlag =
      readStr(buffer, 19, 1) === "1" ? $C.MasshouFlag.Massou : $C.MasshouFlag.Geneki;
    uma.MasshouNengappi = readPositiveInt(buffer, 20, 8);
    uma = await umaDao.saveUma(uma);

    const seisanshaMei = tool.normalizeHoujinMei(buffer, 444, 40);
    if (seisanshaMei) {
      await seisanshaDao.save(uma.Id, MeishouKubun.Full, seisanshaMei);
    }

    const choukyoushi = await jraTool.saveChoukyoushi(buffer, 550, 555);
    let kyousouba = {} as Kyousouba;
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromJvData(buffer, 76, 2);
    kyousouba.ChoukyoushiId = choukyoushi?.Id;
    kyousouba = await umaDao.saveKyousouba(kyousouba);
  }

  private async saveOyaUma(
    buffer: Buffer,
    bameiOffset: number,
    seibetsu: $U.Seibetsu,
    chichiUma?: Uma,
    hahaUma?: Uma,
  ) {
    const bamei = readStr(buffer, bameiOffset, 36);
    if (!bamei) {
      return null;
    }
    const uma = {} as Uma;
    jraTool.setBamei(uma, bamei);
    uma.Seibetsu = seibetsu;
    uma.ChichiUmaId = chichiUma?.Id;
    uma.HahaUmaId = hahaUma?.Id;
    return umaDao.saveUma(uma);
  }
}
