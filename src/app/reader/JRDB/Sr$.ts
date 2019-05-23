import { Inject } from "typedi";
import { RaceData } from "./RaceData";
import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";
import { Bridge } from "../Bridge";
import { Sr$KaisaiTool } from './Sr$KaisaiTool';
import { RaceSeiseki } from '../../entities/RaceSeiseki';
import { readStr } from '../Reader';

export abstract class Sr$ extends RaceData {

  private static YYMMDD = /(\d{2})(\d{2})(\d{2})/;

  @Inject()
  private sr$KaisaiTool: Sr$KaisaiTool;

  protected getKaisaiTool() {
    return this.sr$KaisaiTool;
  }

  protected setKaisai(buffer: Buffer, toBe: Kaisai) {
  }

  protected setRace(buffer: Buffer, toBe: Race) {
  }

  protected setRaceSeiseki(buffer: Buffer, toBe: RaceSeiseki) {
    toBe.Ichidori1Corner = readStr(buffer, 62, 64);
    toBe.Ichidori2Corner = readStr(buffer, 126, 64);
    toBe.Ichidori3Corner = readStr(buffer, 190, 64);
    toBe.Ichidori4Corner = readStr(buffer, 254, 64);
  }

  protected async saveRaceRelated(buffer: Buffer, race: Race) {
    await this.jrdbRaceTool.saveRaceLapTime(buffer, 8, race);
  }

  protected setup(bridge: Bridge) {
    const result = Sr$.YYMMDD.exec(bridge.basename);
    const yy = parseInt(result[1]);
    this.sr$KaisaiTool.nen = yy + ((70 <= yy) ? 1000 : 2000);
    this.sr$KaisaiTool.gatsu = parseInt(result[2]);
    this.sr$KaisaiTool.nichi = parseInt(result[3]);
  }
}