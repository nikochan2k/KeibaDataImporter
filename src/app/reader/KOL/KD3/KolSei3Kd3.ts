import { Inject, Service } from "typedi";
import { DataToImport } from "../../DataToImport";
import { RaceSeiseki } from "../../../entities/RaceSeiseki";
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
    const id = this.kolImportTool.getRaceId(buffer);
    const asIs = await this.entityManager.findOneById(RaceSeiseki, id);
    if (!asIs.SeisaiNaiyou) {
      await this.entityManager
        .createQueryBuilder()
        .update(RaceSeiseki, { SeisaiNaiyou: seisaiNaiyou })
        .where("Id = :id")
        .setParameter("id", id)
        .execute();
    }
  }
}