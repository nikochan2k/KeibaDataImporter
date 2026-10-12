import * as $U from "../../../converters/Uma";
import { seisanshaDao } from "../../../daos/SeisanshaDao";
import { umaDao } from "../../../daos/UmaDao";
import { Uma } from "../../../entities/Uma";
import { readPositiveInt, readStr } from "../../Reader";
import { jraTool } from "../JraTool";
import { jvdataKettouTool } from "./JvdataKettouTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 産駒マスタ (SK)。血統登録番号で馬を引き、3 代血統を繁殖登録番号でつなぐ。
 * 馬名はない (競走馬マスタか繁殖馬マスタから取り込む)。生産者はコードだけで、生産者マスタでつながる。
 */
export class JvdataSk extends JvdataRecord {
  public readonly id = "SK";
  public readonly length = 208;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const touroku = jraTool.readTouroku(buffer, 11);
    if (!touroku) {
      return;
    }
    const uma = {} as Uma;
    uma.KettouTourokuBangou = touroku.bangou;
    uma.Seinengappi = readPositiveInt(buffer, 21, 8);
    uma.Seinen = uma.Seinengappi ? Math.floor(uma.Seinengappi / 10000) : touroku.seinen;
    uma.Seibetsu = $U.seibetsu.toCodeFromJvData(buffer, 29, 1);
    uma.Kesshu = $U.kesshu.toCodeFromJvData(buffer, 30, 1);
    uma.Keiro = $U.keiro.toCodeFromJvData(buffer, 31, 2);
    uma.YunyuubaFlag = $U.yunyuubaFlag.toCodeFromJvData(buffer, 33, 1);
    uma.YunyuuNen = readPositiveInt(buffer, 34, 4);
    uma.JvDataSeisanshaCode = jvdataKettouTool.readSeisanshaCode(buffer, 38);
    uma.SanchiMei = readStr(buffer, 46, 20);

    const sosen = Array.from({ length: 14 }, (_, i) => ({
      bangou: jvdataKettouTool.readHanshokuBangou(buffer, 66 + i * 10),
      bamei: null,
    }));
    const pedigree = await jvdataKettouTool.saveSosen(await umaDao.findUma(uma), sosen);
    uma.ChichiUmaId = pedigree[0]?.Id;
    uma.HahaUmaId = pedigree[1]?.Id;
    const saved = await umaDao.saveUma(uma);
    // 生産者名はない。生産者マスタを取り込んでいれば、コードでつなぐ
    await seisanshaDao.saveSeisanba(saved.Id, { JvDataCode: uma.JvDataSeisanshaCode });
  }
}
