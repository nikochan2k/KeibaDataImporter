import { Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { JrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { JrdbShussoubaTool } from "./JrdbShussoubaTool";
import * as $C from "../../converters/Common";
import * as $S from "../../converters/Shussouba";
import * as $SY from "../../converters/ShussoubaYosou";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readDouble, readInt, readPositiveInt } from "../Reader";
import { RaceShussoubaId } from "../ShussoubaTool";
import { Tool } from "../Tool";

export class Tyb extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbShussoubaTool: JrdbShussoubaTool;

  @Inject()
  protected jrdbOddsHaitouTool: JrdbOddsHaitouTool;

  protected getBufferLength() {
    return 128;
  }

  public async save(buffer: Buffer, bridge: Bridge) {
    const rsId = this.jrdbShussoubaTool.getRaceShussoubaId(buffer, 8);
    await this.saveShussoubaYosou(buffer, rsId.shussoubaId);
    await this.saveOddsHaitou(buffer, rsId);
    await this.saveShussoubaSeiseki(buffer, rsId.shussoubaId);
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussoubaId: number) {
    const asIs = await this.entityManager.findOneById(ShussoubaYosou, shussoubaId);

    const toBe = new ShussoubaYosou();
    toBe.Id = shussoubaId;
    toBe.Idm = readDouble(buffer, 10, 5);
    toBe.KishuShisuu = readDouble(buffer, 15, 5);
    toBe.JouhouShisuu = readDouble(buffer, 20, 5);
    toBe.OddsShisuu = readDouble(buffer, 25, 5);
    toBe.PaddockShisuu = readDouble(buffer, 30, 5);
    toBe.SougouShisuu = readDouble(buffer, 40, 5);
    toBe.BaguHenkouJouhou = $SY.baguHenkouJouhou.toCodeFromJrdb(buffer, 45, 1);
    toBe.OddsShirushi = $SY.shirushi.toCodeFromJrdb(buffer, 94, 1);
    toBe.PaddockShirushi = $SY.shirushi.toCodeFromJrdb(buffer, 95, 1);
    toBe.ChokuzenSougouShirushi = $SY.shirushi.toCodeFromJrdb(buffer, 96, 1);

    await this.tool.saveOrUpdate(ShussoubaYosou, asIs, toBe);
  }

  protected async saveOddsHaitou(buffer: Buffer, rsId: RaceShussoubaId) {
    await this.jrdbOddsHaitouTool.saveOddsNinki(buffer, rsId, {
      Kakutei: $C.Kakutei.Chokuzen,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 72,
      OddsLength: 6
    });
    await this.jrdbOddsHaitouTool.saveOddsNinki(buffer, rsId, {
      Kakutei: $C.Kakutei.Chokuzen,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 78,
      OddsLength: 6
    });
  }

  protected async saveShussoubaSeiseki(buffer: Buffer, shussoubaId: number) {
    const asIs = await this.entityManager.findOneById(Shussouba, shussoubaId);

    const toBe = new ShussoubaSeiseki();
    toBe.Id = shussoubaId;
    toBe.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromJrdb(buffer, 47, 1);
    const kishu = await this.jrdbShussoubaTool.saveKishu(buffer, 48, 53);
    toBe.KishuId = kishu.Id;
    toBe.Bataijuu = readPositiveInt(buffer, 88, 3);
    toBe.Zougen = readInt(buffer, 91, 3);

    await this.tool.saveOrUpdate(ShussoubaSeiseki, asIs, toBe);
  }
}