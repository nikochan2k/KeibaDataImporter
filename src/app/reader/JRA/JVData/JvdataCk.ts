import {
  babaBunrui,
  ChakudosuuBunrui,
  ChakudosuuKikan,
  ChakudosuuTaishou,
  ChakudosuuTrack,
  jvdataKyori,
  keibajouBunrui,
  kyoriBunrui,
} from "../../../converters/Chakudosuu";
import * as $C from "../../../converters/Common";
import { banushiDao } from "../../../daos/BanushiDao";
import { ChakudosuuWriter } from "../../../daos/ChakudosuuDao";
import { choukyoushiDao } from "../../../daos/ChoukyoushiDao";
import { kishuDao } from "../../../daos/KishuDao";
import { seisanshaDao } from "../../../daos/SeisanshaDao";
import { umaDao } from "../../../daos/UmaDao";
import { Choukyoushi } from "../../../entities/Choukyoushi";
import { Kishu } from "../../../entities/Kishu";
import { Uma } from "../../../entities/Uma";
import { readInt, readPositiveInt, readStr, readStrWithNoSpace } from "../../Reader";
import { tool } from "../../Tool";
import { jraTool } from "../JraTool";
import { jvdataKettouTool } from "./JvdataKettouTool";
import { JvdataRecord } from "./JvdataRecord";

/** 騎手・調教師の本年・累計成績 1 つぶんのバイト数 */
const jinBlockLength = 1220;

/** 馬主・生産者の本年・累計成績 1 つぶんのバイト数 */
const shoyuushaBlockLength = 60;

/** 本年・累計の順 */
const kikanList = [ChakudosuuKikan.Honnen, ChakudosuuKikan.Ruikei];

/** 競馬場別の並び (札幌・函館・福島・新潟・東京・中山・中京・京都・阪神・小倉) の i 番目の場所 */
function bashoAt(i: number) {
  return $C.basho.toCodeFromJvData(String(i + 1).padStart(2, "0")) as number;
}

/**
 * 出走別着度数 (CK)。出走時点 (レースの日) の、馬・騎手・調教師・馬主・生産者の着度数と賞金を、
 * Chakudosuu・ChakudosuuShuukei に入れる。回数は 1 着〜5 着と 6 着以下。
 * 騎手などのコードと名前は、騎手マスタなどと同じ人につなぐためだけに使う。
 */
export class JvdataCk extends JvdataRecord {
  public readonly id = "CK";
  public readonly length = 6870;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const touroku = jraTool.readTouroku(buffer, 27);
    const nengappi = readPositiveInt(buffer, 11, 8);
    if (!touroku || !nengappi) {
      return;
    }
    const toBe = {} as Uma;
    toBe.KettouTourokuBangou = touroku.bangou;
    toBe.Seinen = touroku.seinen;
    jraTool.setBamei(toBe, readStr(buffer, 37, 36));
    const uma = await umaDao.saveUma(toBe);

