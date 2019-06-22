import { Inject } from "typedi";
import * as $CH from "../../converters/Choukyou";
import { ChoukyouDao } from "../../daos/ChoukyouDao";
import { ShussoubaChoukyou } from "../../entities/ShussoubaChoukyou";
import { JrdbShussoubaData } from './JrdbShussoubaData';
import { Shussouba } from '../../entities/Shussouba';

export abstract class Cy$ extends JrdbShussoubaData {

  @Inject()
  protected choukyouDao: ChoukyouDao;

  protected async saveShussoubaRelated(buffer: Buffer, shussouba: Shussouba) {
    await super.saveShussoubaRelated(buffer, shussouba);
    await this.saveShussoubaChoukyou(buffer, shussouba);
  }

  protected async saveShussoubaChoukyou(buffer: Buffer, shussouba: Shussouba) {
    const toBe = new ShussoubaChoukyou();
    toBe.Id = shussouba.Id;
    this.setChoukyou(buffer, toBe);

    const asIs = await this.entityManager.findOne(ShussoubaChoukyou, toBe.Id);
    await this.tool.saveOrUpdate(ShussoubaChoukyou, asIs, toBe);
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