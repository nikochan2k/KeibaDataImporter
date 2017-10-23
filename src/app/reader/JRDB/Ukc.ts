import { Inject, Service } from "typedi";
import * as $C from "../../converters/Common";
import * as $U from "../../converters/Uma";
import { SeisanshaDao } from "../../daos/SeisanshaDao";
import { UmaDao } from "../../daos/UmaDao";
import { Kyousouba } from "../../entities/Kyousouba";
import { MeishouKubun } from "../../entities/Shoyuu";
import { Uma } from "../../entities/Uma";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readInt, readStr } from "../Reader";
import { Tool } from "../Tool";

@Service()
export class Ukc extends DataToImport {

  @Inject()
  protected tool: Tool;

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private seisanshaDao: SeisanshaDao;

  protected getBufferLength() {
    return 292;
  }

  public async save(buffer: Buffer, bridge: Bridge) {
    const seibetsu = $U.seibetsu.toCodeFromJrdb(buffer, 44, 1);
    let uma = new Uma();
    const bamei = readStr(buffer, 8, 36);
    if (this.tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.Seibetsu = seibetsu;
    uma.Keiro = $U.keiro.toCodeFromJrdb(buffer, 45, 2);
    uma.Seibetsu = seibetsu;
    const chichiUma = await this.saveOyaUma(buffer, 49, $U.Seibetsu.Boba, 165);
    uma.ChichiUmaId = chichiUma && chichiUma.Id;
    const hahaChichiUma = await this.saveOyaUma(buffer, 121, $U.Seibetsu.Boba, 173);
    const hahaUma = await this.saveOyaUma(buffer, 85, $U.Seibetsu.Hinba, 169, hahaChichiUma);
    uma.HahaUmaId = hahaUma && hahaUma.Id;
    uma.Seinengappi = readInt(buffer, 157, 8);
    uma.Sanchi = $U.sanch.toCodeFromJrdb(buffer, 259, 8);
    uma.SanchiMei = readStr(buffer, 259, 8);
    uma.MasshouFlag = $C.masshouFlag.toCodeFromJrdb(buffer, 267, 1);
    uma.ChichiKeitouCode = $U.keitou.toCodeFromJravan(buffer, 276, 4);
    uma.HahaChichiKeitouCode = $U.keitou.toCodeFromJravan(buffer, 280, 4);
    uma = await this.umaDao.saveUma(uma, true);
    await this.saveSeisansha(buffer, uma.Id);

    let kyousouba = new Kyousouba();
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromJrdb(buffer, 47, 2);
    kyousouba = await this.umaDao.saveKyousouba(kyousouba);
    return { Kyousouba: kyousouba, Uma: uma };
  }

  protected async saveOyaUma(buffer: Buffer, bameiOffset: number, seibetsu: $U.Seibetsu, seinenOffset: number, chichiUma?: Uma) {
    const bamei = readStr(buffer, bameiOffset, 36);
    if (!bamei) {
      return null;
    }
    const uma = new Uma();
    if (this.tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.Seinen = readInt(buffer, seinenOffset, 4);
    uma.Seibetsu = seibetsu;
    uma.ChichiUmaId = chichiUma && chichiUma.Id;
    return this.umaDao.saveUma(uma, true);
  }

  public async saveSeisansha(buffer: Buffer, umaId: number) {
    const seisanshaMei = this.tool.normalizeHoujinMei(buffer, 219, 40);
    if (!seisanshaMei) {
      return;
    }
    await this.seisanshaDao.save(umaId, MeishouKubun.Full, seisanshaMei);
  }
}