import { choukyoushiDao } from "../../../daos/ChoukyoushiDao";
import { Choukyoushi } from "../../../entities/Choukyoushi";
import { DataToImport } from "../../DataToImport";
import { readPositiveInt, readStr, readStrWithNoSpace } from "../../Reader";

/** 調教師 (JracChok.dat)。近走重賞勝鞍と成績の集計は取り込まない。 */
export class JravanChok extends DataToImport {
  protected getBufferLength() {
    return 906;
  }

  public async save(buffer: Buffer) {
    const code = readStr(buffer, 0, 5);
    if (!code || !/^\d{5}$/.test(code)) {
      return;
    }
    const choukyoushi = new Choukyoushi();
    choukyoushi.JvDataChoukyoushiCode = code;
    choukyoushi.Seinengappi = readPositiveInt(buffer, 80, 8);
    choukyoushi.HatsuMenkyoNen = readPositiveInt(buffer, 114, 4);
    // 東西区分 1:東 2:西。調教師の東西別は 1:西 2:東
    const touzai = readPositiveInt(buffer, 88, 1);
    choukyoushi.TouzaiBetsu = touzai === 1 ? 2 : touzai === 2 ? 1 : undefined;
    if (readStr(buffer, 13, 1) === "1") {
      choukyoushi.MenkyoMasshouNengappi = readPositiveInt(buffer, 14, 8);
    }
    choukyoushi.ShoutaiKubun = readPositiveInt(buffer, 89, 1);
    // 招待区分があるときの地域名 (外国は招待国名、地方は所属地名)
    choukyoushi.ShozokuBashoMei = readStr(buffer, 90, 24);
    const kanji = readStrWithNoSpace(buffer, 22, 32);
    const tanshuku = readStrWithNoSpace(buffer, 72, 8);
    const furigana = readStr(buffer, 54, 18);
    await choukyoushiDao.saveChoukyoushi(choukyoushi, kanji, tanshuku, furigana);
  }
}
