import { findOneBy } from "../../db/helpers";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { DataToImport } from "../DataToImport";
import { readStr } from "../Reader";
import { tool } from "../Tool";
import { kolShussoubaTool } from "./KolShussoubaTool";

export class KolCom1 extends DataToImport {
  protected getBufferLength() {
    return 3010;
  }

  public async save(buffer: Buffer) {
    const rs = kolShussoubaTool.getRaceShussoubaId(buffer, 70);
    const asIs = await findOneBy(ShussoubaSeiseki, { Id: rs.shussoubaId });
    if (!asIs) {
      return;
    }
    const toBe = {} as ShussoubaSeiseki;
    toBe.Id = asIs.Id;
    toBe.KishuKyuushaComment = readStr(buffer, 91, 960);
    toBe.JisouhenoMemo = readStr(buffer, 1051, 960);
    await tool.saveOrUpdate(ShussoubaSeiseki, asIs, toBe);
  }
}
