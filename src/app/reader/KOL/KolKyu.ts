import { ChakudosuuTaishou } from "../../converters/Chakudosuu";
import * as $CK from "../../converters/Choukyoushi";
import * as $C from "../../converters/Common";
import { ChakudosuuWriter } from "../../daos/ChakudosuuDao";
import { choukyoushiDao } from "../../daos/ChoukyoushiDao";
import { Choukyoushi } from "../../entities/Choukyoushi";
import { DataToImport } from "../DataToImport";
import { readInt, readPositiveInt, readStr } from "../Reader";
import { addKolJinSeiseki } from "./KolChakudosuu";

/** 厩舎データ。成績 (通算累計・本年・昨年) は着度数に入れる */
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
    const saved = await choukyoushiDao.saveChoukyoushi(
      choukyoushi,
      choukyoushiMei,
      tanshuku,
      furigana,
    );

    const nengappi = readPositiveInt(buffer, 110, 8);
    if (nengappi) {
      const writer = new ChakudosuuWriter();
      addKolJinSeiseki(
        writer,
        buffer,
        ChakudosuuTaishou.Choukyoushi,
        saved.Id,
        nengappi,
        158,
        198,
        722,
        false,
      );
      writer.save();
    }
  }
}
