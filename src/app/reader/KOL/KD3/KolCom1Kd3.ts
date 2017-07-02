import { Inject, Service } from "typedi";
import { DataToImport } from "../../DataToImport";
import { Shussouba } from "../../../entities/Shussouba";
import {
  readStr,
} from "../../Reader";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolCom1Kd3 extends DataToImport {

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 3010;
  }

  protected async save(buffer: Buffer) {
    const info = await this.kolRaceTool.getShussoubaInfo(buffer, 70);
    if (!info) {
      return;
    }
    const shussouba = info.shussouba;
    const kishuKyuushaComment = readStr(buffer, 91, 960);
    const jisouhenoMemo = readStr(buffer, 1051, 960);
    if (!kishuKyuushaComment && !jisouhenoMemo) {
      this.logger.warn("騎手調教コメントも次走へのメモもありません: " + shussouba.Id);
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