import { Inject, Service } from "typedi";
import * as $S from "../../../converters/Shussouba";
import { Race } from "../../../entities/Race";
import { Shussouba } from "../../../entities/Shussouba";
import { DataToImport } from "../../DataToImport";
import { DataTool } from "../../DataTool";
import {
  readDate,
  readDouble,
  readInt,
  readPositiveInt,
  readStrWithNoSpace,
  readTime
} from "../../Reader";
import { KolChoukyouTool } from "../KolChoukyouTool";
import { KolRaceTool } from "../KolRaceTool";
import { KolTool } from "../KolTool";

@Service()
export class KolSei2Kd3 extends DataToImport {

  @Inject()
  private choukyouTool: KolChoukyouTool;

  @Inject()
  private tool: DataTool;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 600;
  }

  protected async save(buffer: Buffer) {
    const info = await this.kolRaceTool.getShussoubaInfo(buffer, 23);
    if (!info) {
      return;
    }
    const shussouba = info.shussouba;
    const dataSakuseiNengappi = readDate(buffer, 424, 8);
    if (shussouba.KolSeisekiSakuseiNengappi) {
      if (dataSakuseiNengappi <= shussouba.KolSeisekiSakuseiNengappi) {
        this.logger.info("既に最新の出走馬成績データが格納されています: " + shussouba.Id);
        return;
      }
    }
    shussouba.KolSeisekiSakuseiNengappi = dataSakuseiNengappi;

    await this.saveShussouba(buffer, info.race, shussouba);
    await this.kolTool.saveShussoubaTsuukaJuni(buffer, 298, shussouba);
    if (!shussouba.KolShutsubahyouSakuseiNengappi) {
      const tanshukuKishuMei = readStrWithNoSpace(buffer, 199, 8);
      await this.choukyouTool.saveChoukyou(buffer, 307, shussouba, tanshukuKishuMei, 1);
    }
  }

  protected async saveShussouba(buffer: Buffer, race: Race, shussouba: Shussouba) {
    shussouba.Wakuban = readPositiveInt(buffer, 22, 1);
    shussouba.Gate = readPositiveInt(buffer, 25, 2);
    const kyuusha = await this.kolTool.saveKyuusha(buffer, 217);
    shussouba.KyousoubaId = (await this.kolTool.saveKyousouba(buffer, 34, kyuusha)).Kyousouba.Id;
    shussouba.Nenrei = readPositiveInt(buffer, 67, 2);
    shussouba.Blinker = $S.blinker.toCodeFromKol(buffer, 149, 1);
    shussouba.Kinryou = readDouble(buffer, 150, 3, 0.1);
    shussouba.Bataijuu = readPositiveInt(buffer, 153, 3);
    shussouba.Zougen = readInt(buffer, 156, 3);
    const kijouId = (await this.kolTool.saveKijou(buffer, 162, race.Nengappi)).Id;
    if (shussouba.KijouId && shussouba.KijouId !== kijouId) {
      shussouba.KyuuKijouId = shussouba.KijouId;
    }
    shussouba.KijouId = kijouId;
    shussouba.Norikawari = $S.norikawari.toCodeFromKol(buffer, 216, 1);
    shussouba.Ninki = readPositiveInt(buffer, 267, 2);
    shussouba.Odds = readDouble(buffer, 269, 5, 0.1);
    shussouba.KakuteiChakujun = this.tool.getChakujun(buffer, 274, 2);
    shussouba.ChakujunFuka = $S.chakujunFuka.toCodeFromKol(buffer, 276, 2);
    shussouba.NyuusenChakujun = this.tool.getChakujun(buffer, 278, 2);
    shussouba.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromKol(buffer, 280, 1);
    shussouba.RecordNinshiki = $S.recordNinshiki.toCodeFromKol(buffer, 281, 1);
    shussouba.Time = readTime(buffer, 282, 4);
    shussouba.Chakusa1 = readInt(buffer, 286, 2);
    shussouba.Chakusa2 = $S.chakura2.toCodeFromKol(buffer, 288, 1);
    shussouba.TimeSa = this.kolTool.getTimeSa(buffer, 289);
    if (1200 <= race.Kyori) {
      shussouba.Ten3F = readDouble(buffer, 292, 3, 0.1);
      if (shussouba.Time && shussouba.Ten3F) {
        shussouba.Ten3FIkou = shussouba.Time - shussouba.Ten3F;
      }
    }
    shussouba.Agari3F = readDouble(buffer, 295, 3, 0.1);
    if (shussouba.Time && shussouba.Agari3F) {
      shussouba.Agari3FIzen = shussouba.Time - shussouba.Agari3F;
    }
    if (1200 < race.Kyori && shussouba.Ten3F && shussouba.Agari3F) {
      shussouba.Chuukan = shussouba.Time - shussouba.Ten3F - shussouba.Agari3F;
    }
    shussouba.YonCornerIchiDori = $S.yonCornerIchiDori.toCodeFromKol(buffer, 306, 1);

    if (!shussouba.KolShutsubahyouSakuseiNengappi) {
      shussouba.KolRecordShisuu = readInt(buffer, 159, 3);
      shussouba.KolYosou1 = $S.yosou.toCodeFromKol(buffer, 265, 1);
      shussouba.KolYosou2 = $S.yosou.toCodeFromKol(buffer, 266, 1);
    }

    await this.entityManager.save(shussouba);
  }

}