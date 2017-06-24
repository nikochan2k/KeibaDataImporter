import { Inject, Service } from "typedi";
import { DataToImport } from "../../DataToImport";
import { Race } from "../../../entities/Race";
import {
  readDate,
  readStr,
} from "../../Reader";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolSei3Kd3 extends DataToImport {

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 1050;
  }

  protected async save(buffer: Buffer) {
    const seisaiNaiyou = readStr(buffer, 44, 960);
    if (!seisaiNaiyou) {
      return;
    }
    const race = await this.kolRaceTool.getRace(buffer);
    /* tslint:disable:triple-equals */
    if (!race || race.Youbi == null) {
      this.logger.warn("レース成績データが存在しません: " + race.Id);
      return;
    }
    /* tslint:enable:triple-equals */
    let update = false;
    if (!race.SeisaiNaiyou) {
      update = true;
    } else if (race.KolSeisekiSakuseiNengappi) {
      const dataSakuseiNengappi = readDate(buffer, 1040, 8);
      if (race.KolSeisekiSakuseiNengappi < dataSakuseiNengappi && race.SeisaiNaiyou !== seisaiNaiyou) {
        update = true;
      }
    }
    if (update) {
      await this.entityManager
        .createQueryBuilder()
        .update(Race, { SeisaiNaiyou: seisaiNaiyou })
        .where("Id = :id")
        .setParameter("id", race.Id)
        .execute();
    }
  }
}