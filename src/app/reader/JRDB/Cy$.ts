import { Inject } from "typedi";
import { JrdbShussoubaTool } from "./JrdbShussoubaTool";
import * as $CH from "../../converters/Choukyou";
import { ShussoubaChoukyou } from "../../entities/ShussoubaChoukyou";
import { DataToImport } from "../DataToImport";
import { ChoukyouDao } from "../../daos/ChoukyouDao";

export abstract class Cy$ extends DataToImport {

  @Inject()
  protected jrdbShussoubaTool: JrdbShussoubaTool;

  @Inject()
  protected choukyouDao: ChoukyouDao;

  public async save(buffer: Buffer) {
    const rsId = await this.jrdbShussoubaTool.getRaceShussoubaId(buffer, 8);
    if (!rsId) {
      return;
    }

    const sc = new ShussoubaChoukyou();
    sc.Id = rsId.shussoubaId;
    this.setChoukyou(buffer, sc);
    await this.choukyouDao.save(sc);
  }

  protected setChoukyou(buffer: Buffer, sc: ShussoubaChoukyou) {
    sc.ChoukyouType = $CH.choukyouType.toCodeFromJrdb(buffer, 10, 2);
    sc.Choukyouryou = $CH.choukyouryou.toCodeFromJrdb(buffer, 10, 2);
    sc.ChoukyouTsuyosa = $CH.choukyouTsuyosa.toCodeFromJrdb(buffer, 10, 2);
    sc.ChoukyouCourseMain = $CH.choukyouCourseShubetsu.toCodeFromJrdb(buffer, 12, 1);
    sc.ChoukyouCourseHanro = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 13, 2);
    sc.ChoukyouCourseWood = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 15, 2);
    sc.ChoukyouCourseDirt = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 17, 2);
    sc.ChoukyouCourseShiba = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 19, 2);
    sc.ChoukyouCoursePool = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 21, 2);
    sc.ChoukyouCourseShougai = $CH.choukyouCourseShurui.toCodeFromJrdb(buffer, 23, 2);
  }

}