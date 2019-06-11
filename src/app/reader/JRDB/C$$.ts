import { Inject } from "typedi";
import * as $C from "../../converters/Common";
import { ChoukyoushiDao } from "../../daos/ChoukyoushiDao";
import { Choukyoushi } from "../../entities/Choukyoushi";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readInt, readPositiveInt, readStr } from "../Reader";

export abstract class C$$ extends DataToImport {

  @Inject()
  private choukyoushiDao: ChoukyoushiDao;

  public async save(buffer: Buffer, bridge: Bridge) {
    const toBe = new Choukyoushi();
    toBe.JrdbChoukyoushiCode = readInt(buffer, 0, 5);
    toBe.MenkyoMasshouNengappi = readInt(buffer, 6, 8);
    const choukyoushiMei = readStr(buffer, 14, 12);
    const furigana = readStr(buffer, 26, 30);
    const tanshuku = readStr(buffer, 56, 6);
    toBe.TouzaiBetsu = $C.touzaiBetsu.toCodeFromJrdb(buffer, 62, 1);
    toBe.ShozokuBasho = $C.basho.toCodeFromJrdb(buffer, 63, 4);
    if (!toBe.ShozokuBasho) {
      toBe.ShozokuBashoMei = readStr(buffer, 63, 4);
    }
    toBe.Seinengappi = readPositiveInt(buffer, 67, 8);
    toBe.HatsuMenkyoNen = readPositiveInt(buffer, 75, 4);
    await this.choukyoushiDao.saveChoukyoushi(toBe, choukyoushiMei, tanshuku, furigana);
  }

}