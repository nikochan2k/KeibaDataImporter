import { Inject, Service } from "typedi";
import { DataToImport } from "../../DataToImport";
import { Race } from "../../../entities/Race";
import {
  readStr,
} from "../../Reader";
import { KolImportTool } from "../KolImportTool";

@Service()
export class KolSei3Kd3 extends DataToImport {

  @Inject()
  private kolImportTool: KolImportTool;

  protected getBufferLength() {
    return 1050;
  }

  public async save(buffer: Buffer) {
    const seisaiNaiyou = readStr(buffer, 44, 960);
    if (!seisaiNaiyou) {
      return;
    }
    const kaisaiId = this.kolImportTool.getKaisaiId(buffer);
    const race = await this.kolImportTool.getRace(buffer, kaisaiId);
    if (!race) {
      const raceId = this.kolImportTool.getRaceId(buffer, kaisaiId);
      this.logger.warn("レース成績データが存在しません: " + raceId);
      return;
    }
    if (!race.SeisaiNaiyou) {
      await this.entityManager
        .createQueryBuilder()
        .update(Race, { SeisaiNaiyou: seisaiNaiyou })
        .where("Id = :id")
        .setParameter("id", race.Id)
        .execute();
    }
  }
}