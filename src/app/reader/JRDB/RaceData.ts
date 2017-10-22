import { Inject } from "typedi";
import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { Tool } from "../Tool";
import { JrdbKaisaiTool } from "./JrdbKaisaiTool";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { JrdbTool } from "./JrdbTool";

export abstract class RaceData extends DataToImport {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbTool: JrdbTool;

  @Inject()
  protected jrdbKaisaiTool: JrdbKaisaiTool;

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
    const asIs = await this.jrdbKaisaiTool.getKaisaiWithKey(buffer);
    if (asIs) {
      return asIs;
    }

    // TODO 既に取り込まれている場合は取り込まない
    const toBe = this.jrdbKaisaiTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    this.setKaisai(buffer, toBe);

    return await this.tool.saveOrUpdate(Kaisai, asIs, toBe);
  }

  protected abstract setKaisai(buffer: Buffer, toBe: Kaisai);

  protected async saveRace(buffer: Buffer, kaisai: Kaisai) {
    const toBe = this.jrdbRaceTool.createRace(buffer, kaisai.Id);
    if (!toBe) {
      return null;
    }
    this.setRace(buffer, toBe);

    const asIs = await this.jrdbRaceTool.getRace(buffer);
    return await this.tool.saveOrUpdate(Race, asIs, toBe);
  }

  protected abstract setRace(buffer: Buffer, toBe: Race);

  protected abstract async saveRaceRelated(buffer: Buffer, race: Race);

}