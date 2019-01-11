import { Inject, Service } from "typedi";
import { DataToImport } from "../../DataToImport";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { ShussoubaSeiseki } from "../../../entities/ShussoubaSeiseki";
import { Bridge } from "../../Bridge";
import { Tool } from "../../Tool";
import {
  readStr
} from "../../Reader";
import { KolShussoubaTool } from "../KolShussoubaTool";

@Service()
export class KolCom1Kd3 extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  private tool: Tool;

  @Inject()
  private kolShussoubaTool: KolShussoubaTool;

  protected getBufferLength() {
    return 3010;
  }

  public async save(buffer: Buffer, bridge: Bridge) {
    const rs = this.kolShussoubaTool.getRaceShussoubaId(buffer, 70);
    const asIs = await this.entityManager.findOne(ShussoubaSeiseki, rs.shussoubaId);
    if (!asIs) {
      return;
    }
    const toBe = new ShussoubaSeiseki();
    toBe.Id = asIs.Id;
    toBe.KishuKyuushaComment = readStr(buffer, 91, 960);
    toBe.JisouhenoMemo = readStr(buffer, 1051, 960);
    await this.tool.saveOrUpdate(ShussoubaSeiseki, asIs, toBe);
  }
}