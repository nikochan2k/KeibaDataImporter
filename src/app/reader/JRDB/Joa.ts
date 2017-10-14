import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { JrdbShussoubaTool } from "./JrdbShussoubaTool";
import * as $S from "../../converters/Shussouba";
import * as $SJ from "../../converters/ShussoubaYosou";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readDouble, readInt } from "../Reader";
import { Tool } from "../Tool";

export abstract class Joa extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbShussoubaTool: JrdbShussoubaTool;

  public async save(buffer: Buffer, bridge: Bridge) {
    const id = this.jrdbShussoubaTool.getShussoubaId(buffer, 8);
    const asIs = await this.entityManager.findOneById(ShussoubaYosou, id);

    const toBe = new ShussoubaYosou();
    toBe.Id = id;
    toBe.CidChoukyouSoten = readDouble(buffer, 64, 5);
    toBe.CidKyuushaSoten = readDouble(buffer, 69, 5);
    toBe.Cid = readInt(buffer, 79, 3);
    toBe.LsShisuu = readDouble(buffer, 82, 5);
    toBe.LsHyouka = $SJ.lsHyouka.toCodeFromJrdb(buffer, 87, 1);
    toBe.Em = $SJ.em.toCodeFromJrdb(buffer, 88, 1);
    toBe.KyuushaBbShirushi = $S.yosou.toCodeFromJrdb(buffer, 89, 1);
    toBe.KishuBbShirushi = $S.yosou.toCodeFromJrdb(buffer, 100, 1);

    return await this.tool.saveOrUpdate(ShussoubaYosou, asIs, toBe);
  }
}