import { Inject, Service } from "typedi";
import * as $S from "../../../converters/Shussouba";
import { Race } from "../../../entities/Race";
import { Shussouba } from "../../../entities/Shussouba";
import { DataCache } from "../../DataCache";
import { DataToImport } from "../../DataToImport";
import { Tool } from "../../Tool";
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
  private tool: Tool;

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
    const asIs = info.shussouba;
    if (asIs) {
      const dataSakuseiNengappi = readDate(buffer, 727, 8);
      if (dataSakuseiNengappi <= asIs.KolSeisekiSakuseiNengappi) {
        this.logger.info("既に最新の出走馬成績データが格納されています: " + asIs.Id);
        return;
      }
    }

    const shussouba = await this.saveShussouba(buffer, info.race, asIs, cache);
    if (!shussouba) {
      return;
    }
    const tanshukuKishuMei = readStrWithNoSpace(buffer, 188, 8);
    await this.saveChoukyou(buffer, shussouba, tanshukuKishuMei);
  }

  protected async saveShussouba(buffer: Buffer, race: Race, asIs: Shussouba, cache: DataCache) {
    let toBe = this.kolRaceTool.createShussouba(buffer, 23);
    if (toBe) {
      return null;
    }

    if (!asIs || !asIs.KolSeisekiSakuseiNengappi) {
      toBe.Wakuban = readPositiveInt(buffer, 22, 1);
      const kyuusha = await this.kolTool.saveKyuusha(buffer, 206);
      toBe.KyousoubaId = (await this.kolTool.saveKyousouba(buffer, 32, kyuusha)).Kyousouba.Id;
      toBe.Nenrei = readPositiveInt(buffer, 65, 2);
      toBe.Blinker = $S.blinker.toCodeFromKol(buffer, 147, 1);
      toBe.Kinryou = readDouble(buffer, 148, 3, 0.1);
      toBe.KijouId = (await this.kolTool.saveKijou(buffer, 151, race.Nengappi)).Id;
      toBe.Norikawari = $S.norikawari.toCodeFromKol(buffer, 205, 1);
    }

    toBe.KolYosou1 = $S.yosou.toCodeFromKol(buffer, 254, 1);
    toBe.KolYosou2 = $S.yosou.toCodeFromKol(buffer, 255, 1);
    toBe.ChoukyouTanpyou = readStr(buffer, 694, 24);
    toBe.ChoukyouHonsuuCourse = readPositiveInt(buffer, 718, 3);
    toBe.ChoukyouHonsuuHanro = readPositiveInt(buffer, 721, 3);
    toBe.ChoukyouHonsuuPool = readPositiveInt(buffer, 724, 3);
    toBe.KolShutsubahyouSakuseiNengappi = readDate(buffer, 727, 8);
    toBe.Rating = readDouble(buffer, 739, 3, 0.1);
    toBe.KyuuyouRiyuu = readStr(buffer, 783, 60);
    toBe.KyuuyouRiyuuCode = $S.kyuuyouRiyuuCode.toCodeFromKol(buffer, 783, 60);
    toBe.YosouTenkai = cache.getYosouTenkai(toBe.Id);

    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, true);
      if (updateSet) {
        await this.entityManager
          .createQueryBuilder()
          .update(Shussouba, updateSet)
          .where("Id = :id")
          .setParameter("id", asIs.Id)
          .execute();
      }
      toBe = asIs;
    } else {
      toBe = await this.entityManager.save(toBe);
    }
    return toBe;
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