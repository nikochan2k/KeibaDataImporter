import { Service } from "typedi";
import * as $K from "../../../converters/Kaisai";
import { Kaisai } from "../../../entities/Kaisai";
import { readDouble, readInt } from "../../Reader";
import { Ka$ } from "./Ka$";

@Service()
export class Kab extends Ka$ {

  protected getBufferLength() {
    return 72;
  }

  protected setKaisai(buffer: Buffer, toBe: Kaisai) {
    super.setKaisai(buffer, toBe);
    toBe.RenzokuNissuu = readInt(buffer, 49, 2);
    toBe.ShibaShurui = $K.shibaShurui.toCodeFromJrdb(buffer, 51, 1);
    toBe.Kusatake = readDouble(buffer, 52, 4);
    toBe.Tenatsu = $K.tenatsu.toCodeFromJrdb(buffer, 56, 1);
    toBe.TouketsuBoushizai = $K.touketsuBoushizai.toCodeFromJrdb(buffer, 57, 1);
    toBe.ChuukanKousuiryou = readDouble(buffer, 58, 5);
  }

}