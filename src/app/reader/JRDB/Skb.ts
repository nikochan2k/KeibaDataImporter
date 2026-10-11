import { findOneBy } from "../../db/helpers";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { readStr } from "../Reader";
import { tool } from "../Tool";
import { jrdbKaisaiShussoubaTool } from "./JrdbKaisaiShussoubaTool";
import { JrdbShussoubaData } from "./JrdbShussoubaData";
import { jrdbShussoubaTool } from "./JrdbShussoubaTool";

export class Skb extends JrdbShussoubaData {
  protected getBufferLength() {
    return 304;
  }

  protected getKaisaiTool() {
    return jrdbKaisaiShussoubaTool;
  }

  protected async saveShussoubaRelated(buffer: Buffer, shussouba: Shussouba) {
    await super.saveShussoubaRelated(buffer, shussouba);
    await this.saveShussoubaHyouka(buffer, shussouba.Id);
    await this.saveShussoubaJoutaiSeries(buffer, shussouba.Id);
  }

  protected async saveShussoubaHyouka(buffer: Buffer, shussoubaId: number) {
    const toBe = {} as ShussoubaHyouka;
    toBe.Id = shussoubaId;
    toBe.PaddockComment = readStr(buffer, 113, 40);
    toBe.AshimotoComment = readStr(buffer, 153, 40);
    toBe.BaguSonotaComment = readStr(buffer, 193, 40);
    toBe.RaceComment = readStr(buffer, 233, 40);

    const asIs = await findOneBy(ShussoubaHyouka, { Id: shussoubaId });
    await tool.saveOrUpdate(ShussoubaHyouka, asIs, toBe);
  }

  protected async saveShussoubaJoutaiSeries(buffer: Buffer, shussoubaId: number) {
    for (let bangou = 0, offset = 26; bangou < 6; bangou++, offset += 3) {
      await jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, offset, shussoubaId, Kubun.Tokki);
    }
    for (let bangou = 0, offset = 44; bangou < 8; bangou++, offset += 3) {
      await jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, offset, shussoubaId, Kubun.Bagu);
    }
    for (let bangou = 0, offset = 68; bangou < 3; bangou++, offset += 3) {
      await jrdbShussoubaTool.saveShussoubaJoutaiWith(
        buffer,
        offset,
        shussoubaId,
        Kubun.AshimotoSougou,
      );
    }
    for (let bangou = 0, offset = 77; bangou < 3; bangou++, offset += 3) {
      await jrdbShussoubaTool.saveShussoubaJoutaiWith(
        buffer,
        offset,
        shussoubaId,
        Kubun.AshimotoHidariMae,
      );
    }
    for (let bangou = 0, offset = 86; bangou < 3; bangou++, offset += 3) {
      await jrdbShussoubaTool.saveShussoubaJoutaiWith(
        buffer,
        offset,
        shussoubaId,
        Kubun.AshimotoMigiMae,
      );
    }
    for (let bangou = 0, offset = 95; bangou < 3; bangou++, offset += 3) {
      await jrdbShussoubaTool.saveShussoubaJoutaiWith(
        buffer,
        offset,
        shussoubaId,
        Kubun.AshimotoHidariUshiro,
      );
    }
    for (let bangou = 0, offset = 104; bangou < 3; bangou++, offset += 3) {
      await jrdbShussoubaTool.saveShussoubaJoutaiWith(
        buffer,
        offset,
        shussoubaId,
        Kubun.AshimotoMigiUshiro,
      );
    }
    await jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 273, shussoubaId, Kubun.BaguHami);
    await jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 276, shussoubaId, Kubun.BaguBandage);
    await jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 279, shussoubaId, Kubun.BaguTeitetsu);
    await jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 282, shussoubaId, Kubun.BaguHidume);
    await jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 285, shussoubaId, Kubun.BaguSoe);
    await jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 288, shussoubaId, Kubun.BaguKotsuryuu);
  }
}
