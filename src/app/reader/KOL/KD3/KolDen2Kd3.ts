import { Inject, Service } from "typedi";
import * as $S from "../../../converters/Shussouba";
import { Bagu } from "../../../converters/ShussoubaJoutai";
import { ShussoubaChoukyou } from "../../../entities/ShussoubaChoukyou";
import { Shussouba } from "../../../entities/Shussouba";
import { Kubun } from "../../../entities/ShussoubaJoutai";
import { ShussoubaYosou } from "../../../entities/ShussoubaYosou";
import { Bridge } from "../../Bridge";
import { DataToImport } from "../../DataToImport";
import {
  readInt,
  readDouble,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
} from "../../Reader";
import { ShussoubaInfo } from "../../ShussoubaTool";
import { Tool } from "../../Tool";
import { KolBridge } from "../KolBridge";
import { KolChoukyouTool } from "../KolChoukyouTool";
import { KolShussoubaTool } from "../KolShussoubaTool";
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
  private kolShussoubaTool: KolShussoubaTool;

  protected getBufferLength() {
    return 1000;
  }

  protected teardown(bridge: Bridge) {
    const kolBridge = <KolBridge>bridge;
    delete kolBridge.yosouTenkaiMap;
  }

  public async save(buffer: Buffer, bridge: Bridge) {
    const info = await this.kolShussoubaTool.getShussoubaInfo(buffer, 23);
    if (!info) {
      return;
    }

    const dataNengappi = readInt(buffer, 727, 8);
    const asIs = info.shussouba;
    if (asIs && asIs.KolNengappi && dataNengappi <= asIs.KolNengappi) {
      return;
    }

    const shussouba = await this.saveShussouba(buffer, info, dataNengappi);
    if (!shussouba) {
      return;
    }
    info.shussouba = shussouba;

    await this.saveShussoubaJoutai(buffer, shussouba);
    await this.saveShussoubaYosou(buffer, shussouba, <KolBridge>bridge);
    const tanshukuKishuMei = readStrWithNoSpace(buffer, 188, 8);
    await this.saveShussoubaChoukyou(buffer, info, tanshukuKishuMei);
  }

  protected async saveShussouba(buffer: Buffer, info: ShussoubaInfo, dataNengappi: number) {
    const toBe = this.kolShussoubaTool.createShussouba(buffer, 23);
    if (!toBe) {
      return null;
    }

    const asIs = info.shussouba;
    toBe.Wakuban = readPositiveInt(buffer, 22, 1);
    const kyuusha = await this.kolTool.saveKyuusha(buffer, 206);
    const umaInfo = await this.kolTool.saveKyousouba(buffer, 25, kyuusha);
    info.uma = umaInfo.Uma;
    toBe.KyousoubaId = umaInfo.Kyousouba.Id;
    const nenrei = readPositiveInt(buffer, 65, 2);
    const nen = readInt(buffer, 2, 4);
    toBe.Nenrei = this.tool.normalizeNenrei(nenrei, nen);
    toBe.Kinryou = readDouble(buffer, 148, 3, 0.1);
    const kishu = await this.kolTool.saveKishu(buffer, 151);
    toBe.KishuId = kishu.Id;
    const kishuRireki = await this.kolTool.saveKishuRireki(buffer, 196, kishu);
    toBe.KishuRirekiId = kishuRireki.Id;
    toBe.Norikawari = $S.norikawari.toCodeFromKol(buffer, 205, 1);
    toBe.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromKol(buffer, 254, 1) || $S.torikeshiShubetsu.toCodeFromKol(buffer, 255, 1);
    toBe.KyuuyouRiyuu = readStr(buffer, 783, 60);
    toBe.KyuuyouRiyuuCode = $S.kyuuyouRiyuuCode.toCodeFromKol(buffer, 783, 60);

    toBe.KolNengappi = dataNengappi;

    return await this.tool.saveOrUpdate(Shussouba, asIs, toBe);
  }

  protected async saveShussoubaJoutai(buffer: Buffer, shussouba: Shussouba) {
    const blinker = readPositiveInt(buffer, 147, 1);
    if (0 < blinker) {
      this.kolShussoubaTool.saveShussoubaJoutai(shussouba.Id, Kubun.Bagu, Bagu.Blinker);
    }
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba, bridge: KolBridge) {
    const toBe = new ShussoubaYosou();
    toBe.Id = shussouba.Id;
    toBe.KolYosou1 = $S.yosou.toCodeFromKol(buffer, 254, 1);
    toBe.KolYosou2 = $S.yosou.toCodeFromKol(buffer, 255, 1);
    toBe.Rating = readDouble(buffer, 739, 3, 0.1);
    toBe.YosouTenkai = bridge.yosouTenkaiMap.get(toBe.Id);

    const asIs = await this.entityManager.findOneById(ShussoubaYosou, shussouba.Id);

    return await this.tool.saveOrUpdate(ShussoubaYosou, asIs, toBe);
  }

  protected async saveShussoubaChoukyou(buffer: Buffer, info: ShussoubaInfo, tanshukuKishuMei: string) {
    const sc = new ShussoubaChoukyou();
    sc.Id = info.shussouba.Id;
    sc.ChoukyouTanpyou = readStr(buffer, 694, 24);
    sc.ChoukyouHonsuuCourse = readPositiveInt(buffer, 718, 3);
    sc.ChoukyouHonsuuHanro = readPositiveInt(buffer, 721, 3);
    sc.ChoukyouHonsuuPool = readPositiveInt(buffer, 724, 3);
    await this.choukyouTool.saveShussoubaChoukyou(sc);

    const choukyouAwaseFlag = readPositiveInt(buffer, 607, 1);
    const choukyouAwase = readStr(buffer, 608, 86);
    await this.choukyouTool.saveChoukyou(buffer, 256, info.uma.Id, tanshukuKishuMei,
      choukyouAwaseFlag === 1 ? choukyouAwase : null);
    await this.choukyouTool.saveChoukyou(buffer, 373, info.uma.Id, tanshukuKishuMei,
      choukyouAwaseFlag === 2 ? choukyouAwase : null);
    await this.choukyouTool.saveChoukyou(buffer, 490, info.uma.Id, tanshukuKishuMei,
      choukyouAwaseFlag === 3 ? choukyouAwase : null);
  }

}