import { Kaisai } from "../../entities/Kaisai";
import { KaisaiTool } from "../KaisaiTool";
import { tool } from "../Tool";
import { JrdbData } from "./JrdbData";
import { jrdbKaisaiTool } from "./JrdbKaisaiTool";

export abstract class JrdbKaisaiData extends JrdbData {
  protected getKaisaiTool(): KaisaiTool {
    return jrdbKaisaiTool;
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
    const kaisai = await tool.saveOrUpdate(Kaisai, asIs, toBe);
    return kaisai;
  }

  protected setKaisai(_buffer: Buffer, _toBe: Kaisai) {}

  protected async saveKaisaiRelated(_buffer: Buffer, _kaisai: Kaisai) {}
}
