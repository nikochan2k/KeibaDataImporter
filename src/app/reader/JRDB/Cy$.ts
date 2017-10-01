import { Inject } from "typedi";
import { JrdbImportTool } from "./JrdbImportTool";
import * as $CH from "../../converters/Choukyou";
import { Choukyou } from "../../entities/Choukyou";
import { DataToImport } from "../DataToImport";
import { ChoukyouDao } from "../../daos/ChoukyouDao";

export abstract class Cy$ extends DataToImport {

  @Inject()
  protected jrdbImportTool: JrdbImportTool;

  @Inject()
  protected choukyouDao: ChoukyouDao;

  public async save(buffer: Buffer) {
    const shussouba = await this.jrdbImportTool.getShussouba(buffer, 8);
    if (!shussouba) {
      return;
    }

    const choukyou = new Choukyou();
    choukyou.Id = shussouba.Id;
    this.setChoukyou(buffer, choukyou);
    await this.choukyouDao.save(choukyou);
  }

  protected setChoukyou(buffer: Buffer, choukyou: Choukyou) {
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
  }

}