import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readStr } from "../Reader";
import { Tool } from "../Tool";
import { JrdbShussoubaTool } from "./JrdbShussoubaTool";

export abstract class Skb extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbShussoubaTool: JrdbShussoubaTool;

  public async save(buffer: Buffer, bridge: Bridge) {
    const id = this.jrdbShussoubaTool.getShussoubaId(buffer, 8);
    await this.saveShussoubaHyouka(buffer, id);

  }

  protected async saveShussoubaHyouka(buffer: Buffer, id: number) {
    const toBe = new ShussoubaHyouka();
    toBe.Id = id;
    toBe.PaddockComment = readStr(buffer, 113, 40);
    toBe.AshimotoComment = readStr(buffer, 153, 40);
    toBe.BaguSonotaComment = readStr(buffer, 193, 40);
    toBe.RaceComment = readStr(buffer, 233, 40);

    const asIs = await this.entityManager.findOneById(ShussoubaHyouka, id);
    await this.tool.saveOrUpdate(ShussoubaHyouka, asIs, toBe);
  }

  protected async saveShussoubaJoutaiSeries(buffer: Buffer, shussoubaId: number) {
    for (let bangou = 0, offset = 26; bangou < 6; bangou++ , offset += 3) {
      await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, offset, shussoubaId, Kubun.Tokki);
    }
    for (let bangou = 0, offset = 44; bangou < 8; bangou++ , offset += 3) {
      await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, offset, shussoubaId, Kubun.Bagu);
    }
    for (let bangou = 0, offset = 69; bangou < 3; bangou++ , offset += 3) {
      await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, offset, shussoubaId, Kubun.AshimotoSougou);
    }
    for (let bangou = 0, offset = 78; bangou < 3; bangou++ , offset += 3) {
      await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, offset, shussoubaId, Kubun.AshimotoHidariMae);
    }
    for (let bangou = 0, offset = 86; bangou < 3; bangou++ , offset += 3) {
      await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, offset, shussoubaId, Kubun.AshimotoMigiMae);
    }
    for (let bangou = 0, offset = 95; bangou < 3; bangou++ , offset += 3) {
      await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, offset, shussoubaId, Kubun.AshimotoHidariUshiro);
    }
    for (let bangou = 0, offset = 104; bangou < 3; bangou++ , offset += 3) {
      await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, offset, shussoubaId, Kubun.AshimotoMigiUshiro);
    }
    await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 273, shussoubaId, Kubun.BaguHami);
    await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 276, shussoubaId, Kubun.BaguBandage);
    await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 279, shussoubaId, Kubun.BaguTeitetsu);
    await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 282, shussoubaId, Kubun.BaguHidume);
    await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 285, shussoubaId, Kubun.BaguSoe);
    await this.jrdbShussoubaTool.saveShussoubaJoutaiWith(buffer, 288, shussoubaId, Kubun.BaguKotsuryuu);
  }

}