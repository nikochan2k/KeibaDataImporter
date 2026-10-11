import { kishuDao } from "../../daos/KishuDao";
import { Kishu } from "../../entities/Kishu";
import { DataToImport } from "../DataToImport";
import { readInt, readStr } from "../Reader";

export class KolKis extends DataToImport {
  protected getBufferLength() {
    return 1729;
  }

  public async save(buffer: Buffer) {
    let kishu = {} as Kishu;
    kishu.KolKishuCode = readInt(buffer, 0, 5);
    kishu.Seinengappi = readInt(buffer, 93, 8);
    kishu.MenkyoKoufuNengappi = readInt(buffer, 101, 4);
    const kishuMei = readStr(buffer, 5, 32);
    const tanshukuKishuMei = readStr(buffer, 37, 8);
    const furigana = readStr(buffer, 45, 48);
    kishu = await kishuDao.saveKishu(kishu, kishuMei, tanshukuKishuMei, furigana);
  }
}
