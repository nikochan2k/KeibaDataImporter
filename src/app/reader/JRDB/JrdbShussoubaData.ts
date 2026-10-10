import { Inject } from "typedi";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaInfo } from "../ShussoubaTool";
import { JrdbRaceData } from "./JrdbRaceData";
import { JrdbShussoubaTool } from "./JrdbShussoubaTool";

export abstract class JrdbShussoubaData extends JrdbRaceData {
  @Inject()
  protected jrdbShussoubaTool: JrdbShussoubaTool;

  public async save(buffer: Buffer) {
    await super.save(buffer);
    const raceId = this.jrdbRaceTool.getRaceIdBy(buffer, this.getKaisaiTool());
    if (raceId == null) {
      return;
    }
    const info = await this.jrdbShussoubaTool.getShussoubaInfo(buffer, 8, raceId);
    if (!info) {
      return;
    }

    info.shussouba = await this.saveShussouba(buffer, info, raceId);
    await this.saveShussoubaRelated(buffer, info.shussouba);
  }

  protected async saveShussouba(buffer: Buffer, info: ShussoubaInfo, raceId: number) {
    const toBe = this.jrdbShussoubaTool.createShussouba(buffer, 8, raceId);
    if (!toBe) {
      return info.shussouba;
    }
    await this.setShussouba(buffer, toBe, info);
    const asIs = info.shussouba;
    const shussouba = await this.tool.saveOrUpdate(Shussouba, asIs, toBe, this.keepExisting);
    return shussouba;
  }

  protected async setShussouba(_buffer: Buffer, _toBe: Shussouba, _info: ShussoubaInfo) {}

  protected async saveShussoubaRelated(_buffer: Buffer, _shussouba: Shussouba) {}
}
