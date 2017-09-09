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
    let toBe = this.jrdbRaceTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    this.setKaisai(buffer, toBe);

    const asIs = await this.jrdbRaceTool.getKaisai(buffer);
    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, true);
      if (updateSet) {
        await this.entityManager
          .createQueryBuilder()
          .update(Kaisai, updateSet)
          .where("Id = :id")
          .setParameter("id", asIs.Id)
          .execute();
      }
      toBe = asIs;
    } else {
      toBe = await this.entityManager.save(toBe);
    }
    return toBe;
  }

  protected abstract setKaisai(buffer: Buffer, toBe: Kaisai);

  protected async saveRace(buffer: Buffer, kaisai: Kaisai) {
    let toBe = this.jrdbRaceTool.createRace(buffer, kaisai.Id);
    if (!toBe) {
      return null;
    }
    this.setRace(buffer, toBe);

    const asIs = await this.jrdbRaceTool.getRace(buffer);
    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, true);
      if (updateSet) {
        await this.entityManager
          .createQueryBuilder()
          .update(Race, updateSet)
          .where("Id = :id")
          .setParameter("id", asIs.Id)
          .execute();
      }
      toBe = asIs;
    } else {
      toBe = await this.entityManager.save(toBe);
    }
    return toBe;
  }

  protected abstract setRace(buffer: Buffer, toBe: Race);

  protected abstract async saveRaceRelated(buffer: Buffer, race: Race);

}