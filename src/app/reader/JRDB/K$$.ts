import * as $K from "../../converters/Kishu";
import { kishuDao } from "../../daos/KishuDao";
import { Kishu } from "../../entities/Kishu";
import { readInt, readPositiveInt, readStr } from "../Reader";
import { JrdbData } from "./JrdbData";

export abstract class K$$ extends JrdbData {
  public async save(buffer: Buffer) {
    await this.saveKishu(buffer);
  }

  public async saveKishu(buffer: Buffer) {
    const kishu = new Kishu();
    kishu.JrdbKishuCode = readInt(buffer, 0, 5);
    const kishuMei = readStr(buffer, 14, 12);
    const furigana = readStr(buffer, 26, 30);
    const tanshukuKishuMei = readStr(buffer, 56, 6);
    kishu.Seinengappi = readPositiveInt(buffer, 67, 8);
    kishu.MenkyoKoufuNengappi = readPositiveInt(buffer, 75, 4);
    kishu.Shozoku = $K.shozoku.toCodeFromJrdb(buffer, 62, 1);
    kishu.MinaraiKubun = $K.minaraiKubun.toCodeFromJrdb(buffer, 79, 1);
    await kishuDao.saveKishu(kishu, kishuMei, tanshukuKishuMei, furigana);
  }
}
