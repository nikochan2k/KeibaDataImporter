import { Service } from "typedi";
import { Race } from "../../entities/Race";
import { readInt } from "../Reader";
import { Ba$ } from "./Ba$";

@Service()
export class Bac extends Ba$ {

  protected getBufferLength() {
    return 184;
  }

  protected setRace(buffer: Buffer, toBe: Race) {
    super.setRace(buffer, toBe);

    toBe.BakenHatsubaiFlagTanshou = readInt(buffer, 160, 1);
    toBe.BakenHatsubaiFlagFukushou = readInt(buffer, 161, 1);
    toBe.BakenHatsubaiFlagWakuren = readInt(buffer, 162, 1);
    toBe.BakenHatsubaiFlagUmaren = readInt(buffer, 163, 1);
    toBe.BakenHatsubaiFlagUmatan = readInt(buffer, 164, 1);
    toBe.BakenHatsubaiFlagWide = readInt(buffer, 165, 1);
    toBe.BakenHatsubaiFlagSanrenpuku = readInt(buffer, 166, 1);
    toBe.BakenHatsubaiFlagSanrentan = readInt(buffer, 167, 1);
    toBe.WinsFlag = readInt(buffer, 176, 1);
  }

}