import * as $K from "../../converters/Kaisai";
import * as $R from "../../converters/Race";
import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";
import { KaisaiTool } from "../KaisaiTool";
import { readJikan, readPositiveInt, readStr } from "../Reader";
import { jrdbKaisaiRaceTool } from "./JrdbKaisaiRaceTool";
import { JrdbRaceData } from "./JrdbRaceData";
import { jrdbRaceTool } from "./JrdbRaceTool";

export abstract class Ba$ extends JrdbRaceData {
  protected getKaisaiTool(): KaisaiTool {
    return jrdbKaisaiRaceTool;
  }

  protected setKaisai(buffer: Buffer, toBe: Kaisai) {
    toBe.KaisaiKubun = $K.kaisaiKubun.toCodeFromJrdb(buffer, 97, 1);
  }

  protected setRace(buffer: Buffer, toBe: Race) {
    toBe.YoteiHassouJikan = readJikan(buffer, 16);
    jrdbRaceTool.setRaceJouken(buffer, toBe, 20, 27);
    const kaisuu = readStr(buffer, 86, 8);
    const execed = /\d+/.exec(kaisuu);
    if (execed) {
      toBe.JuushouKaisuu = parseInt(execed[0], 10);
    }
    toBe.Tousuu = readPositiveInt(buffer, 94, 2);
    toBe.Course = $R.course.toCodeFromJrdb(buffer, 96, 1);

    toBe.Shoukin1Chaku = readPositiveInt(buffer, 125, 5, 10000);
    toBe.Shoukin2Chaku = readPositiveInt(buffer, 130, 5, 10000);
    toBe.Shoukin3Chaku = readPositiveInt(buffer, 135, 5, 10000);
    toBe.Shoukin4Chaku = readPositiveInt(buffer, 140, 5, 10000);
    toBe.Shoukin5Chaku = readPositiveInt(buffer, 145, 5, 10000);
    toBe.SannyuShoukin1Chaku = readPositiveInt(buffer, 150, 5, 10000);
    toBe.SannyuShoukin2Chaku = readPositiveInt(buffer, 155, 5, 10000);
  }

  protected async saveRaceRelated(buffer: Buffer, race: Race) {
    await super.saveRaceRelated(buffer, race);
    await this.saveRaceMei(buffer, race);
  }

  protected async saveRaceMei(buffer: Buffer, race: Race) {
    await jrdbRaceTool.saveRaceMei(buffer, 36, 50, race);
    await jrdbRaceTool.saveRaceMei(buffer, 98, 8, race);
    await jrdbRaceTool.saveRaceMei(buffer, 106, 18, race);
  }
}
