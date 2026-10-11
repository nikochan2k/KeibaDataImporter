import { Inject, Injectable } from "@nestjs/common";
import { RaceSeiseki } from "../../../entities/RaceSeiseki";
import { DataToImport } from "../../DataToImport";
import { readStr } from "../../Reader";
import { KolRaceTool } from "../KolRaceTool";

@Injectable()
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
    if (id === null) {
      return;
    }
    const asIs = await this.entityManager.findOneBy(RaceSeiseki, { Id: id });
    if (asIs && !asIs.SeisaiNaiyou) {
      await this.entityManager
        .createQueryBuilder()
        .update(RaceSeiseki, { SeisaiNaiyou: seisaiNaiyou })
        .where("Id = :id")
        .setParameter("id", id)
        .execute();
    }
  }
}
