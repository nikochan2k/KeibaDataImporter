import { Service } from "typedi";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaJrdb } from "../../entities/ShussoubaJrdb";
import { ShussoubaInfo } from "../RaceTool";
import { Ky$ } from "./Ky$";
import * as $S from "../../converters/Shussouba";
import * as $SJ from "../../converters/ShussoubaJrdb";

@Service()
export class Kyh extends Ky$ {

  protected getBufferLength(): number {
    return 552;
  }

  protected async setShussouba(buffer: Buffer, toBe: Shussouba, info: ShussoubaInfo) {
    await super.setShussouba(buffer, toBe, info);
    toBe.KyuuyouRiyuuCode = $S.kyuuyouRiyuuCode.toCodeFromJrdb(buffer, 541, 2);
  }

  protected async setShussoubaJrdb(buffer: Buffer, toBe: ShussoubaJrdb) {
    await super.setShussoubaJrdb(buffer, toBe);
    toBe.KoukyuuFlag = $SJ.koukyuuFlag.toCodeFromJrdb(buffer, 538, 1);
    toBe.GekisouType = $SJ.gekisouType.toCodeFromJrdb(buffer, 539, 2);
  }

}