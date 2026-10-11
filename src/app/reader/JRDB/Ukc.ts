import * as $C from "../../converters/Common";
import * as $U from "../../converters/Uma";
import { seisanshaDao } from "../../daos/SeisanshaDao";
import { umaDao } from "../../daos/UmaDao";
import { Kyousouba } from "../../entities/Kyousouba";
import { MeishouKubun } from "../../entities/Shoyuu";
import { Uma } from "../../entities/Uma";
import { readInt, readStr } from "../Reader";
import { tool } from "../Tool";
import { JrdbData } from "./JrdbData";

export class Ukc extends JrdbData {
  protected getBufferLength() {
    return 292;
  }

  public async save(buffer: Buffer) {
    const seibetsu = $U.seibetsu.toCodeFromJrdb(buffer, 44, 1);
    let uma = {} as Uma;
    uma.KettouTourokuBangou = readStr(buffer, 0, 8);
    const bamei = readStr(buffer, 8, 36);
    if (tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.Seibetsu = seibetsu;
    uma.Keiro = $U.keiro.toCodeFromJrdb(buffer, 45, 2);
    const chichiUma = await this.saveOyaUma(buffer, 49, $U.Seibetsu.Boba, 165);
    uma.ChichiUmaId = chichiUma?.Id;
    const hahaChichiUma = await this.saveOyaUma(buffer, 121, $U.Seibetsu.Boba, 173);
    const hahaUma = await this.saveOyaUma(buffer, 85, $U.Seibetsu.Hinba, 169, hahaChichiUma);
    uma.HahaUmaId = hahaUma?.Id;
    uma.Seinen = readInt(buffer, 157, 4);
    uma.Seinengappi = readInt(buffer, 157, 8);
    uma.Sanchi = $U.sanch.toCodeFromJrdb(buffer, 259, 8);
    uma.SanchiMei = readStr(buffer, 259, 8);
    uma.MasshouFlag = $C.masshouFlag.toCodeFromJrdb(buffer, 267, 1);
    uma.ChichiKeitouCode = $U.keitou.toCodeFromJrdb(buffer, 276, 4);
    uma.HahaChichiKeitouCode = $U.keitou.toCodeFromJrdb(buffer, 280, 4);
    uma = await umaDao.saveUma(uma);
    await this.saveSeisansha(buffer, uma.Id);

    let kyousouba = {} as Kyousouba;
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromJrdb(buffer, 47, 2);
    kyousouba = await umaDao.saveKyousouba(kyousouba);
    return { Kyousouba: kyousouba, Uma: uma };
  }

  protected async saveOyaUma(
    buffer: Buffer,
    bameiOffset: number,
    seibetsu: $U.Seibetsu,
    seinenOffset: number,
    chichiUma?: Uma,
  ) {
    const bamei = readStr(buffer, bameiOffset, 36);
    if (!bamei) {
      return null;
    }
    const uma = {} as Uma;
    if (tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.Seinen = readInt(buffer, seinenOffset, 4);
    uma.Seibetsu = seibetsu;
    uma.ChichiUmaId = chichiUma?.Id;
    return umaDao.saveUma(uma);
  }

  public async saveSeisansha(buffer: Buffer, umaId: number) {
    const seisanshaMei = tool.normalizeHoujinMei(buffer, 219, 40);
    if (!seisanshaMei) {
      return;
    }
    await seisanshaDao.save(umaId, MeishouKubun.Full, seisanshaMei);
  }
}
