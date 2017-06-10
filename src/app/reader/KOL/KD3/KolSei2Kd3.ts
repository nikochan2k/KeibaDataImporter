import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import * as $S from "../../../converters/Shussouba";
import * as $SF from "../../../converters/ShussoubaYosou";
import { Race } from "../../../entities/Race";
import { Shussouba } from "../../../entities/Shussouba";
import { ShussoubaTsuukaJuni } from "../../../entities/ShussoubaTsuukaJuni";
import { DataCache } from "../../DataCache";
import { DataToImport } from "../../DataToImport";
import { DataTool } from "../../DataTool";
import {
  readDate,
  readDouble,
  readInt,
  readPositiveInt,
  readTime
} from "../../Reader";
import { KolChoukyouTool } from "../KolChoukyouTool";
import { KolTool } from "../KolTool";

@Service()
export class KolSei2Kd3 extends DataToImport {

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private choukyouTool: KolChoukyouTool;

  @Inject()
  private tool: DataTool;

  @Inject()
  private kolTool: KolTool;

  protected getBufferLength() {
    return 600;
  }

  protected async deleteOld(shussouba: Shussouba) {
    await this.entityManager
      .createQueryBuilder(ShussoubaTsuukaJuni, "stj")
      .delete()
      .where("stj.ShussoubaId = :shussoubaId")
      .setParameter("shussoubaId", shussouba.Id)
      .execute();
  }

  protected async save(buffer: Buffer, cache: DataCache) {
    const race = new Race();
    race.Id = this.kolTool.getRaceId(buffer);
    const umaban = readPositiveInt(buffer, 23, 2);
    if (umaban === null) {
      this.logger.warn("馬番がありません");
      return null;
    }
    const id = race.Id * 100 + umaban;
    let shussouba = await this.entityManager.findOneById(Shussouba, id);
    const dataSakuseiNengappi = readDate(buffer, 424, 8);
    if (shussouba) {
      if (shussouba.KolSeisekiSakuseiNengappi) {
        if (dataSakuseiNengappi <= shussouba.KolSeisekiSakuseiNengappi) {
          this.logger.debug("既に最新の出走馬成績データが格納されています: " + id);
          return;
        } else {
          await this.deleteOld(shussouba);
        }
      }
    } else {
      shussouba = new Shussouba();
      shussouba.Id = id;
    }
    shussouba.Race = race;
    shussouba.Umaban = umaban;
    shussouba.KolSeisekiSakuseiNengappi = dataSakuseiNengappi;

    await this.saveShussouba(buffer, shussouba, cache);
    await this.saveShussoubaTsuukaJuni(buffer, shussouba);
    if (!shussouba.KolShutsubahyouSakuseiNengappi) {
      await this.choukyouTool.saveChoukyou(buffer, shussouba, 307, 1);
    }
  }

  protected getTimeSa(buffer: Buffer, offset: number) {
    const timeSa = readDouble(buffer, offset, 3, 0.1);
    if (99.8 <= timeSa) {
      return 0.0;
    }
    return timeSa;
  }

  protected async saveShussouba(buffer: Buffer, shussouba: Shussouba, cache: DataCache) {
    shussouba.Wakuban = readPositiveInt(buffer, 22, 1);
    shussouba.Gate = readPositiveInt(buffer, 25, 2);
    shussouba.Kyousouba = await this.kolTool.saveUma(buffer, 34);
    shussouba.Nenrei = readPositiveInt(buffer, 67, 2);
    shussouba.Blinker = $S.blinker.toCodeFromKol(buffer, 149, 1);
    shussouba.Kinryou = readDouble(buffer, 150, 3, 0.1);
    shussouba.Bataijuu = readPositiveInt(buffer, 153, 3);
    shussouba.Zougen = readInt(buffer, 156, 3);
    shussouba.Kishu = await this.kolTool.saveKishu(buffer, 162);
    shussouba.Norikawari = $S.norikawari.toCodeFromKol(buffer, 216, 1);
    shussouba.Kyuusha = await this.kolTool.saveKyuusha(buffer, 217);
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
    shussouba.TimeSa = this.getTimeSa(buffer, 289);
    if (1200 <= shussouba.Race.Kyori) {
      shussouba.Ten3F = readDouble(buffer, 292, 3, 0.1);
      if (shussouba.Time && shussouba.Ten3F) {
        shussouba.Ten3FIkou = shussouba.Time - shussouba.Ten3F;
      }
    }
    shussouba.Agari3F = readDouble(buffer, 295, 3, 0.1);
    if (shussouba.Time && shussouba.Agari3F) {
      shussouba.Agari3FIzen = shussouba.Time - shussouba.Agari3F;
    }
    if (1200 < shussouba.Race.Kyori && shussouba.Ten3F && shussouba.Agari3F) {
      shussouba.Chuukan = shussouba.Time - shussouba.Ten3F - shussouba.Agari3F;
    }
    shussouba.YonCornerIchiDori = $S.yonCornerIchiDori.toCodeFromKol(buffer, 306, 1);

    if (!shussouba.KolShutsubahyouSakuseiNengappi) {
      shussouba.KolRecordShisuu = readInt(buffer, 159, 3);
      shussouba.KolYosou1 = $SF.yosou.toCodeFromKol(buffer, 265, 1);
      shussouba.KolYosou2 = $SF.yosou.toCodeFromKol(buffer, 266, 1);
    }

    await this.entityManager.persist(shussouba);

    const shussoubaKeika = cache.getKeika(shussouba.Id);
    if (shussoubaKeika) {
      await this.entityManager.persist(shussoubaKeika);
    }
  }

  protected async saveShussoubaTsuukaJuni(buffer: Buffer, shussouba: Shussouba) {
    for (let bangou = 1, offset = 298; bangou <= 4; bangou++ , offset += 2) {
      const shussoubaTsuukaJuni = new ShussoubaTsuukaJuni();

      const juni = readPositiveInt(buffer, offset, 2);
      if (juni === null) {
        continue;
      }
      if (1 <= juni && juni <= 28) {
        shussoubaTsuukaJuni.Juni = juni;
      } else if (juni === 31 || juni === 32) {
        shussoubaTsuukaJuni.Joukyou = juni;
      } else if (41 <= juni && juni <= 68) {
        shussoubaTsuukaJuni.Juni = juni - 40;
        shussoubaTsuukaJuni.Joukyou = 40;
      } else {
        this.logger.warn("不正な順位: " + juni);
        continue;
      }

      shussoubaTsuukaJuni.Id = shussouba.Id * 10 + bangou;
      shussoubaTsuukaJuni.Shussouba = shussouba;
      shussoubaTsuukaJuni.Bangou = bangou;
      await this.entityManager.persist(shussoubaTsuukaJuni);
    }
  }

}