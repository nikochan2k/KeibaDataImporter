import { Inject } from "typedi";
import { JrdbData } from "./JrdbData";
import { JrdbKaisaiTool } from "./JrdbKaisaiTool";
import { Kaisai } from "../../entities/Kaisai";
import { KaisaiTool } from "../KaisaiTool";
import { Tool } from "../Tool";

export abstract class JrdbKaisaiData extends JrdbData {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbKaisaiTool: JrdbKaisaiTool;

  protected getKaisaiTool(): KaisaiTool {
    return this.jrdbKaisaiTool;
  }

  public async save(buffer: Buffer) {
    await this.saveKaisai(buffer);
  }

  protected async saveKaisai(buffer: Buffer) {
    const asIs = await this.getKaisaiTool().getKaisaiWithKey(buffer);
    if (asIs) {
      return asIs;
    }

    // TODO 既に取り込まれている場合は取り込まない
    const toBe = this.getKaisaiTool().createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    this.setKaisai(buffer, toBe);

    const kaisai = await this.tool.saveOrUpdate(Kaisai, asIs, toBe);
    await this.saveKaisaiRelated(buffer, kaisai);
    return kaisai;
  }

  protected setKaisai(buffer: Buffer, toBe: Kaisai) {
  }

  protected async saveKaisaiRelated(buffer: Buffer, kaisai: Kaisai) {
  }

}