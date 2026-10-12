import * as $C from "../../../converters/Common";
import * as $U from "../../../converters/Uma";
import { seisanshaDao } from "../../../daos/SeisanshaDao";
import { umaDao } from "../../../daos/UmaDao";
import { Kyousouba } from "../../../entities/Kyousouba";
import { Uma } from "../../../entities/Uma";
import { readPositiveInt, readStr } from "../../Reader";
import { tool } from "../../Tool";
import { jraTool } from "../JraTool";
import { jvdataKettouTool } from "./JvdataKettouTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 競走馬マスタ (UM)。
 * 3 代血統は繁殖登録番号でつなぐ (繁殖馬マスタ・産駒マスタと同じ馬になる)。
 * 馬主、賞金や着回数の累計、脚質傾向は取り込まない
 * (馬主は出走馬ごと、レースの成績は馬毎レース情報から取り込む)。
 */
export class JvdataUm extends JvdataRecord {
  public readonly id = "UM";
  public readonly length = 1609;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const touroku = jraTool.readTouroku(buffer, 11);
    const bamei = readStr(buffer, 46, 36);
    if (!touroku && !bamei) {
      return;
    }
    const seibetsu = $U.seibetsu.toCodeFromJvData(buffer, 200, 1);

    let uma = {} as Uma;
    if (touroku) {
      uma.KettouTourokuBangou = touroku.bangou;
    }
    jraTool.setBamei(uma, bamei);
    uma.EigoBamei = uma.EigoBamei ?? readStr(buffer, 118, 60) ?? undefined;
    uma.Seinengappi = readPositiveInt(buffer, 38, 8);
    uma.Seinen = uma.Seinengappi ? Math.floor(uma.Seinengappi / 10000) : touroku?.seinen;
    uma.Kesshu = $U.kesshu.toCodeFromJvData(buffer, 201, 1);
    uma.Seibetsu = seibetsu;
    uma.Keiro = $U.keiro.toCodeFromJvData(buffer, 202, 2);

    // 3 代血統は、繁殖登録番号と馬名がある
    const sosen = Array.from({ length: 14 }, (_, i) => ({
      bangou: jvdataKettouTool.readHanshokuBangou(buffer, 204 + i * 46),
      bamei: readStr(buffer, 204 + i * 46 + 10, 36),
    }));
    const pedigree = await jvdataKettouTool.saveSosen(await umaDao.findUma(uma), sosen);
    uma.ChichiUmaId = pedigree[0]?.Id;
    uma.HahaUmaId = pedigree[1]?.Id;
    uma.JvDataSeisanshaCode = jvdataKettouTool.readSeisanshaCode(buffer, 882);
    uma.SanchiMei = readStr(buffer, 962, 20);
    uma.MasshouFlag =
      readStr(buffer, 21, 1) === "1" ? $C.MasshouFlag.Massou : $C.MasshouFlag.Geneki;
    uma.MasshouNengappi = readPositiveInt(buffer, 30, 8);
    uma = await umaDao.saveUma(uma);

    const seisanshaMei = tool.normalizeHoujinMei(buffer, 890, 72);
    await seisanshaDao.saveSeisanba(uma.Id, {
      JvDataCode: uma.JvDataSeisanshaCode,
      meishou: seisanshaMei,
    });

    const choukyoushi = await jraTool.saveChoukyoushi(buffer, 849, 854);
    let kyousouba = {} as Kyousouba;
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromJvData(buffer, 198, 2);
    kyousouba.ChoukyoushiId = choukyoushi?.Id;
    kyousouba = await umaDao.saveKyousouba(kyousouba);
  }
}
