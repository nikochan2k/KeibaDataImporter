import { Inject, Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { OrmManager } from "../../OrmManager";
import { DataToImport } from "../DataToImport";
import { readStr } from "../Reader";
import { Tool } from "../Tool";
import { KolShussoubaTool } from "./KolShussoubaTool";

@Injectable()
export class KolCom1 extends DataToImport {
  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  private tool: Tool;

  @Inject()
  private kolShussoubaTool: KolShussoubaTool;

  protected getBufferLength() {
    return 3010;
  }

  public async save(buffer: Buffer) {
    const rs = this.kolShussoubaTool.getRaceShussoubaId(buffer, 70);
    const asIs = await this.entityManager.findOneBy(ShussoubaSeiseki, { Id: rs.shussoubaId });
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
