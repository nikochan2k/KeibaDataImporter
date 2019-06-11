import { Inject } from "typedi";
import { KishuDao } from "../../daos/KishuDao";
import { Kishu } from "../../entities/Kishu";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readInt, readPositiveInt, readStr } from "../Reader";

export abstract class K$$ extends DataToImport {

  @Inject()
  private kishuDao: KishuDao;

  public async save(buffer: Buffer, bridge: Bridge) {
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
    await this.kishuDao.saveKishu(kishu, kishuMei, tanshukuKishuMei, furigana);
  }

}