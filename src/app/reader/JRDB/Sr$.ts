import { RaceData } from "./RaceData";
import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";

export abstract class Sr$ extends RaceData {

  protected setKaisai(buffer: Buffer, toBe: Kaisai) {
  }

  protected setRace(buffer: Buffer, toBe: Race) {
  }

  protected async saveRaceRelated(buffer: Buffer, race: Race) {
    await this.tool.saveRaceLapTime(buffer, 8, race);
  }

}