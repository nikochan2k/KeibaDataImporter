import { Service } from "typedi";
import * as $CH from "../../converters/Choukyou";
import * as $C from "../../converters/Common";
import { ShussoubaChoukyou } from "../../entities/ShussoubaChoukyou";
import { readInt, readStr } from "../Reader";
import { Cy$ } from "./Cy$";

@Service()
export class Cya extends Cy$ {

  protected getBufferLength() {
    return 88;
  }

  protected async setChoukyou(buffer: Buffer, sc: ShussoubaChoukyou) {
    super.setChoukyou(buffer, sc);
    sc.ChoukyouKyori = $CH.choukyouKyori.toCodeFromJrdb(buffer, 25, 1);
    sc.ChoukyouJuuten = $CH.choukyouJuuten.toCodeFromJrdb(buffer, 26, 1);
    sc.OikiriShisuu = readInt(buffer, 27, 3);
    sc.ShiageShisuu = readInt(buffer, 30, 3);
    sc.ChoukyouryouHyouka = $CH.choukyouryouHyouka.toCodeFromJrdb(buffer, 33, 1);
    sc.ShiageShisuuHenka = $CH.shiageShisuuHenka.toCodeFromJrdb(buffer, 34, 1);
    sc.ChoukyouComment = readStr(buffer, 35, 40);
    sc.CommentNengappi = readInt(buffer, 75, 8);
    sc.ChoukyouHyouka = $C.hyouka.toCodeFromJrdb(buffer, 83, 1);
  }

}