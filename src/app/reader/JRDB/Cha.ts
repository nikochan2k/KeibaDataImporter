import { Service } from "typedi";
import * as $CH from "../../converters/Choukyou";
import * as $R from "../../converters/Race";
import { ShussoubaChoukyou } from "../../entities/ShussoubaChoukyou";
import { readInt, readPositiveInt, readDouble } from "../Reader";
import { Cy$ } from "./Cy$";

@Service()
export class Cha extends Cy$ {

  protected getBufferLength() {
    return 64;
  }

  protected async setChoukyou(buffer: Buffer, sc: ShussoubaChoukyou) {
    sc.ChoukyouNengappi = readInt(buffer, 12, 8);
    sc.Kaisuu = readPositiveInt(buffer, 20, 1);
    sc.Basho = $CH.basho.toCodeFromJrdb(buffer, 21, 2);
    sc.Type = $CH.type.toCodeFromJrdb(buffer, 21, 2);
    sc.Oikiri = $CH.oikiri.toCodeFromJrdb(buffer, 23, 1);
    sc.OiJoutai = $CH.oiJoutai.toCodeFromJrdb(buffer, 24, 2);
    sc.Noriyaku = $CH.noriyaku.toCodeFromJrdb(buffer, 26, 1);
    sc.ChoukyouF = readPositiveInt(buffer, 27, 1);
    sc.TenF = readDouble(buffer, 28, 3, 0.1);
    sc.ChuukanF = readDouble(buffer, 31, 3, 0.1);
    sc.ShimaiF = readDouble(buffer, 34, 3, 0.1);
    sc.TenFShisuu = readInt(buffer, 37, 3);
    sc.ChuukanFShisuu = readInt(buffer, 40, 3);
    sc.ShimaiFShisuu = readInt(buffer, 43, 3);
    const oikiriShisuu = readInt(buffer, 46, 3);
    if (oikiriShisuu) {
      sc.OikiriShisuu = oikiriShisuu;
    }
    sc.Awasekekka = $CH.awaseKekka.toCodeFromJrdb(buffer, 49, 1);
    sc.AwaseumaOikiriShurui = $CH.oikiri.toCodeFromJrdb(buffer, 50, 1);
    sc.AwaseumaNenrei = readPositiveInt(buffer, 51, 2);
    sc.AwaseumaClass = $R.jouken.toCodeFromJrdb(buffer, 53, 2);
  }

}