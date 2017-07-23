import { Inject } from "typedi";
import { Kaisai } from "../../../entities/Kaisai";
import { Bridge } from "../../Bridge";
import { DataToImport } from "../../DataToImport";
import { Tool } from "../../Tool";
import { JrdbRaceTool } from "../JrdbRaceTool";
import { JrdbTool } from "../JrdbTool";

export abstract class Ka$ extends DataToImport {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbTool: JrdbTool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  public async save(buffer: Buffer, bridge: Bridge) {
    const kaisai = await this.saveKaisai(buffer);
    if (!kaisai) {
      return null;
    }
    await this.saveKaisai(buffer);
  }

  protected async saveKaisai(buffer: Buffer) {
    let toBe = this.jrdbRaceTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }

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
}