    const writer = new ChakudosuuWriter();
    this.addUma(writer, buffer, uma.Id, nengappi);
    await this.addJin(writer, buffer, nengappi, ChakudosuuTaishou.Kishu, 1384, 1423);
    await this.addJin(writer, buffer, nengappi, ChakudosuuTaishou.Choukyoushi, 3863, 3902);
    await this.addShoyuusha(writer, buffer, nengappi, ChakudosuuTaishou.Banushi, 6476);
    await this.addShoyuusha(writer, buffer, nengappi, ChakudosuuTaishou.Seisansha, 6748);
    writer.save();
  }

  /** 馬の着度数 (出走時点までの累計) */
  private addUma(writer: ChakudosuuWriter, buffer: Buffer, umaId: number, nengappi: number) {
    const key = {
      Taishou: ChakudosuuTaishou.Uma,
      TaishouId: umaId,
      Nengappi: nengappi,
      Kikan: ChakudosuuKikan.Ruikei,
    };
    const add = (bunrui: number, offset: number) => writer.add(key, bunrui, buffer, offset, 3, 6);
    add(ChakudosuuBunrui.Sougou, 127);
    add(ChakudosuuBunrui.Chuuou, 145);
    [
      ChakudosuuBunrui.ShibaChokusen,
      ChakudosuuBunrui.ShibaMigi,
      ChakudosuuBunrui.ShibaHidari,
      ChakudosuuBunrui.DirtChokusen,
      ChakudosuuBunrui.DirtMigi,
      ChakudosuuBunrui.DirtHidari,
      ChakudosuuBunrui.Shougai,
    ].forEach((bunrui, i) => add(bunrui, 163 + i * 18));
    for (let i = 0; i < 12; i++) {
      add(babaBunrui(Math.floor(i / 4), i % 4), 289 + i * 18);
    }
    for (let i = 0; i < 18; i++) {
      add(kyoriBunrui(Math.floor(i / 9), jvdataKyori, i % 9), 505 + i * 18);
    }
    for (let i = 0; i < 30; i++) {
      add(keibajouBunrui(Math.floor(i / 10), bashoAt(i % 10)), 829 + i * 18);
    }
    const shoukin = (offset: number) => readInt(buffer, offset, 9, 100);
    const kyakushitsu = (i: number) => readInt(buffer, 1369 + i * 3, 3);
    writer.addShuukei({
      ...key,
      HeichiHonShoukin: shoukin(73),
      ShougaiHonShoukin: shoukin(82),
      HeichiFukaShoukin: shoukin(91),
      ShougaiFukaShoukin: shoukin(100),
      HeichiShuutokuShoukin: shoukin(109),
      ShougaiShuutokuShoukin: shoukin(118),
      Nige: kyakushitsu(0),
      Senkou: kyakushitsu(1),
      Sashi: kyakushitsu(2),
      Oikomi: kyakushitsu(3),
      TourokuRaceSuu: readInt(buffer, 1381, 3),
    });
  }

  /** 騎手・調教師の本年・累計の着度数。コードがなければ読まない */
  private async addJin(
    writer: ChakudosuuWriter,
    buffer: Buffer,
    nengappi: number,
    taishou: ChakudosuuTaishou.Kishu | ChakudosuuTaishou.Choukyoushi,
    codeOffset: number,
    blockOffset: number,
  ) {
    const code = readStr(buffer, codeOffset, 5);
    if (!code || !/^\d{5}$/.test(code) || /^0+$/.test(code)) {
      return;
    }
    // 姓名は「姓＋全角空白＋名」
    const seimei = readStrWithNoSpace(buffer, codeOffset + 5, 34) ?? undefined;
    const taishouId =
      taishou === ChakudosuuTaishou.Kishu
        ? (await kishuDao.saveKishu({ JvDataKishuCode: code } as Kishu, seimei)).Id
        : (
            await choukyoushiDao.saveChoukyoushi(
              { JvDataChoukyoushiCode: code } as Choukyoushi,
              seimei,
            )
          ).Id;
    kikanList.forEach((kikan, k) => {
      const b = blockOffset + k * jinBlockLength;
      const key = { Taishou: taishou, TaishouId: taishouId, Nengappi: nengappi, Kikan: kikan };
      const add = (bunrui: number, offset: number, width: number) =>
        writer.add(key, bunrui, buffer, b + offset, width, 6);
      add(ChakudosuuBunrui.Shiba, 44, 5);
      add(ChakudosuuBunrui.Dirt, 74, 5);
      add(ChakudosuuBunrui.Shougai, 104, 4);
      for (let i = 0; i < 18; i++) {
        add(kyoriBunrui(Math.floor(i / 9), jvdataKyori, i % 9), 128 + i * 24, 4);
      }
      for (let i = 0; i < 20; i++) {
        add(keibajouBunrui(Math.floor(i / 10), bashoAt(i % 10)), 560 + i * 24, 4);
      }
      for (let i = 0; i < 10; i++) {
        add(keibajouBunrui(ChakudosuuTrack.Shougai, bashoAt(i)), 1040 + i * 18, 3);
      }
      const shoukin = (offset: number) => readInt(buffer, b + offset, 10, 100);
      writer.addShuukei({
        ...key,
        Nen: readPositiveInt(buffer, b, 4),
        HeichiHonShoukin: shoukin(4),
        ShougaiHonShoukin: shoukin(14),
        HeichiFukaShoukin: shoukin(24),
        ShougaiFukaShoukin: shoukin(34),
      });
    });
  }

  /** 馬主・生産者の本年・累計の着度数 (中央)。コードがなければ読まない */
  private async addShoyuusha(
    writer: ChakudosuuWriter,
    buffer: Buffer,
    nengappi: number,
    taishou: ChakudosuuTaishou.Banushi | ChakudosuuTaishou.Seisansha,
    blockOffset: number,
  ) {
    const saved =
      taishou === ChakudosuuTaishou.Banushi
        ? await this.saveBanushi(buffer)
        : await this.saveSeisansha(buffer);
    if (!saved) {
      return;
    }
    kikanList.forEach((kikan, k) => {
      const b = blockOffset + k * shoyuushaBlockLength;
      const key = { Taishou: taishou, TaishouId: saved.Id, Nengappi: nengappi, Kikan: kikan };
      writer.add(key, ChakudosuuBunrui.Chuuou, buffer, b + 24, 6, 6);
      writer.addShuukei({
        ...key,
        Nen: readPositiveInt(buffer, b, 4),
        HonShoukin: readInt(buffer, b + 4, 10, 100),
        FukaShoukin: readInt(buffer, b + 14, 10, 100),
      });
    });
  }

  private saveBanushi(buffer: Buffer) {
    const code = jvdataKettouTool.readBanushiCode(buffer, 6342);
    const meishou = tool.normalizeHoujinMei(buffer, 6412, 64);
    return code ? banushiDao.saveBanushi({ JvDataCode: code, meishou }) : null;
  }

  private saveSeisansha(buffer: Buffer) {
    const code = jvdataKettouTool.readSeisanshaCode(buffer, 6596);
    const meishou = tool.normalizeHoujinMei(buffer, 6676, 72);
    return code ? seisanshaDao.saveSeisansha({ JvDataCode: code, meishou }) : null;
  }
}
