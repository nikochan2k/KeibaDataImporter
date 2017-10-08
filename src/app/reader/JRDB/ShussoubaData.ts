import { Inject } from "typedi";
import { JrdbImportTool } from "./JrdbImportTool";
import { JrdbTool } from "./JrdbTool";
import { Race } from "../../entities/Race";
import { Shussouba } from "../../entities/Shussouba";
import { DataToImport } from "../DataToImport";
import { ShussoubaInfo } from "../ImportTool";
import { Tool } from "../Tool";

export abstract class ShussoubaData extends DataToImport {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbTool: JrdbTool;

  @Inject()
  protected jrdbImportTool: JrdbImportTool;

  public async save(buffer: Buffer) {
    const info = await this.jrdbImportTool.getShussoubaInfo(buffer, 8);
    if (!info) {
      return;
    }

    await this.saveRace(buffer, info.race);

    const shussouba = await this.saveShussouba(buffer, info);
    if (!shussouba) {
      return;
    }
    info.shussouba = shussouba;

    await this.saveShussoubaRelated(buffer, info);
  }

  protected async saveRace(buffer: Buffer, asIs: Race) {
  }

  protected async saveShussouba(buffer: Buffer, info: ShussoubaInfo) {
    const toBe = this.jrdbImportTool.createShussouba(buffer, 8);
    if (toBe) {
      return null;
    }
    this.setShussouba(buffer, toBe, info);

    const asIs = info.shussouba;
    return await this.tool.saveOrUpdate(Shussouba, asIs, toBe);
  }

  protected abstract setShussouba(buffer: Buffer, shussouba: Shussouba, info: ShussoubaInfo);

  protected abstract async saveShussoubaRelated(buffer: Buffer, info: ShussoubaInfo);
}