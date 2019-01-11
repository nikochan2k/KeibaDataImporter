import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { JrdbShussoubaTool } from "./JrdbShussoubaTool";
import * as $SY from "../../converters/ShussoubaYosou";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readDouble, readInt } from "../Reader";
import { Tool } from "../Tool";

export class Joa extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbShussoubaTool: JrdbShussoubaTool;

  protected getBufferLength() {
    return 116;
  }

  public async save(buffer: Buffer, bridge: Bridge) {
    const rsId = this.jrdbShussoubaTool.getRaceShussoubaId(buffer, 8);
    const asIs = await this.entityManager.findOne(ShussoubaYosou, rsId.shussoubaId);

    const toBe = new ShussoubaYosou();
    toBe.Id = rsId.shussoubaId;
    toBe.CidChoukyouSoten = readDouble(buffer, 64, 5);
    toBe.CidKyuushaSoten = readDouble(buffer, 69, 5);
    toBe.Cid = readInt(buffer, 79, 3);
    toBe.LsShisuu = readDouble(buffer, 82, 5);
    toBe.LsHyouka = $SY.lsHyouka.toCodeFromJrdb(buffer, 87, 1);
    toBe.Em = $SY.em.toCodeFromJrdb(buffer, 88, 1);
    toBe.KyuushaBbShirushi = $SY.shirushi.toCodeFromJrdb(buffer, 89, 1);
    toBe.KishuBbShirushi = $SY.shirushi.toCodeFromJrdb(buffer, 100, 1);

    return await this.tool.saveOrUpdate(ShussoubaYosou, asIs, toBe);
  }
}