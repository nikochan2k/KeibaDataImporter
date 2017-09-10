import { Service } from "typedi";
import { ShussoubaJrdb } from "../../entities/ShussoubaJrdb";
import { Kyh } from "./Kyh";
import * as $SJ from "../../converters/ShussoubaJrdb";
import { readInt, readStr } from "../Reader";

@Service()
export class Kyi extends Kyh {

  protected getBufferLength(): number {
    return 1024;
  }

  protected async setShussoubaJrdb(buffer: Buffer, toBe: ShussoubaJrdb) {
    await super.setShussoubaJrdb(buffer, toBe);
    toBe.ShibaDirtShougaiFlag = $SJ.shibaDirtShougaiFlag.toCodeFromJrdb(buffer, 543, 1);
    toBe.KyoriFlag = $SJ.kyoriFlag.toCodeFromJrdb(buffer, 544, 2);
    toBe.ClassFlag = $SJ.shibaDirtShougaiFlag.toCodeFromJrdb(buffer, 545, 1);
    toBe.TenkyuuFlag = $SJ.kyoriFlag.toCodeFromJrdb(buffer, 546, 2);
    toBe.KyoseiFlag = $SJ.shibaDirtShougaiFlag.toCodeFromJrdb(buffer, 547, 1);
    toBe.NorikawariFlag = $SJ.kyoriFlag.toCodeFromJrdb(buffer, 548, 2);
    toBe.NyuukyuuNansoume = readInt(buffer, 559, 2);
    toBe.NyuukyuuNengappi = readInt(buffer, 561, 8);
    toBe.NyuukyuuNannichimae = readInt(buffer, 569, 3);
    toBe.Houbokusaki = readStr(buffer, 572, 50);
    toBe.HoubokusakiRank = $SJ.houbokusakiRank.toCodeFromJrdb(buffer, 622, 1);
    toBe.KyuushaRank = $SJ.kyuushaRank.toCodeFromJrdb(buffer, 623, 1);
  }

}