import * as $CH from "../../converters/Choukyou";
import * as $C from "../../converters/Common";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { readInt, readStr } from "../Reader";
import { Cy$ } from "./Cy$";

export class Cyb extends Cy$ {
  protected getBufferLength() {
    return 96;
  }

  protected setChoukyou(buffer: Buffer, sc: ShussoubaHyouka) {
    super.setChoukyou(buffer, sc);
    sc.ChoukyouCoursePoly = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 25, 2);
    sc.ChoukyouKyori = $CH.choukyouKyori.toCodeFromJrdb(buffer, 27, 1);
    sc.ChoukyouJuuten = $CH.choukyouJuuten.toCodeFromJrdb(buffer, 28, 1);
    sc.OikiriShisuu = readInt(buffer, 29, 3);
    sc.ShiageShisuu = readInt(buffer, 32, 3);
    sc.ChoukyouryouHyouka = $CH.choukyouryouHyouka.toCodeFromJrdb(buffer, 35, 1);
    sc.ShiageShisuuHenka = $CH.shiageShisuuHenka.toCodeFromJrdb(buffer, 36, 1);
    sc.ChoukyouComment = readStr(buffer, 37, 40);
    sc.ChoukyouCommentNengappi = readInt(buffer, 77, 8);
    sc.ChoukyouHyouka = $C.hyouka.toCodeFromJrdb(buffer, 85, 1);
    sc.IsshuumaeOikiriShisuu = readInt(buffer, 86, 3);
    sc.IsshuumaeOikiriBasho = $CH.basho.toCodeFromJrdb(buffer, 89, 2);
  }
}
