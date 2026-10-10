import { Inject } from "typedi";
import { Kaisai } from "../../entities/Kaisai";
import { KaisaiTool } from "../KaisaiTool";
import { Tool } from "../Tool";
import { JrdbData } from "./JrdbData";
import { JrdbKaisaiKaisaiTool } from "./JrdbKaisaiKaisaiTool";
import { JrdbKaisaiRaceTool } from "./JrdbKaisaiRaceTool";
import { JrdbKaisaiShussoubaTool } from "./JrdbKaisaiShussoubaTool";
import { JrdbKaisaiTool } from "./JrdbKaisaiTool";

export abstract class JrdbKaisaiData extends JrdbData {
  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbKaisaiTool: JrdbKaisaiTool;

  @Inject()
  protected jrdbKaisaiKaisaiTool: JrdbKaisaiKaisaiTool;

  @Inject()
  protected jrdbKaisaiRaceTool: JrdbKaisaiRaceTool;

  @Inject()
  protected jrdbKaisaiShussoubaTool: JrdbKaisaiShussoubaTool;

  protected getKaisaiTool(): KaisaiTool {
    return this.jrdbKaisaiTool;
  }

  public async save(buffer: Buffer) {
    const kaisai = await this.saveKaisai(buffer);
    if (!kaisai) {
      return;
    }
    await this.saveKaisaiRelated(buffer, kaisai);
  }

  protected async saveKaisai(buffer: Buffer) {
    const toBe = this.getKaisaiTool().createKaisai(buffer);
    if (!toBe) {
      // 前走データの地方・外国など、開催を特定できないレコード
      return null;
    }
    this.setKaisai(buffer, toBe);
    this.getKaisaiTool().setYoubi(toBe);
    const asIs = await this.getKaisaiTool().getKaisaiWithKey(buffer);
    const kaisai = await this.tool.saveOrUpdate(Kaisai, asIs, toBe);
    return kaisai;
  }

  protected setKaisai(buffer: Buffer, toBe: Kaisai) {}

  protected async saveKaisaiRelated(buffer: Buffer, kaisai: Kaisai) {}
}
