import { Inject } from "typedi";
import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";
import { RaceSeiseki } from "../../entities/RaceSeiseki";
import { JrdbKaisaiData } from "./JrdbKaisaiData";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { JrdbTool } from "./JrdbTool";

export abstract class JrdbRaceData extends JrdbKaisaiData {
  @Inject()
  protected jrdbTool: JrdbTool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

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
    const toBe = this.jrdbRaceTool.createRace(buffer, kaisai.Id);
    if (!toBe) {
      return null;
    }
    this.setRace(buffer, toBe);
    const asIs = await this.jrdbRaceTool.getRace(buffer, kaisai.Id);
    return await this.tool.saveOrUpdate(Race, asIs, toBe, this.keepExisting);
  }

  protected setRace(buffer: Buffer, toBe: Race) {}

  protected async saveRaceRelated(buffer: Buffer, race: Race) {
    // await this.saveRaceSeiseki(buffer, race.Id);
  }

  protected async saveRaceSeiseki(buffer: Buffer, raceId: number) {
    const toBe = new RaceSeiseki();
    toBe.Id = raceId;
    this.setRaceSeiseki(buffer, toBe);
    const asIs = await this.entityManager.findOneBy(RaceSeiseki, { Id: raceId });
    await this.tool.saveOrUpdate(RaceSeiseki, asIs, toBe, this.keepExisting);
  }

  protected setRaceSeiseki(buffer: Buffer, toBe: RaceSeiseki) {}
}
