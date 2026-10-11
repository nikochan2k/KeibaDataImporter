import * as $C from "../../converters/Common";
import * as $K from "../../converters/Kishu";
import * as $S from "../../converters/Shussouba";
import { Bagu } from "../../converters/ShussoubaJoutai";
import * as $SY from "../../converters/ShussoubaYosou";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { bridge } from "../Bridge";
import {
  readDouble,
  readInt,
  readPositiveDouble,
  readPositiveInt,
  readStr,
  readStrWithNoSpace,
} from "../Reader";
import { ShussoubaInfo } from "../ShussoubaTool";
import { tool } from "../Tool";
import { KolBridge } from "./KolBridge";
import { kolChoukyouTool } from "./KolChoukyouTool";
import { KolDataToImport } from "./KolDataToImport";
import { kolShussoubaTool } from "./KolShussoubaTool";
import { kolTool } from "./KolTool";

export class KolDen2 extends KolDataToImport {
  protected getBufferLength() {
    return 1000;
  }

  protected async teardown() {
    const kolBridge = <KolBridge>bridge;
    delete kolBridge.yosouKyakushitsuMap;
  }

  public async save(buffer: Buffer) {
    const info = await kolShussoubaTool.getShussoubaInfo(buffer, 23);
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
    let toBe = kolShussoubaTool.createShussouba(buffer, 23);
    if (!toBe) {
      return null;
    }

    toBe.Wakuban = readPositiveInt(buffer, 22, 1);
    const choukyoushi = await kolTool.saveChoukyoushi(buffer, 206);
    const umaInfo = await kolTool.saveKyousouba(buffer, 25, choukyoushi);
    info.uma = umaInfo.Uma;
    toBe.KyousoubaId = umaInfo.Kyousouba.Id;
    const nenrei = readPositiveInt(buffer, 65, 2);
    const nen = readInt(buffer, 2, 4);
    toBe.Nenrei = tool.normalizeNenrei(nenrei, nen);
    toBe.Kinryou = readPositiveDouble(buffer, 148, 3, 0.1);
    const kishu = await kolTool.saveKishu(buffer, 151);
    toBe.KishuId = kishu.Id;
    toBe.KishuTouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 196, 1);
    toBe.KishuShozokuBasho = $C.basho.toCodeFromKol(buffer, 197, 2);
    toBe.KishuShozokuChoukyoushiId = await kolTool.saveShozokuChoukyoushi(buffer, 199);
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

    toBe = await tool.saveOrUpdate(Shussouba, info.shussouba, toBe);
    await kolTool.saveBanushi(buffer, 67, toBe.Id);
    return toBe;
  }

  protected async saveShussoubaJoutai(buffer: Buffer, shussouba: Shussouba) {
    const blinker = readPositiveInt(buffer, 147, 1);
    if (0 < blinker) {
      await kolShussoubaTool.saveShussoubaJoutai(shussouba.Id, Kubun.Bagu, Bagu.Blinker);
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
    const kolBridge = <KolBridge>bridge;
    toBe.Kyakushitsu = kolBridge.yosouKyakushitsuMap.get(toBe.Id);

    const asIs = await this.entityManager.findOneBy(ShussoubaYosou, { Id: shussouba.Id });

    return await tool.saveOrUpdate(ShussoubaYosou, asIs, toBe);
  }

  protected async saveShussoubaChoukyou(
    buffer: Buffer,
    info: ShussoubaInfo,
    tanshukuKishuMei: string,
  ) {
    if (this.has(694)) {
      const toBe = new ShussoubaHyouka();
      toBe.Id = info.shussouba.Id;
      toBe.ChoukyouTanpyou = readStr(buffer, this.at(694), 24);
      toBe.ChoukyouHonsuuCourse = readPositiveInt(buffer, this.at(718), 3);
      toBe.ChoukyouHonsuuHanro = readPositiveInt(buffer, this.at(721), 3);
      toBe.ChoukyouHonsuuPool = readPositiveInt(buffer, this.at(724), 3);
      const asIs = await this.entityManager.findOneBy(ShussoubaHyouka, { Id: toBe.Id });
      await tool.saveOrUpdate(ShussoubaHyouka, asIs, toBe);
    }

    const choukyouAwaseFlag = readPositiveInt(buffer, this.at(607), 1);
    const choukyouAwase = readStr(buffer, this.at(608), 86);
    await kolChoukyouTool.saveChoukyou(
      buffer,
      this.at(256),
      info.shussouba.Id,
      info.uma.Id,
      tanshukuKishuMei,
      choukyouAwaseFlag === 1 ? choukyouAwase : null,
    );
    await kolChoukyouTool.saveChoukyou(
      buffer,
      this.at(373),
      info.shussouba.Id,
      info.uma.Id,
      tanshukuKishuMei,
      choukyouAwaseFlag === 2 ? choukyouAwase : null,
    );
    await kolChoukyouTool.saveChoukyou(
      buffer,
      this.at(490),
      info.shussouba.Id,
      info.uma.Id,
      tanshukuKishuMei,
      choukyouAwaseFlag === 3 ? choukyouAwase : null,
    );
  }
}
