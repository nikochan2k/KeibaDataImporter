import { Service } from "typedi";
import * as $CH from "../../converters/Choukyou";
import * as $S from "../../converters/Shussouba";
import { Choukyou } from "../../entities/Choukyou";
import { readInt, readStr } from "../Reader";
import { Cy$ } from "./Cy$";

@Service()
export class Cyb extends Cy$ {

  protected getBufferLength() {
    return 98;
  }

  protected async setChoukyou(buffer: Buffer, choukyou: Choukyou) {
    super.setChoukyou(buffer, choukyou);
    choukyou.ChoukyouCoursePoly = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 25, 2);
    choukyou.ChoukyouKyori = $CH.choukyouKyori.toCodeFromJrdb(buffer, 27, 1);
    choukyou.ChoukyouJuuten = $CH.choukyouJuuten.toCodeFromJrdb(buffer, 28, 1);
    choukyou.OikiriShisuu = readInt(buffer, 29, 3);
    choukyou.ShiageShisuu = readInt(buffer, 32, 3);
    choukyou.ChoukyouryouHyouka = $CH.choukyouryouHyouka.toCodeFromJrdb(buffer, 35, 1);
    choukyou.ShiageShisuuHenka = $CH.shiageShisuuHenka.toCodeFromJrdb(buffer, 36, 1);
    choukyou.ChoukyouComment = readStr(buffer, 37, 40);
    choukyou.CommentNengappi = readInt(buffer, 77, 8);
    choukyou.ChoukyouHyouka = $S.hyouka.toCodeFromJrdb(buffer, 85, 1);
  }

}