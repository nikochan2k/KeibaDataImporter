import { Inject, Service } from "typedi";
import * as $C from "../../../converters/Common";
import * as $S from "../../../converters/Shussouba";
import { Choukyou } from "../../../entities/Choukyou";
import { Shussouba } from "../../../entities/Shussouba";
import { ShussoubaYosou } from "../../../entities/ShussoubaYosou";
import { Bridge } from "../../Bridge";
import { DataToImport } from "../../DataToImport";
import { ShussoubaInfo } from "../../RaceTool";
import {
  readDate,
  readDouble,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
} from "../../Reader";
import { Tool } from "../../Tool";
import { KolBridge } from "../KolBridge";
import { KolChoukyouTool } from "../KolChoukyouTool";
import { KolRaceTool } from "../KolRaceTool";
import { KolTool } from "../KolTool";

@Service()
export class KolDen2Kd3 extends DataToImport {

  @Inject()
  private choukyouTool: KolChoukyouTool;

  @Inject()
  private tool: Tool;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 1000;
  }

  protected teardown(bridge: Bridge) {
    const kolBridge = <KolBridge>bridge;
    delete kolBridge.yosouTenkaiMap;
  }

  public async save(buffer: Buffer, bridge: Bridge) {
    const info = await this.kolRaceTool.getShussoubaInfo(buffer, 23);
    if (!info) {
      return;
    }
    const asIs = info.shussouba;
    if (asIs) {
      const dataSakuseiNengappi = readDate(buffer, 727, 8);
      if (dataSakuseiNengappi <= asIs.KolSeisekiSakuseiNengappi) {
        this.logger.info("既に最新の出走馬成績データが格納されています: " + asIs.Id);
        return;
      }
    }

    const shussouba = await this.saveShussouba(buffer, info);
    if (!shussouba) {
      return;
    }

    await this.saveShussoubaYosou(buffer, shussouba, <KolBridge>bridge);

    const tanshukuKishuMei = readStrWithNoSpace(buffer, 188, 8);
    await this.saveChoukyou(buffer, shussouba, tanshukuKishuMei);
  }

  protected async saveShussouba(buffer: Buffer, info: ShussoubaInfo) {
    let toBe = this.kolRaceTool.createShussouba(buffer, 23);
    if (!toBe) {
      return null;
    }

    const asIs = info.shussouba;
    if (!asIs || !asIs.KolSeisekiSakuseiNengappi) {
      toBe.Wakuban = readPositiveInt(buffer, 22, 1);
      const kyuusha = await this.kolTool.saveKyuusha(buffer, 206);
      toBe.KyousoubaId = (await this.kolTool.saveKyousouba(buffer, 32, kyuusha)).Kyousouba.Id;
      toBe.Nenrei = readPositiveInt(buffer, 65, 2);
      toBe.Blinker = $S.blinker.toCodeFromKol(buffer, 147, 1);
      toBe.Kinryou = readDouble(buffer, 148, 3, 0.1);
      toBe.KishuId = (await this.kolTool.saveKishu(buffer, 151, info.race.Nengappi)).Id;
      toBe.KishuTouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 196, 1);
      toBe.KishuShozokuBasho = $C.basho.toCodeFromKol(buffer, 197, 2);
      toBe.KishuShozokuKyuushaId = await this.kolTool.saveShozokuKyuusha(buffer, 199);
      toBe.MinaraiKubun = $S.minaraiKubun.toCodeFromKol(buffer, 204, 1);
      toBe.Norikawari = $S.norikawari.toCodeFromKol(buffer, 205, 1);
    }

    toBe.KolShutsubahyouSakuseiNengappi = readDate(buffer, 727, 8);
    toBe.KyuuyouRiyuu = readStr(buffer, 783, 60);
    toBe.KyuuyouRiyuuCode = $S.kyuuyouRiyuuCode.toCodeFromKol(buffer, 783, 60);

    return await this.tool.update(Shussouba, asIs, toBe);
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba, bridge: KolBridge) {
    const toBe = new ShussoubaYosou();
    toBe.Id = shussouba.Id;
    toBe.KolYosou1 = $S.yosou.toCodeFromKol(buffer, 254, 1);
    toBe.KolYosou2 = $S.yosou.toCodeFromKol(buffer, 255, 1);
    toBe.Rating = readDouble(buffer, 739, 3, 0.1);
    toBe.YosouTenkai = bridge.yosouTenkaiMap.get(toBe.Id);

    const asIs = await this.entityManager.findOneById(ShussoubaYosou, shussouba.Id);

    return await this.tool.update(ShussoubaYosou, asIs, toBe);
  }

  protected async saveChoukyou(buffer: Buffer, shussouba: Shussouba, tanshukuKishuMei: string) {
    const choukyou = new Choukyou();
    choukyou.Id = shussouba.Id;
    choukyou.ChoukyouTanpyou = readStr(buffer, 694, 24);
    choukyou.ChoukyouHonsuuCourse = readPositiveInt(buffer, 718, 3);
    choukyou.ChoukyouHonsuuHanro = readPositiveInt(buffer, 721, 3);
    choukyou.ChoukyouHonsuuPool = readPositiveInt(buffer, 724, 3);
    await this.choukyouTool.saveChoukyou(choukyou);

    const choukyouAwaseFlag = readPositiveInt(buffer, 607, 1);
    const choukyouAwase = readStr(buffer, 608, 86);
    await this.choukyouTool.saveChoukyouRireki(buffer, 256, shussouba, tanshukuKishuMei, 1,
      choukyouAwaseFlag === 1 ? choukyouAwase : null);
    await this.choukyouTool.saveChoukyouRireki(buffer, 373, shussouba, tanshukuKishuMei, 2,
      choukyouAwaseFlag === 2 ? choukyouAwase : null);
    await this.choukyouTool.saveChoukyouRireki(buffer, 490, shussouba, tanshukuKishuMei, 3,
      choukyouAwaseFlag === 3 ? choukyouAwase : null);
  }

}