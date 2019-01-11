import { Inject, Service } from "typedi";
import { RaceSeiseki } from "../../../entities/RaceSeiseki";
import { DataToImport } from "../../DataToImport";
import { readStr } from "../../Reader";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolSei3Kd3 extends DataToImport {

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 1050;
  }

  public async save(buffer: Buffer) {
    const seisaiNaiyou = readStr(buffer, 44, 960);
    if (!seisaiNaiyou) {
      return;
    }
    const id = this.kolRaceTool.getRaceId(buffer);
    const asIs = await this.entityManager.findOne(RaceSeiseki, id);
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