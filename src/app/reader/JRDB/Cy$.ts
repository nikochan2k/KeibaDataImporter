import { Inject } from "typedi";
import { JrdbRaceTool } from "./JrdbRaceTool";
import * as $CH from "../../converters/Choukyou";
import * as $C from "../../converters/Common";
import { ChoukyouDao } from "../../daos/ChoukyouDao";
import { Choukyou } from "../../entities/Choukyou";
import { Shussouba } from "../../entities/Shussouba";
import { DataToImport } from "../DataToImport";
import { readInt, readStr } from "../Reader";

export abstract class Cy$ extends DataToImport {

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  @Inject()
  protected choukyouDao: ChoukyouDao;

  public async save(buffer: Buffer) {
    const shussouba = await this.jrdbRaceTool.getShussouba(buffer, 8);
    if (!shussouba) {
      return;
    }

    await this.saveChoukyou(buffer, shussouba);
  }

  protected async saveChoukyou(buffer: Buffer, shussouba: Shussouba) {
    const choukyou = new Choukyou();
    choukyou.Id = shussouba.Id;
    choukyou.ChoukyouType = $CH.choukyouType.toCodeFromJrdb(buffer, 10, 2);
    choukyou.Choukyouryou = $CH.choukyouryou.toCodeFromJrdb(buffer, 10, 2);
    choukyou.ChoukyouTsuyosa = $CH.choukyouTsuyosa.toCodeFromJrdb(buffer, 10, 2);
    choukyou.ChoukyouCourseMain = $CH.choukyouCourseShubetsu.toCodeFromJrdb(buffer, 12, 1);
    choukyou.ChoukyouCourseHanro = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 13, 2);
    choukyou.ChoukyouCourseWood = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 15, 2);
    choukyou.ChoukyouCourseDirt = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 17, 2);
    choukyou.ChoukyouCourseShiba = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 19, 2);
    choukyou.ChoukyouCoursePool = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 21, 2);
    choukyou.ChoukyouCourseShougai = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 23, 2);
    choukyou.ChoukyouKyori = $CH.choukyouKyori.toCodeFromJrdb(buffer, 25, 1);
    choukyou.ChoukyouJuuten = $CH.choukyouJuuten.toCodeFromJrdb(buffer, 26, 1);
    choukyou.OikiriShisuu = readInt(buffer, 27, 3);
    choukyou.ShiageShisuu = readInt(buffer, 30, 3);
    choukyou.ChoukyouryouHyouka = $CH.choukyouryouHyouka.toCodeFromJrdb(buffer, 33, 1);
    choukyou.ShiageShisuuHenka = $CH.shiageShisuuHenka.toCodeFromJrdb(buffer, 34, 1);
    choukyou.ChoukyouComment = readStr(buffer, 35, 40);
    choukyou.CommentNengappi = readInt(buffer, 75, 8);
    choukyou.ChoukyouHyouka = $C.hyouka.toCodeFromJrdb(buffer, 83, 1);
    await this.choukyouDao.save(choukyou);
  }
}