import { Inject, Service } from "typedi";
import * as $C from "../../../converters/Common";
import * as $K from "../../../converters/Kishu";
import * as $S from "../../../converters/Shussouba";
import { Bagu } from "../../../converters/ShussoubaJoutai";
import * as $SY from "../../../converters/ShussoubaYosou";
import { Shussouba } from "../../../entities/Shussouba";
import { ShussoubaChoukyou } from "../../../entities/ShussoubaChoukyou";
import { Kubun } from "../../../entities/ShussoubaJoutai";
import { ShussoubaYosou } from "../../../entities/ShussoubaYosou";
import { Bridge } from "../../Bridge";
import {
  readDouble,
  readInt,
  readPositiveDouble,
  readPositiveInt,
  readStr,
  readStrWithNoSpace,
} from "../../Reader";
import { ShussoubaInfo } from "../../ShussoubaTool";
import { Tool } from "../../Tool";
import { KolBridge } from "../KolBridge";
import { KolChoukyouTool } from "../KolChoukyouTool";
import { KolDataToImport } from "../KolDataToImport";
import { KolShussoubaTool } from "../KolShussoubaTool";
import { KolTool } from "../KolTool";

@Service()
export class KolDen2Kd3 extends KolDataToImport {
  @Inject()
  private choukyouTool: KolChoukyouTool;

  @Inject()
  private tool: Tool;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private kolShussoubaTool: KolShussoubaTool;

  @Inject()
  private bridge: Bridge;

  protected getBufferLength() {
    return 1000;
  }

  protected async teardown() {
    const kolBridge = <KolBridge>this.bridge;
    delete kolBridge.yosouKyakushitsuMap;
  }

  public async save(buffer: Buffer) {
    const info = await this.kolShussoubaTool.getShussoubaInfo(buffer, 23);
    if (!info) {
      return;
    }

    const dataNengappi = readInt(buffer, this.at(727), 8);
    const asIs = info.shussouba;
    if (asIs?.KolNengappi && dataNengappi <= asIs.KolNengappi) {
      return;
    }

    const shussouba = await this.saveShussouba(buffer, info, dataNengappi);
    if (!shussouba) {
      return;
    }
    info.shussouba = shussouba;

    await this.saveShussoubaJoutai(buffer, shussouba);
    await this.saveShussoubaYosou(buffer, shussouba);
    const tanshukuKishuMei = readStrWithNoSpace(buffer, 188, 8);
    await this.saveShussoubaChoukyou(buffer, info, tanshukuKishuMei);
  }

  protected async saveShussouba(buffer: Buffer, info: ShussoubaInfo, dataNengappi: number) {
    let toBe = this.kolShussoubaTool.createShussouba(buffer, 23);
    if (!toBe) {
      return null;
    }

    toBe.Wakuban = readPositiveInt(buffer, 22, 1);
    const choukyoushi = await this.kolTool.saveChoukyoushi(buffer, 206);
    const umaInfo = await this.kolTool.saveKyousouba(buffer, 25, choukyoushi);
    info.uma = umaInfo.Uma;
    toBe.KyousoubaId = umaInfo.Kyousouba.Id;
    const nenrei = readPositiveInt(buffer, 65, 2);
    const nen = readInt(buffer, 2, 4);
    toBe.Nenrei = this.tool.normalizeNenrei(nenrei, nen);
    toBe.Kinryou = readPositiveDouble(buffer, 148, 3, 0.1);
    const kishu = await this.kolTool.saveKishu(buffer, 151);
    toBe.KishuId = kishu.Id;
    toBe.KishuTouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 196, 1);
    toBe.KishuShozokuBasho = $C.basho.toCodeFromKol(buffer, 197, 2);
    toBe.KishuShozokuChoukyoushiId = await this.kolTool.saveShozokuChoukyoushi(buffer, 199);
    toBe.MinaraiKubun = $K.minaraiKubun.toCodeFromKol(buffer, 204, 1);
    toBe.Norikawari = $S.norikawari.toCodeFromKol(buffer, 205, 1);
    toBe.TorikeshiShubetsu =
      $S.torikeshiShubetsu.toCodeFromKol(buffer, this.at(254), 1) ||
      (this.has(255) ? $S.torikeshiShubetsu.toCodeFromKol(buffer, this.at(255), 1) : undefined);
    if (this.has(783)) {
      toBe.KyuuyouRiyuu = readStr(buffer, this.at(783), 60);
      toBe.KyuuyouRiyuuCode = $S.kyuuyouRiyuuCode.toCodeFromKol(buffer, this.at(783), 60);
    }

    toBe.KolNengappi = dataNengappi;

    toBe = await this.tool.saveOrUpdate(Shussouba, info.shussouba, toBe);
    await this.kolTool.saveBanushi(buffer, 67, toBe.Id);
    return toBe;
  }

  protected async saveShussoubaJoutai(buffer: Buffer, shussouba: Shussouba) {
    const blinker = readPositiveInt(buffer, 147, 1);
    if (0 < blinker) {
      await this.kolShussoubaTool.saveShussoubaJoutai(shussouba.Id, Kubun.Bagu, Bagu.Blinker);
    }
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba) {
    const toBe = new ShussoubaYosou();
    toBe.Id = shussouba.Id;
    toBe.KolYosou1 = $SY.shirushi.toCodeFromKol(buffer, this.at(254), 1);
    if (this.has(255)) {
      toBe.KolYosou2 = $SY.shirushi.toCodeFromKol(buffer, this.at(255), 1);
    }
    toBe.Rating = readDouble(buffer, this.at(739), 3, 0.1);
    const kolBridge = <KolBridge>this.bridge;
    toBe.Kyakushitsu = kolBridge.yosouKyakushitsuMap.get(toBe.Id);

    const asIs = await this.entityManager.findOneBy(ShussoubaYosou, { Id: shussouba.Id });

    return await this.tool.saveOrUpdate(ShussoubaYosou, asIs, toBe);
  }

  protected async saveShussoubaChoukyou(
    buffer: Buffer,
    info: ShussoubaInfo,
    tanshukuKishuMei: string,
  ) {
    const sc = new ShussoubaChoukyou();
    sc.Id = info.shussouba.Id;
    if (this.has(694)) {
      sc.ChoukyouTanpyou = readStr(buffer, this.at(694), 24);
      sc.ChoukyouHonsuuCourse = readPositiveInt(buffer, this.at(718), 3);
      sc.ChoukyouHonsuuHanro = readPositiveInt(buffer, this.at(721), 3);
      sc.ChoukyouHonsuuPool = readPositiveInt(buffer, this.at(724), 3);
    }
    await this.choukyouTool.saveShussoubaChoukyou(sc);

    const choukyouAwaseFlag = readPositiveInt(buffer, this.at(607), 1);
    const choukyouAwase = readStr(buffer, this.at(608), 86);
    await this.choukyouTool.saveChoukyou(
      buffer,
      this.at(256),
      info.uma.Id,
      tanshukuKishuMei,
      choukyouAwaseFlag === 1 ? choukyouAwase : null,
    );
    await this.choukyouTool.saveChoukyou(
      buffer,
      this.at(373),
      info.uma.Id,
      tanshukuKishuMei,
      choukyouAwaseFlag === 2 ? choukyouAwase : null,
    );
    await this.choukyouTool.saveChoukyou(
      buffer,
      this.at(490),
      info.uma.Id,
      tanshukuKishuMei,
      choukyouAwaseFlag === 3 ? choukyouAwase : null,
    );
  }
}
