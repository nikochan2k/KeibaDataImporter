import { upsert } from "../../db/helpers";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaInfo } from "../ShussoubaTool";

import { JrdbRaceData } from "./JrdbRaceData";
import { jrdbRaceTool } from "./JrdbRaceTool";
import { jrdbShussoubaTool } from "./JrdbShussoubaTool";

export abstract class JrdbShussoubaData extends JrdbRaceData {
  public async save(buffer: Buffer) {
    await super.save(buffer);
    const raceId = jrdbRaceTool.getRaceIdBy(buffer, this.getKaisaiTool());
    if (raceId == null) {
      return;
    }
    const info = await jrdbShussoubaTool.getShussoubaInfo(buffer, 8, raceId);
    if (!info) {
      return;
    }

    info.shussouba = await this.saveShussouba(buffer, info, raceId);
    await this.saveShussoubaRelated(buffer, info.shussouba);
  }

  protected async saveShussouba(buffer: Buffer, info: ShussoubaInfo, raceId: number) {
    const toBe = jrdbShussoubaTool.createShussouba(buffer, 8, raceId);
    if (!toBe) {
      return info.shussouba;
    }
    await this.setShussouba(buffer, toBe, info);
    return upsert(Shussouba, toBe, this.keepExisting);
  }

  protected async setShussouba(_buffer: Buffer, _toBe: Shussouba, _info: ShussoubaInfo) {}

  protected async saveShussoubaRelated(_buffer: Buffer, _shussouba: Shussouba) {}
}
