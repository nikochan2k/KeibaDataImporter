import { findOneBy, updateBy } from "../../../db/helpers";
import { RaceSeiseki } from "../../../entities/RaceSeiseki";
import { DataToImport } from "../../DataToImport";
import { readStr } from "../../Reader";
import { kolRaceTool } from "../KolRaceTool";

export class KolSei3Kd3 extends DataToImport {
  protected getBufferLength() {
    return 1050;
  }

  public async save(buffer: Buffer) {
    const seisaiNaiyou = readStr(buffer, 44, 960);
    if (!seisaiNaiyou) {
      return;
    }
    const id = kolRaceTool.getRaceId(buffer);
    if (id === null) {
      return;
    }
    const asIs = await findOneBy(RaceSeiseki, { Id: id });
    if (asIs && !asIs.SeisaiNaiyou) {
      updateBy(RaceSeiseki, { Id: id }, { SeisaiNaiyou: seisaiNaiyou });
    }
  }
}
