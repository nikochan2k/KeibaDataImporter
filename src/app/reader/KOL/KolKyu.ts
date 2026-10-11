import * as $CK from "../../converters/Choukyoushi";
import * as $C from "../../converters/Common";
import { choukyoushiDao } from "../../daos/ChoukyoushiDao";
import { Choukyoushi } from "../../entities/Choukyoushi";
import { DataToImport } from "../DataToImport";
import { readInt, readStr } from "../Reader";

export class KolKyu extends DataToImport {
  protected getBufferLength() {
    return 1248;
  }

  public async save(buffer: Buffer) {
    const choukyoushi = {} as Choukyoushi;
    choukyoushi.KolKyuushaCode = readInt(buffer, 0, 5);
    choukyoushi.Seinengappi = readInt(buffer, 93, 8);
    choukyoushi.HatsuMenkyoNen = readInt(buffer, 101, 4);
    choukyoushi.TouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 105, 1);
    choukyoushi.ShozokuBasho = $C.basho.toCodeFromKol(buffer, 106, 2);
    choukyoushi.RitsuHokuNanBetsu = $CK.ritsuHokuNanBetsu.toCodeFromKol(buffer, 108, 1);
    const choukyoushiMei = readStr(buffer, 5, 32);
    const tanshuku = readStr(buffer, 37, 8);
    const furigana = readStr(buffer, 45, 48);
    await choukyoushiDao.saveChoukyoushi(choukyoushi, choukyoushiMei, tanshuku, furigana);
  }
}
