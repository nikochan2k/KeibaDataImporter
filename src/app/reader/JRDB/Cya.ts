import { Service } from "typedi";
import * as $CH from "../../converters/Choukyou";
import * as $C from "../../converters/Common";
import { Choukyou } from "../../entities/Choukyou";
import { readInt, readStr } from "../Reader";
import { Cy$ } from "./Cy$";

@Service()
export class Cya extends Cy$ {

  protected getBufferLength() {
    return 88;
  }

  protected async setChoukyou(buffer: Buffer, choukyou: Choukyou) {
    super.setChoukyou(buffer, choukyou);
    choukyou.ChoukyouKyori = $CH.choukyouKyori.toCodeFromJrdb(buffer, 25, 1);
    choukyou.ChoukyouJuuten = $CH.choukyouJuuten.toCodeFromJrdb(buffer, 26, 1);
    choukyou.OikiriShisuu = readInt(buffer, 27, 3);
    choukyou.ShiageShisuu = readInt(buffer, 30, 3);
    choukyou.ChoukyouryouHyouka = $CH.choukyouryouHyouka.toCodeFromJrdb(buffer, 33, 1);
    choukyou.ShiageShisuuHenka = $CH.shiageShisuuHenka.toCodeFromJrdb(buffer, 34, 1);
    choukyou.ChoukyouComment = readStr(buffer, 35, 40);
    choukyou.CommentNengappi = readInt(buffer, 75, 8);
    choukyou.ChoukyouHyouka = $C.hyouka.toCodeFromJrdb(buffer, 83, 1);
  }

}