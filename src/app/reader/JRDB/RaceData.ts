import { Inject } from "typedi";
import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { Tool } from "../Tool";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { JrdbTool } from "./JrdbTool";

export abstract class RaceData extends DataToImport {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbTool: JrdbTool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  public async save(buffer: Buffer, bridge: Bridge) {
    const kaisai = await this.saveKaisai(buffer);
    const race = await this.saveRace(buffer, kaisai);
    if (!race) {
      return null;
    }
    await this.saveRaceRelated(buffer, race);
  }

  protected async saveKaisai(buffer: Buffer) {
    const toBe = this.jrdbRaceTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    this.setKaisai(buffer, toBe);

    const asIs = await this.jrdbRaceTool.getKaisai(buffer);

    return await this.tool.update(Kaisai, asIs, toBe);
  }

  protected abstract setKaisai(buffer: Buffer, toBe: Kaisai);

  protected async saveRace(buffer: Buffer, kaisai: Kaisai) {
    const toBe = this.jrdbRaceTool.createRace(buffer, kaisai.Id);
    if (!toBe) {
      return null;
    }
    this.setRace(buffer, toBe);

    const asIs = await this.jrdbRaceTool.getRace(buffer);
    return await this.tool.update(Race, asIs, toBe);
  }

  protected abstract setRace(buffer: Buffer, toBe: Race);

  protected abstract async saveRaceRelated(buffer: Buffer, race: Race);

}