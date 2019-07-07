import { Inject, Service } from "typedi";
import { Kyh } from "./Kyh";
import * as $S from "../../converters/Shussouba";
import * as $SJ from "../../converters/ShussoubaYosou";
import { HoubokusakiDao } from "../../daos/HoubokusakiDao";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { readInt, readStr } from "../Reader";
import { ShussoubaInfo } from "../ShussoubaTool";

@Service()
export class Kyi extends Kyh {

  @Inject()
  private houbokusakiDao: HoubokusakiDao;

  protected getBufferLength(): number {
    return 1024;
  }

  protected async setShussouba(buffer: Buffer, toBe: Shussouba, info: ShussoubaInfo) {
    await super.setShussouba(buffer, toBe, info);
    toBe.Norikawari = $S.norikawari.toCodeFromJrdb(buffer, 548, 1);
  }

  protected async setShussoubaYosou(buffer: Buffer, toBe: ShussoubaYosou) {
    await super.setShussoubaYosou(buffer, toBe);
    toBe.ShibaDirtShougaiFlag = $SJ.shibaDirtShougaiFlag.toCodeFromJrdb(buffer, 543, 1);
    toBe.KyoriFlag = $SJ.kyoriFlag.toCodeFromJrdb(buffer, 544, 1);
    toBe.ClassFlag = $SJ.classFlag.toCodeFromJrdb(buffer, 545, 1);
    toBe.TenkyuuFlag = $SJ.tenkyuuFlag.toCodeFromJrdb(buffer, 546, 1);
    toBe.KyoseiFlag = $SJ.kyoseiFlag.toCodeFromJrdb(buffer, 547, 1);
    toBe.NyuukyuuNansoume = readInt(buffer, 559, 2);
    toBe.NyuukyuuNengappi = readInt(buffer, 561, 8);
    toBe.NyuukyuuNannichimae = readInt(buffer, 569, 3);
    const meishou = readStr(buffer, 572, 50);
    if (meishou) {
      const houbokusaki = await this.houbokusakiDao.save(meishou);
      toBe.HoubokusakiId = houbokusaki.Id;
    }
    toBe.HoubokusakiRank = $SJ.houbokusakiRank.toCodeFromJrdb(buffer, 622, 1);
    toBe.KyuushaRank = $SJ.kyuushaRank.toCodeFromJrdb(buffer, 623, 1);
  }

}