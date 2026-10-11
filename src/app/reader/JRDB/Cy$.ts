import * as $CH from "../../converters/Choukyou";
import { findOneBy } from "../../db/helpers";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { tool } from "../Tool";
import { JrdbShussoubaData } from "./JrdbShussoubaData";

/** 調教分析データ(CYA / CYB)。レースに向けた調教の評価なので、出走馬の評価(ShussoubaHyouka)に入れる */
export abstract class Cy$ extends JrdbShussoubaData {
  protected async saveShussoubaRelated(buffer: Buffer, shussouba: Shussouba) {
    await super.saveShussoubaRelated(buffer, shussouba);
    await this.saveShussoubaHyouka(buffer, shussouba);
  }

  protected async saveShussoubaHyouka(buffer: Buffer, shussouba: Shussouba) {
    const toBe = {} as ShussoubaHyouka;
    toBe.Id = shussouba.Id;
    this.setChoukyou(buffer, toBe);

    const asIs = await findOneBy(ShussoubaHyouka, { Id: toBe.Id });
    await tool.saveOrUpdate(ShussoubaHyouka, asIs, toBe);
  }

  protected setChoukyou(buffer: Buffer, sc: ShussoubaHyouka) {
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
