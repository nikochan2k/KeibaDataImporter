import { upsert, upsertLater } from "../../db/helpers";
import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";
import { RaceSeiseki } from "../../entities/RaceSeiseki";

import { JrdbKaisaiData } from "./JrdbKaisaiData";
import { jrdbRaceTool } from "./JrdbRaceTool";

export abstract class JrdbRaceData extends JrdbKaisaiData {
  public async save(buffer: Buffer) {
    const kaisai = await this.saveKaisai(buffer);
    if (!kaisai) {
      return null;
    }
    const race = await this.saveRace(buffer, kaisai);
    if (!race) {
      return null;
    }
    await this.saveRaceRelated(buffer, race);
  }

  protected async saveRace(buffer: Buffer, kaisai: Kaisai) {
    const toBe = jrdbRaceTool.createRace(buffer, kaisai.Id);
    if (!toBe) {
      return null;
    }
    this.setRace(buffer, toBe);
    return upsert(Race, toBe);
  }

  protected setRace(_buffer: Buffer, _toBe: Race) {}

  protected async saveRaceRelated(_buffer: Buffer, _race: Race) {
    // await this.saveRaceSeiseki(buffer, race.Id);
  }

  protected async saveRaceSeiseki(buffer: Buffer, raceId: number) {
    const toBe = {} as RaceSeiseki;
    toBe.Id = raceId;
    this.setRaceSeiseki(buffer, toBe);
    upsertLater(RaceSeiseki, toBe);
  }

  protected setRaceSeiseki(_buffer: Buffer, _toBe: RaceSeiseki) {}
}
