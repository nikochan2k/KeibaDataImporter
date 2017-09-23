import { Inject } from "typedi";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { JrdbTool } from "./JrdbTool";
import { Race } from "../../entities/Race";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaJrdb } from "../../entities/ShussoubaJrdb";
import { DataToImport } from "../DataToImport";
import { ShussoubaInfo } from "../RaceTool";
import { Tool } from "../Tool";

export abstract class ShussoubaData extends DataToImport {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbTool: JrdbTool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  public async save(buffer: Buffer) {
    const info = await this.jrdbRaceTool.getShussoubaInfo(buffer, 8);
    if (!info) {
      return;
    }

    await this.saveRace(buffer, info.race);

    const shussouba = await this.saveShussouba(buffer, info);
    if (!shussouba) {
      return;
    }

    await this.saveShussoubaJrdb(buffer, shussouba);
  }

  protected async saveRace(buffer: Buffer, asIs: Race) {
  }

  protected async saveShussouba(buffer: Buffer, info: ShussoubaInfo) {
    let toBe = this.jrdbRaceTool.createShussouba(buffer, 8);
    if (toBe) {
      return null;
    }
    this.setShussouba(buffer, toBe, info);

    const asIs = info.shussouba;
    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, true);
      if (updateSet) {
        await this.entityManager
          .createQueryBuilder()
          .update(Shussouba, updateSet)
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

  protected abstract setShussouba(buffer: Buffer, shussouba: Shussouba, info: ShussoubaInfo);

  protected async saveShussoubaJrdb(buffer: Buffer, shussouba: Shussouba) {
    let toBe = new ShussoubaJrdb();
    toBe.Id = shussouba.Id;
    this.setShussoubaJrdb(buffer, toBe);

    const asIs = await this.entityManager.findOneById(ShussoubaJrdb, shussouba.Id);
    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, true);
      if (updateSet) {
        await this.entityManager
          .createQueryBuilder()
          .update(ShussoubaJrdb, updateSet)
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

  protected abstract setShussoubaJrdb(buffer: Buffer, shussoubaJrdb: ShussoubaJrdb);
}