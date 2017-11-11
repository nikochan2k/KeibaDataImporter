import { Inject, Service } from "typedi";
import { DataToImport } from "../../DataToImport";
import { Shussouba } from "../../../entities/Shussouba";
import {
  readStr,
} from "../../Reader";
import { KolShussoubaTool } from "../KolShussoubaTool";

@Service()
export class KolCom1Kd3 extends DataToImport {

  @Inject()
  private kolShussoubaTool: KolShussoubaTool;

  protected getBufferLength() {
    return 3010;
  }

  public async save(buffer: Buffer) {
    const info = await this.kolShussoubaTool.getShussoubaInfo(buffer, 70);
    if (!info || !info.shussouba) {
      return;
    }
    const shussouba = info.shussouba;
    const kishuKyuushaComment = readStr(buffer, 91, 960);
    const jisouhenoMemo = readStr(buffer, 1051, 960);
    if (!kishuKyuushaComment && !jisouhenoMemo) {
      return;
    }
    const updateSet: any = {};
    if (!shussouba.KishuKyuushaComment && kishuKyuushaComment) {
      updateSet.KishuChoukyouComment = kishuKyuushaComment;
    }
    if (!shussouba.JisouhenoMemo && jisouhenoMemo) {
      updateSet.JisouhenoMemo = jisouhenoMemo;
    }
    if (0 < Object.keys(updateSet).length) {
      await this.entityManager
        .createQueryBuilder()
        .update(Shussouba, updateSet)
        .where("Id = :id")
        .setParameter("id", shussouba.Id)
        .execute();
    }
  }
}