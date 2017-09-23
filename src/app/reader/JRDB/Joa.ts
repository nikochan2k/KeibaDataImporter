import { Inject } from "typedi";
import { ShussoubaData } from "./ShussoubaData";
import * as $S from "../../converters/Shussouba";
import * as $SJ from "../../converters/ShussoubaYosou";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { ShussoubaInfo } from "../RaceTool";
import { readDouble, readInt } from "../Reader";
import { Tool } from "../Tool";
import { JrdbRaceTool } from "./JrdbRaceTool";

export abstract class Joa extends ShussoubaData {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  protected async saveShussouba(buffer: Buffer, info: ShussoubaInfo) {
    return info.shussouba;
  }

  protected setShussouba(buffer: Buffer, shussouba: Shussouba, info: ShussoubaInfo) {
  }

  protected async setShussoubaYosou(buffer: Buffer, toBe: ShussoubaYosou) {
    toBe.CidChoukyouSoten = readDouble(buffer, 64, 5);
    toBe.CidKyuushaSoten = readDouble(buffer, 69, 5);
    toBe.Cid = readInt(buffer, 79, 3);
    toBe.LsShisuu = readDouble(buffer, 82, 5);
    toBe.LsHyouka = $SJ.lsHyouka.toCodeFromJrdb(buffer, 87, 1);
    toBe.Em = $SJ.em.toCodeFromJrdb(buffer, 88, 1);
    toBe.KyuushaBbShirushi = $S.yosou.toCodeFromJrdb(buffer, 89, 1);
    toBe.KishuBbShirushi = $S.yosou.toCodeFromJrdb(buffer, 100, 1);
  }
}