import { Inject, Service } from "typedi";
import * as $C from "../../../converters/Common";
import * as $S from "../../../converters/Shussouba";
import { Choukyou } from "../../../entities/Choukyou";
import { Shussouba } from "../../../entities/Shussouba";
import { ShussoubaYosou } from "../../../entities/ShussoubaYosou";
import { DataToImport } from "../../DataToImport";
import { ShussoubaInfo } from "../../RaceTool";
import {
  readDate,
  readDouble,
  readInt,
  readPositiveInt,
  readStrWithNoSpace,
  readTime
} from "../../Reader";
import { Tool } from "../../Tool";
import { KolChoukyouTool } from "../KolChoukyouTool";
import { KolRaceTool } from "../KolRaceTool";
import { KolTool } from "../KolTool";

@Service()
export class KolSei2Kd3 extends DataToImport {

  @Inject()
  private choukyouTool: KolChoukyouTool;

  @Inject()
  private tool: Tool;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 600;
  }

  public async save(buffer: Buffer) {
    const info = await this.kolRaceTool.getShussoubaInfo(buffer, 23);
    if (!info) {
      return;
    }
    const asIs = info.shussouba;
    if (asIs) {
      const dataSakuseiNengappi = readDate(buffer, 424, 8);
      if (dataSakuseiNengappi <= asIs.KolSeisekiSakuseiNengappi) {
        this.logger.info("既に最新の出走馬成績データが格納されています: " + asIs.Id);
        return;
      }
    }

    const shussouba = await this.saveShussouba(buffer, info);
    if (!shussouba) {
      return;
    }

    await this.saveShussoubaYosou(buffer, shussouba);

    await this.kolTool.saveShussoubaTsuukaJuni(buffer, 298, shussouba);
    if (!asIs.KolShutsubahyouSakuseiNengappi) {
      const tanshukuKishuMei = readStrWithNoSpace(buffer, 199, 8);
      const choukyou = new Choukyou();
      choukyou.Id = shussouba.Id;
      await this.choukyouTool.saveChoukyou(choukyou);
      await this.choukyouTool.saveChoukyouRireki(buffer, 307, choukyou, tanshukuKishuMei, 1);
    }
  }

  protected async saveShussouba(buffer: Buffer, info: ShussoubaInfo) {
    const toBe = this.kolRaceTool.createShussouba(buffer, 23);
    if (toBe) {
      return null;
    }
    toBe.Wakuban = readPositiveInt(buffer, 22, 1);
    toBe.Gate = readPositiveInt(buffer, 25, 2);
    const kyuusha = await this.kolTool.saveKyuusha(buffer, 217);
    toBe.KyousoubaId = (await this.kolTool.saveKyousouba(buffer, 34, kyuusha)).Kyousouba.Id;
    toBe.Nenrei = readPositiveInt(buffer, 67, 2);
    toBe.Blinker = $S.blinker.toCodeFromKol(buffer, 149, 1);
    toBe.Kinryou = readDouble(buffer, 150, 3, 0.1);
    toBe.Bataijuu = readPositiveInt(buffer, 153, 3);
    toBe.Zougen = readInt(buffer, 156, 3);
    toBe.KolRecordShisuu = readInt(buffer, 159, 3);
    toBe.KishuId = (await this.kolTool.saveKishu(buffer, 162, info.race.Nengappi)).Id;
    toBe.KishuTouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 207, 1);
    toBe.KishuShozokuBasho = $C.basho.toCodeFromKol(buffer, 208, 2);
    toBe.KishuShozokuKyuushaId = await this.kolTool.saveShozokuKyuusha(buffer, 210);
    toBe.MinaraiKubun = $S.minaraiKubun.toCodeFromKol(buffer, 215, 1);
    toBe.Norikawari = $S.norikawari.toCodeFromKol(buffer, 216, 1);
    toBe.Ninki = readPositiveInt(buffer, 267, 2);
    toBe.Odds = readDouble(buffer, 269, 5, 0.1);
    toBe.KakuteiChakujun = this.kolRaceTool.getChakujun(buffer, 274, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromKol(buffer, 276, 2);
    toBe.NyuusenChakujun = this.kolRaceTool.getChakujun(buffer, 278, 2);
    toBe.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromKol(buffer, 280, 1);
    toBe.RecordNinshiki = $S.recordNinshiki.toCodeFromKol(buffer, 281, 1);
    toBe.Time = readTime(buffer, 282, 4);
    toBe.Chakusa1 = readInt(buffer, 286, 2);
    toBe.Chakusa2 = $S.chakura2.toCodeFromKol(buffer, 288, 1);
    toBe.TimeSa = this.kolTool.getTimeSa(buffer, 289);
    if (1200 <= info.race.Kyori) {
      toBe.Ten3F = readDouble(buffer, 292, 3, 0.1);
      if (toBe.Time && toBe.Ten3F) {
        toBe.Ten3FIkou = toBe.Time - toBe.Ten3F;
      }
    }
    toBe.Agari3F = readDouble(buffer, 295, 3, 0.1);
    if (toBe.Time && toBe.Agari3F) {
      toBe.Agari3FIzen = toBe.Time - toBe.Agari3F;
    }
    if (1200 < info.race.Kyori && toBe.Ten3F && toBe.Agari3F) {
      toBe.Douchuu = toBe.Time - toBe.Ten3F - toBe.Agari3F;
    }
    toBe.YonCornerIchiDori = $S.ichi.toCodeFromKol(buffer, 306, 1);
    toBe.KolSeisekiSakuseiNengappi = readDate(buffer, 424, 8);

    const asIs = info.shussouba;
    return await this.tool.update(Shussouba, asIs, toBe);
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba) {
    const toBe = new ShussoubaYosou();
    toBe.Id = shussouba.Id;
    toBe.KolYosou1 = $S.yosou.toCodeFromKol(buffer, 265, 1);
    toBe.KolYosou2 = $S.yosou.toCodeFromKol(buffer, 266, 1);

    const asIs = await this.entityManager.findOneById(ShussoubaYosou, shussouba.Id);

    return await this.tool.update(ShussoubaYosou, asIs, toBe);
  }

}