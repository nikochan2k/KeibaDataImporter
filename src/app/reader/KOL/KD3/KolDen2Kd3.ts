import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import * as $S from "../../../converters/Shussouba";
import { Race } from "../../../entities/Race";
import { Shussouba } from "../../../entities/Shussouba";
import { Choukyou } from "../../../entities/Choukyou";
import { DataToImport } from "../../DataToImport";
import { DataCache } from "../../DataCache";
import {
  readStr,
  readDate,
  readDouble,
  readPositiveInt
} from "../../Reader";
import { KolChoukyouTool } from "../KolChoukyouTool";
import { KolTool } from "../KolTool";

@Service()
export class KolDen2Kd3 extends DataToImport {

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private choukyouTool: KolChoukyouTool;

  @Inject()
  private kolTool: KolTool;

  protected getBufferLength() {
    return 1000;
  }

  protected async deleteOld(shussouba: Shussouba) {
    await this.entityManager
      .createQueryBuilder(Choukyou, "c")
      .delete()
      .where("c.ShussoubaId = :shussoubaId")
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
    const dataSakuseiNengappi = readDate(buffer, 727, 8);
    if (shussouba) {
      if (shussouba.KolShutsubahyouSakuseiNengappi) {
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
    shussouba.KolShutsubahyouSakuseiNengappi = dataSakuseiNengappi;

    await this.saveShussouba(buffer, shussouba, cache);
    await this.saveChoukyou(buffer, shussouba);
  }

  protected async saveShussouba(buffer: Buffer, shussouba: Shussouba, cache: DataCache) {
    if (!shussouba.KolSeisekiSakuseiNengappi) {
      shussouba.Wakuban = readPositiveInt(buffer, 22, 1);
      shussouba.Kyousouba = await this.kolTool.saveUma(buffer, 32);
      shussouba.Nenrei = readPositiveInt(buffer, 65, 2);
      shussouba.Blinker = $S.blinker.toCodeFromKol(buffer, 147, 1);
      shussouba.Kinryou = readDouble(buffer, 148, 3, 0.1);
      shussouba.Kishu = await this.kolTool.saveKishu(buffer, 151);
      shussouba.Norikawari = $S.norikawari.toCodeFromKol(buffer, 205, 1);
      shussouba.Kyuusha = await this.kolTool.saveKyuusha(buffer, 206);
    }

    shussouba.KolYosou1 = $S.yosou.toCodeFromKol(buffer, 254, 1);
    shussouba.KolYosou2 = $S.yosou.toCodeFromKol(buffer, 255, 1);
    shussouba.ChoukyouTanpyou = readStr(buffer, 694, 24);
    shussouba.ChoukyouHonsuuCourse = readPositiveInt(buffer, 718, 3);
    shussouba.ChoukyouHonsuuHanro = readPositiveInt(buffer, 721, 3);
    shussouba.ChoukyouHonsuuPool = readPositiveInt(buffer, 724, 3);
    shussouba.Rating = readDouble(buffer, 739, 3, 0.1);
    shussouba.KyuuyouRiyuu = readStr(buffer, 783, 60);
    shussouba.YosouTenkai = cache.getYosouTenkai(shussouba.Id);

    await this.entityManager.persist(shussouba);
  }

  protected async saveChoukyou(buffer: Buffer, shussouba: Shussouba) {
    const choukyouAwaseFlag = readPositiveInt(buffer, 607, 1);
    const choukyouAwase = readStr(buffer, 608, 86);
    await this.choukyouTool.saveChoukyou(buffer, 256, shussouba, 1,
      choukyouAwaseFlag === 1 ? choukyouAwase : null);
    await this.choukyouTool.saveChoukyou(buffer, 373, shussouba, 2,
      choukyouAwaseFlag === 2 ? choukyouAwase : null);
    await this.choukyouTool.saveChoukyou(buffer, 490, shussouba, 3,
      choukyouAwaseFlag === 3 ? choukyouAwase : null);
  }

}