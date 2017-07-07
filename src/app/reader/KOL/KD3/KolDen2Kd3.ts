import { Inject, Service } from "typedi";
import * as $S from "../../../converters/Shussouba";
import { Race } from "../../../entities/Race";
import { Shussouba } from "../../../entities/Shussouba";
import { DataCache } from "../../DataCache";
import { DataToImport } from "../../DataToImport";
import {
  readDate,
  readDouble,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
} from "../../Reader";
import { KolChoukyouTool } from "../KolChoukyouTool";
import { KolRaceTool } from "../KolRaceTool";
import { KolTool } from "../KolTool";

@Service()
export class KolDen2Kd3 extends DataToImport {

  @Inject()
  private choukyouTool: KolChoukyouTool;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 1000;
  }

  protected async save(buffer: Buffer, cache: DataCache) {
    const info = await this.kolRaceTool.getShussoubaInfo(buffer, 23);
    if (!info) {
      return;
    }
    const shussouba = info.shussouba;
    const dataSakuseiNengappi = readDate(buffer, 727, 8);
    if (shussouba.KolShutsubahyouSakuseiNengappi) {
      if (dataSakuseiNengappi <= shussouba.KolSeisekiSakuseiNengappi) {
        this.logger.info("既に最新の出走馬成績データが格納されています: " + shussouba.Id);
        return;
      }
    }
    shussouba.KolShutsubahyouSakuseiNengappi = dataSakuseiNengappi;

    await this.saveShussouba(buffer, info.race, shussouba, cache);
    const tanshukuKishuMei = readStrWithNoSpace(buffer, 188, 8);
    await this.saveChoukyou(buffer, shussouba, tanshukuKishuMei);
  }

  protected async saveShussouba(buffer: Buffer, race: Race, shussouba: Shussouba, cache: DataCache) {
    if (!shussouba.KolSeisekiSakuseiNengappi) {
      shussouba.Wakuban = readPositiveInt(buffer, 22, 1);
      const kyuusha = await this.kolTool.saveKyuusha(buffer, 206);
      shussouba.KyousoubaId = (await this.kolTool.saveKyousouba(buffer, 32, kyuusha)).Kyousouba.Id;
      shussouba.Nenrei = readPositiveInt(buffer, 65, 2);
      shussouba.Blinker = $S.blinker.toCodeFromKol(buffer, 147, 1);
      shussouba.Kinryou = readDouble(buffer, 148, 3, 0.1);
      shussouba.KijouId = (await this.kolTool.saveKijou(buffer, 151, race.Nengappi)).Id;
      shussouba.Norikawari = $S.norikawari.toCodeFromKol(buffer, 205, 1);
    }

    shussouba.KolYosou1 = $S.yosou.toCodeFromKol(buffer, 254, 1);
    shussouba.KolYosou2 = $S.yosou.toCodeFromKol(buffer, 255, 1);
    shussouba.ChoukyouTanpyou = readStr(buffer, 694, 24);
    shussouba.ChoukyouHonsuuCourse = readPositiveInt(buffer, 718, 3);
    shussouba.ChoukyouHonsuuHanro = readPositiveInt(buffer, 721, 3);
    shussouba.ChoukyouHonsuuPool = readPositiveInt(buffer, 724, 3);
    shussouba.Rating = readDouble(buffer, 739, 3, 0.1);
    shussouba.KyuuyouRiyuu = readStr(buffer, 783, 60);
    shussouba.KyuuyouRiyuuCode = $S.kyuuyouRiyuuCode.toCodeFromKol(buffer, 783, 60);
    shussouba.YosouTenkai = cache.getYosouTenkai(shussouba.Id);

    await this.entityManager.save(shussouba);
  }

  protected async saveChoukyou(buffer: Buffer, shussouba: Shussouba, tanshukuKishuMei: string) {
    const choukyouAwaseFlag = readPositiveInt(buffer, 607, 1);
    const choukyouAwase = readStr(buffer, 608, 86);
    await this.choukyouTool.saveChoukyou(buffer, 256, shussouba, tanshukuKishuMei, 1,
      choukyouAwaseFlag === 1 ? choukyouAwase : null);
    await this.choukyouTool.saveChoukyou(buffer, 373, shussouba, tanshukuKishuMei, 2,
      choukyouAwaseFlag === 2 ? choukyouAwase : null);
    await this.choukyouTool.saveChoukyou(buffer, 490, shussouba, tanshukuKishuMei, 3,
      choukyouAwaseFlag === 3 ? choukyouAwase : null);
  }

}