import * as $SY from "../../converters/ShussoubaYosou";
import { findOneBy } from "../../db/helpers";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { readDouble, readInt } from "../Reader";
import { tool } from "../Tool";
import { JrdbShussoubaData } from "./JrdbShussoubaData";

export class Joa extends JrdbShussoubaData {
  protected getBufferLength() {
    return 116;
  }

  protected async saveShussoubaRelated(buffer: Buffer, shussouba: Shussouba) {
    await super.saveShussoubaRelated(buffer, shussouba);
    await this.saveShussoubaYosou(buffer, shussouba);
  }

  public async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba) {
    const asIs = await findOneBy(ShussoubaYosou, { Id: shussouba.Id });
    const toBe = {} as ShussoubaYosou;
    toBe.Id = shussouba.Id;
    toBe.CidChoukyouSoten = readDouble(buffer, 64, 5);
    toBe.CidKyuushaSoten = readDouble(buffer, 69, 5);
    toBe.CidSoten = readDouble(buffer, 74, 5);
    toBe.Cid = readInt(buffer, 79, 3);
    toBe.LsShisuu = readDouble(buffer, 82, 5);
    toBe.LsHyouka = $SY.lsHyouka.toCodeFromJrdb(buffer, 87, 1);
    toBe.Em = $SY.em.toCodeFromJrdb(buffer, 88, 1);
    toBe.KyuushaBbShirushi = $SY.shirushi.toCodeFromJrdb(buffer, 89, 1);
    toBe.KishuBbShirushi = $SY.shirushi.toCodeFromJrdb(buffer, 100, 1);
    return await tool.saveOrUpdate(ShussoubaYosou, asIs, toBe);
  }
}
