import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { JrdbImportTool } from "./JrdbImportTool";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readStr } from "../Reader";
import { Tool } from "../Tool";
import { JrdbTool } from "./JrdbTool";

export abstract class Skb extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbTool: JrdbTool;

  @Inject()
  protected jrdbImportTool: JrdbImportTool;

  public async save(buffer: Buffer, bridge: Bridge) {
    const id = this.jrdbImportTool.getShussoubaId(buffer, 8);
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
    if (asIs) {
      await this.tool.update(ShussoubaHyouka, asIs, toBe);
    } else {
      await this.entityManager.save(toBe);
    }
  }

  protected async saveShussoubaJoutaiSeries(buffer: Buffer, shussoubaId: number) {
    for (let bangou = 0, offset = 26; bangou < 6; bangou++ , offset += 3) {
      await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.Tokki, bangou, offset);
    }
    for (let bangou = 0, offset = 44; bangou < 8; bangou++ , offset += 3) {
      await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.Bagu, bangou, offset);
    }
    for (let bangou = 0, offset = 69; bangou < 3; bangou++ , offset += 3) {
      await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.AshimotoSougou, bangou, offset);
    }
    for (let bangou = 0, offset = 78; bangou < 3; bangou++ , offset += 3) {
      await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.AshimotoHidariMae, bangou, offset);
    }
    for (let bangou = 0, offset = 86; bangou < 3; bangou++ , offset += 3) {
      await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.AshimotoMigiMae, bangou, offset);
    }
    for (let bangou = 0, offset = 95; bangou < 3; bangou++ , offset += 3) {
      await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.AshimotoHidariUshiro, bangou, offset);
    }
    for (let bangou = 0, offset = 104; bangou < 3; bangou++ , offset += 3) {
      await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.AshimotoMigiUshiro, bangou, offset);
    }
    await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.BaguHami, 0, 273);
    await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.BaguBandage, 0, 276);
    await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.BaguTeitetsu, 0, 279);
    await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.BaguHidume, 0, 282);
    await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.BaguSoe, 0, 285);
    await this.jrdbTool.saveShussoubaJoutai(buffer, shussoubaId, Kubun.BaguKotsuryuu, 0, 288);
  }

}