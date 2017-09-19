import { Service } from "typedi";
import * as $CH from "../../converters/Choukyou";
import * as $R from "../../converters/Race";
import { Choukyou } from "../../entities/Choukyou";
import { readInt, readPositiveInt, readDouble } from "../Reader";
import { Cy$ } from "./Cy$";

@Service()
export class Cha extends Cy$ {

  protected getBufferLength() {
    return 64;
  }

  protected async setChoukyou(buffer: Buffer, choukyou: Choukyou) {
    choukyou.ChoukyouNengappi = readInt(buffer, 12, 8);
    choukyou.Kaisuu = readPositiveInt(buffer, 20, 1);
    choukyou.Basho = $CH.basho.toCodeFromJrdb(buffer, 21, 2);
    choukyou.Type = $CH.type.toCodeFromJrdb(buffer, 21, 2);
    choukyou.Oikiri = $CH.oikiri.toCodeFromJrdb(buffer, 23, 1);
    choukyou.OiJoutai = $CH.oiJoutai.toCodeFromJrdb(buffer, 24, 2);
    choukyou.Noriyaku = $CH.noriyaku.toCodeFromJrdb(buffer, 26, 1);
    choukyou.ChoukyouF = readPositiveInt(buffer, 27, 1);
    choukyou.TenF = readDouble(buffer, 28, 3, 0.1);
    choukyou.ChuukanF = readDouble(buffer, 31, 3, 0.1);
    choukyou.ShimaiF = readDouble(buffer, 34, 3, 0.1);
    choukyou.TenFShisuu = readInt(buffer, 37, 3);
    choukyou.ChuukanFShisuu = readInt(buffer, 40, 3);
    choukyou.ShimaiFShisuu = readInt(buffer, 43, 3);
    const oikiriShisuu = readInt(buffer, 46, 3);
    if (oikiriShisuu) {
      choukyou.OikiriShisuu = oikiriShisuu;
    }
    choukyou.Awasekekka = $CH.awaseKekka.toCodeFromJrdb(buffer, 49, 1);
    choukyou.AwaseumaOikiriShurui = $CH.oikiri.toCodeFromJrdb(buffer, 50, 1);
    choukyou.AwaseumaNenrei = readPositiveInt(buffer, 51, 2);
    choukyou.AwaseumaClass = $R.jouken.toCodeFromJrdb(buffer, 53, 2);
  }

}