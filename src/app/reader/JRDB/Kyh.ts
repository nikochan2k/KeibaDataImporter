import { Service } from "typedi";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { ShussoubaInfo } from "../RaceTool";
import { Ky$ } from "./Ky$";
import * as $S from "../../converters/Shussouba";
import * as $SJ from "../../converters/ShussoubaYosou";

@Service()
export class Kyh extends Ky$ {

  protected getBufferLength(): number {
    return 552;
  }

  protected async setShussouba(buffer: Buffer, toBe: Shussouba, info: ShussoubaInfo) {
    await super.setShussouba(buffer, toBe, info);
    toBe.KyuuyouRiyuuCode = $S.kyuuyouRiyuuCode.toCodeFromJrdb(buffer, 541, 2);
  }

  protected async setShussoubaYosou(buffer: Buffer, toBe: ShussoubaYosou) {
    await super.setShussoubaYosou(buffer, toBe);
    toBe.KoukyuuFlag = $SJ.koukyuuFlag.toCodeFromJrdb(buffer, 538, 1);
    toBe.GekisouType = $SJ.gekisouType.toCodeFromJrdb(buffer, 539, 2);
  }

}