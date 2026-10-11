import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";
import { RaceSeiseki } from "../../entities/RaceSeiseki";
import { tool } from "../Tool";
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
    const asIs = await jrdbRaceTool.getRace(buffer, kaisai.Id);
    return await tool.saveOrUpdate(Race, asIs, toBe, this.keepExisting);
  }

  protected setRace(_buffer: Buffer, _toBe: Race) {}

  protected async saveRaceRelated(_buffer: Buffer, _race: Race) {
    // await this.saveRaceSeiseki(buffer, race.Id);
  }

  protected async saveRaceSeiseki(buffer: Buffer, raceId: number) {
    const toBe = new RaceSeiseki();
    toBe.Id = raceId;
    this.setRaceSeiseki(buffer, toBe);
    const asIs = await this.entityManager.findOneBy(RaceSeiseki, { Id: raceId });
    await tool.saveOrUpdate(RaceSeiseki, asIs, toBe, this.keepExisting);
  }

  protected setRaceSeiseki(_buffer: Buffer, _toBe: RaceSeiseki) {}
}
