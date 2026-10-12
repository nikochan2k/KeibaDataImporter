import {
  babaBunrui,
  ChakudosuuBunrui,
  ChakudosuuKikan,
  ChakudosuuTaishou,
  jravanKyori,
  kyoriBunrui,
} from "../../../converters/Chakudosuu";
import * as $C from "../../../converters/Common";
import * as $U from "../../../converters/Uma";
import { banushiDao } from "../../../daos/BanushiDao";
import { ChakudosuuWriter } from "../../../daos/ChakudosuuDao";
import { seisanshaDao } from "../../../daos/SeisanshaDao";
import { umaDao } from "../../../daos/UmaDao";
import { Kyousouba } from "../../../entities/Kyousouba";
import { Uma } from "../../../entities/Uma";
import { readInt, readPositiveInt, readStr } from "../../Reader";
import { tool } from "../../Tool";
import { jraTool } from "../JraTool";
import { jvdataKettouTool } from "./JvdataKettouTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 競走馬マスタ (UM)。
 * 3 代血統は繁殖登録番号でつなぐ (繁殖馬マスタ・産駒マスタと同じ馬になる)。
 * 馬主は、データ作成年月日の時点の馬の馬主にする。
 * 着回数・賞金の累計と脚質傾向は、データ作成年月日の時点の着度数に入れる。
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

    // 馬主は、データ作成年月日の時点の馬主
    const banushi = {
      JvDataCode: jvdataKettouTool.readBanushiCode(buffer, 982),
      meishou: tool.normalizeHoujinMei(buffer, 988, 64),
    };
    const sakuseiNengappi = readPositiveInt(buffer, 3, 8);
    if (sakuseiNengappi) {
      await banushiDao.saveUmaBanushi(uma.Id, sakuseiNengappi, banushi);
    } else {
      await banushiDao.saveBanushi(banushi);
    }

    if (sakuseiNengappi) {
      this.saveChakudosuu(buffer, uma.Id, sakuseiNengappi);
    }

    const choukyoushi = await jraTool.saveChoukyoushi(buffer, 849, 854);
    let kyousouba = {} as Kyousouba;
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromJvData(buffer, 198, 2);
    kyousouba.ChoukyoushiId = choukyoushi?.Id;
    kyousouba = await umaDao.saveKyousouba(kyousouba);
  }

  /** 馬の着度数 (データ作成年月日時点までの累計) と賞金・脚質傾向 */
  private saveChakudosuu(buffer: Buffer, umaId: number, nengappi: number) {
    const writer = new ChakudosuuWriter();
    const key = {
      Taishou: ChakudosuuTaishou.Uma,
      TaishouId: umaId,
      Nengappi: nengappi,
      Kikan: ChakudosuuKikan.Ruikei,
    };
    const add = (bunrui: number, offset: number) => writer.add(key, bunrui, buffer, offset, 3, 6);
    add(ChakudosuuBunrui.Sougou, 1106);
    add(ChakudosuuBunrui.Chuuou, 1124);
    [
      ChakudosuuBunrui.ShibaChokusen,
      ChakudosuuBunrui.ShibaMigi,
      ChakudosuuBunrui.ShibaHidari,
      ChakudosuuBunrui.DirtChokusen,
      ChakudosuuBunrui.DirtMigi,
      ChakudosuuBunrui.DirtHidari,
      ChakudosuuBunrui.Shougai,
    ].forEach((bunrui, i) => add(bunrui, 1142 + i * 18));
    for (let i = 0; i < 12; i++) {
      add(babaBunrui(Math.floor(i / 4), i % 4), 1268 + i * 18);
    }
    for (let i = 0; i < 6; i++) {
      add(kyoriBunrui(Math.floor(i / 3), jravanKyori, i % 3), 1484 + i * 18);
    }
    const shoukin = (offset: number) => readInt(buffer, offset, 9, 100);
    const kyakushitsu = (i: number) => readInt(buffer, 1592 + i * 3, 3);
    writer.addShuukei({
      ...key,
      HeichiHonShoukin: shoukin(1052),
      ShougaiHonShoukin: shoukin(1061),
      HeichiFukaShoukin: shoukin(1070),
      ShougaiFukaShoukin: shoukin(1079),
      HeichiShuutokuShoukin: shoukin(1088),
      ShougaiShuutokuShoukin: shoukin(1097),
      Nige: kyakushitsu(0),
      Senkou: kyakushitsu(1),
      Sashi: kyakushitsu(2),
      Oikomi: kyakushitsu(3),
      TourokuRaceSuu: readInt(buffer, 1604, 3),
    });
    writer.save();
  }
}
