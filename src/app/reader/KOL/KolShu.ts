import { ChakudosuuBunrui, ChakudosuuKikan, ChakudosuuTaishou } from "../../converters/Chakudosuu";
import * as $C from "../../converters/Common";
import * as $U from "../../converters/Uma";
import { ChakudosuuWriter } from "../../daos/ChakudosuuDao";
import { umaDao } from "../../daos/UmaDao";
import { Uma } from "../../entities/Uma";
import { DataToImport } from "../DataToImport";
import { readInt, readPositiveInt, readStr } from "../Reader";
import { tool } from "../Tool";
import { addKolSeiseki, readKolRentaiKyakushitsu } from "./KolChakudosuu";
import { kolUmaTool } from "./KolUmaTool";

/** 種牡馬データ。産駒の成績 (本年・昨年) は、種牡馬の産駒の着度数に入れる */
export class KolShu extends DataToImport {
  protected getBufferLength() {
    return 2010;
  }

  public async save(buffer: Buffer) {
    const uma = {} as Uma;
    uma.KolUmaCode = readInt(buffer, 0, 7);
    const bamei = readStr(buffer, 7, 34);
    if (tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.Seinen = readPositiveInt(buffer, 41, 4);
    uma.Keiro = $U.keiro.toCodeFromKol(buffer, 45, 2);
    uma.Sanchi = $U.sanch.toCodeFromKol(buffer, 47, 3);
    uma.YunyuubaFlag = $U.yunyuubaFlag.toCodeFromKol(buffer, 50, 1);
    uma.Seibetsu = $U.Seibetsu.Boba;
    const chichiUma = await kolUmaTool.saveOyaUma(buffer, 51, $U.Seibetsu.Boba);
    uma.ChichiUmaId = chichiUma?.Id;
    const hahaUma = await kolUmaTool.saveOyaUma(buffer, 92, $U.Seibetsu.Hinba);
    uma.HahaUmaId = hahaUma?.Id;
    uma.KyoriTekisei = $U.kyoriTekisei.toCodeFromKol(buffer, 133, 1);
    uma.OmoKousetsu = $C.hyouka.toCodeFromKol(buffer, 134, 1);
    uma.DirtKousetsu = $C.hyouka.toCodeFromKol(buffer, 135, 1);
    uma.ShibouNen = readPositiveInt(buffer, 136, 4);
    const saved = await umaDao.saveUma(uma);
    this.saveSankuSeiseki(buffer, saved.Id);
  }

  /**
   * 産駒の成績 (本年・昨年)。どちらも年齢別 (2 歳・3 歳・4 歳以上)、連対脚質別回数、
   * 平地芝・平地ダ・障害、馬場状態別、距離別の並び。回数は各 4 バイト
   */
  private saveSankuSeiseki(buffer: Buffer, umaId: number) {
    const nengappi = readPositiveInt(buffer, 480, 8);
    if (!nengappi) {
      return;
    }
    const writer = new ChakudosuuWriter();
    const nen = Math.floor(nengappi / 10000);
    for (const [kikan, b, year] of [
      [ChakudosuuKikan.Honnen, 488, nen],
      [ChakudosuuKikan.Zennen, 1248, nen - 1],
    ] as const) {
      const key = {
        Taishou: ChakudosuuTaishou.Sanku,
        TaishouId: umaId,
        Nengappi: nengappi,
        Kikan: kikan,
      };
      [ChakudosuuBunrui.Nenrei2, ChakudosuuBunrui.Nenrei3, ChakudosuuBunrui.Nenrei4Ijou].forEach(
        (bunrui, i) => writer.add(key, bunrui, buffer, b + i * 16, 4),
      );
      [ChakudosuuBunrui.Shiba, ChakudosuuBunrui.Dirt, ChakudosuuBunrui.Shougai].forEach(
        (bunrui, i) => writer.add(key, bunrui, buffer, b + 64 + i * 16, 4),
      );
      addKolSeiseki(writer, key, buffer, { babaJoutai: b + 112, kyori: b + 304 }, 4);
      writer.addShuukei({ ...key, Nen: year, ...readKolRentaiKyakushitsu(buffer, b + 48, 4) });
    }
    writer.save();
  }
}
