import { Inject } from "typedi";
import { Race } from "../../../entities/Race";
import { Bridge } from "../../Bridge";
import { DataToImport } from "../../DataToImport";
import { Tool } from "../../Tool";
import { JrdbRaceTool } from "../JrdbRaceTool";
import { JrdbTool } from "../JrdbTool";

export abstract class RaceData extends DataToImport {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbTool: JrdbTool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  public async save(buffer: Buffer, bridge: Bridge) {
    const race = await this.saveRace(buffer);
    if (!race) {
      return null;
    }
    await this.saveRaceRelated(buffer, race);
  }

  protected async saveRace(buffer: Buffer) {
    let toBe = this.jrdbRaceTool.createRace(buffer);
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