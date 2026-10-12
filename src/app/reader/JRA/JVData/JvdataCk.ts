import {
  babaBunrui,
  ChakudosuuBunrui,
  ChakudosuuKikan,
  ChakudosuuTaishou,
  ChakudosuuTrack,
  keibajouBunrui,
  kyoriBunrui,
} from "../../../converters/Chakudosuu";
import * as $C from "../../../converters/Common";
import { banushiDao } from "../../../daos/BanushiDao";
import { choukyoushiDao } from "../../../daos/ChoukyoushiDao";
import { kishuDao } from "../../../daos/KishuDao";
import { seisanshaDao } from "../../../daos/SeisanshaDao";
import { umaDao } from "../../../daos/UmaDao";
import { upsertAll } from "../../../db/helpers";
import { Chakudosuu } from "../../../entities/Chakudosuu";
import { ChakudosuuShuukei } from "../../../entities/ChakudosuuShuukei";
import { Choukyoushi } from "../../../entities/Choukyoushi";
import { Kishu } from "../../../entities/Kishu";
import { Uma } from "../../../entities/Uma";
import { readInt, readPositiveInt, readStr, readStrWithNoSpace } from "../../Reader";
import { tool } from "../../Tool";
import { jraTool } from "../JraTool";
import { jvdataKettouTool } from "./JvdataKettouTool";
import { jvdataRaceTool } from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";

/** 騎手・調教師の本年・累計成績 1 つぶんのバイト数 */
const jinBlockLength = 1220;

/** 馬主・生産者の本年・累計成績 1 つぶんのバイト数 */
const shoyuushaBlockLength = 60;

/** 本年・累計の順 */
const kikanList = [ChakudosuuKikan.Honnen, ChakudosuuKikan.Ruikei];

type Key = Pick<Chakudosuu, "RaceId" | "UmaId" | "Taishou" | "Kikan">;

/**
 * 出走別着度数 (CK)。出走時点の、馬・騎手・調教師・馬主・生産者の着度数と賞金を、
 * (レース, 馬) ごとに Chakudosuu・ChakudosuuShuukei に入れる。
 * 騎手などのコードと名前は、騎手マスタなどと同じ人につなぐためだけに使う。
 */
export class JvdataCk extends JvdataRecord {
  public readonly id = "CK";
  public readonly length = 6870;

  private rows: Chakudosuu[] = [];

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const touroku = jraTool.readTouroku(buffer, 27);
    if (!touroku) {
      return;
    }
    const ensured = await jvdataRaceTool.ensureRace(buffer);
    if (!ensured) {
      return;
    }
    const toBe = {} as Uma;
    toBe.KettouTourokuBangou = touroku.bangou;
    toBe.Seinen = touroku.seinen;
    jraTool.setBamei(toBe, readStr(buffer, 37, 36));
    const uma = await umaDao.saveUma(toBe);
    const base = { RaceId: ensured.race.Id, UmaId: uma.Id };

    this.rows = [];
    const shuukei = [
      this.readUma(buffer, base),
      ...(await this.readJin(buffer, base, ChakudosuuTaishou.Kishu, 1384, 1423)),
      ...(await this.readJin(buffer, base, ChakudosuuTaishou.Choukyoushi, 3863, 3902)),
      ...(await this.readShoyuusha(buffer, base, ChakudosuuTaishou.Banushi, 6476)),
      ...(await this.readShoyuusha(buffer, base, ChakudosuuTaishou.Seisansha, 6748)),
    ];
    upsertAll(Chakudosuu, this.rows);
    upsertAll(ChakudosuuShuukei, shuukei);
  }

  /** 馬の着度数 (出走時点までの累計) */
  private readUma(buffer: Buffer, base: Pick<Key, "RaceId" | "UmaId">) {
    const key = { ...base, Taishou: ChakudosuuTaishou.Uma, Kikan: ChakudosuuKikan.Ruikei };
    this.push(key, ChakudosuuBunrui.Sougou, buffer, 127, 3);
    this.push(key, ChakudosuuBunrui.Chuuou, buffer, 145, 3);
    const tracks = [
      ChakudosuuBunrui.ShibaChokusen,
      ChakudosuuBunrui.ShibaMigi,
      ChakudosuuBunrui.ShibaHidari,
      ChakudosuuBunrui.DirtChokusen,
      ChakudosuuBunrui.DirtMigi,
      ChakudosuuBunrui.DirtHidari,
      ChakudosuuBunrui.Shougai,
    ];
    tracks.forEach((bunrui, i) => this.push(key, bunrui, buffer, 163 + i * 18, 3));
    for (let i = 0; i < 12; i++) {
      this.push(key, babaBunrui(Math.floor(i / 4), i % 4), buffer, 289 + i * 18, 3);
    }
    for (let i = 0; i < 18; i++) {
      this.push(key, kyoriBunrui(Math.floor(i / 9), i % 9), buffer, 505 + i * 18, 3);
    }
    for (let i = 0; i < 30; i++) {
      this.pushKeibajou(key, Math.floor(i / 10), i % 10, buffer, 829 + i * 18, 3);
    }
    const shoukin = (offset: number) => readInt(buffer, offset, 9, 100);
    const kyakushitsu = (i: number) => readInt(buffer, 1369 + i * 3, 3);
    return {
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
    } as ChakudosuuShuukei;
  }

  /** 騎手・調教師の本年・累計の着度数。コードがなければ読まない */
  private async readJin(
    buffer: Buffer,
    base: Pick<Key, "RaceId" | "UmaId">,
    taishou: ChakudosuuTaishou.Kishu | ChakudosuuTaishou.Choukyoushi,
    codeOffset: number,
    blockOffset: number,
  ) {
    const code = readStr(buffer, codeOffset, 5);
    if (!code || !/^\d{5}$/.test(code) || /^0+$/.test(code)) {
      return [];
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
    return kikanList.map((kikan, k) => {
      const b = blockOffset + k * jinBlockLength;
      const key = { ...base, Taishou: taishou, Kikan: kikan };
      this.push(key, ChakudosuuBunrui.Shiba, buffer, b + 44, 5);
      this.push(key, ChakudosuuBunrui.Dirt, buffer, b + 74, 5);
      this.push(key, ChakudosuuBunrui.Shougai, buffer, b + 104, 4);
      for (let i = 0; i < 18; i++) {
        this.push(key, kyoriBunrui(Math.floor(i / 9), i % 9), buffer, b + 128 + i * 24, 4);
      }
      for (let i = 0; i < 20; i++) {
        this.pushKeibajou(key, Math.floor(i / 10), i % 10, buffer, b + 560 + i * 24, 4);
      }
      for (let i = 0; i < 10; i++) {
        this.pushKeibajou(key, ChakudosuuTrack.Shougai, i, buffer, b + 1040 + i * 18, 3);
      }
      const shoukin = (offset: number) => readInt(buffer, b + offset, 10, 100);
      return {
        ...key,
        TaishouId: taishouId,
        Nen: readPositiveInt(buffer, b, 4),
        HeichiHonShoukin: shoukin(4),
        ShougaiHonShoukin: shoukin(14),
        HeichiFukaShoukin: shoukin(24),
        ShougaiFukaShoukin: shoukin(34),
      } as ChakudosuuShuukei;
    });
  }

  /** 馬主・生産者の本年・累計の着度数 (中央)。コードがなければ読まない */
  private async readShoyuusha(
    buffer: Buffer,
    base: Pick<Key, "RaceId" | "UmaId">,
    taishou: ChakudosuuTaishou.Banushi | ChakudosuuTaishou.Seisansha,
    blockOffset: number,
  ) {
    let taishouId: number | undefined;
    if (taishou === ChakudosuuTaishou.Banushi) {
      const code = jvdataKettouTool.readBanushiCode(buffer, 6342);
      if (!code) {
        return [];
      }
      const meishou = tool.normalizeHoujinMei(buffer, 6412, 64);
      taishouId = (await banushiDao.saveBanushi({ JvDataCode: code, meishou }))?.Id;
    } else {
      const code = jvdataKettouTool.readSeisanshaCode(buffer, 6596);
      if (!code) {
        return [];
      }
      const meishou = tool.normalizeHoujinMei(buffer, 6676, 72);
      taishouId = (await seisanshaDao.saveSeisansha({ JvDataCode: code, meishou }))?.Id;
    }
    return kikanList.map((kikan, k) => {
      const b = blockOffset + k * shoyuushaBlockLength;
      const key = { ...base, Taishou: taishou, Kikan: kikan };
      this.push(key, ChakudosuuBunrui.Chuuou, buffer, b + 24, 6);
      return {
        ...key,
        TaishouId: taishouId,
        Nen: readPositiveInt(buffer, b, 4),
        HonShoukin: readInt(buffer, b + 4, 10, 100),
        FukaShoukin: readInt(buffer, b + 14, 10, 100),
      } as ChakudosuuShuukei;
    });
  }

  /** 競馬場別の着度数。競馬場は 札幌・函館・福島・新潟・東京・中山・中京・京都・阪神・小倉 の順 */
  private pushKeibajou(
    key: Key,
    track: ChakudosuuTrack,
    index: number,
    buffer: Buffer,
    offset: number,
    width: number,
  ) {
    const basho = $C.basho.toCodeFromJvData(String(index + 1).padStart(2, "0")) as number;
    this.push(key, keibajouBunrui(track, basho), buffer, offset, width);
  }

  /** 1 着〜5 着と着外の 6 つの回数 (それぞれ width バイト、空白は 0)。全部 0 なら行を作らない */
  private push(key: Key, bunrui: number, buffer: Buffer, offset: number, width: number) {
    const counts = Array.from(
      { length: 6 },
      (_, i) => readInt(buffer, offset + i * width, width) ?? 0,
    );
    if (counts.every((c) => c === 0)) {
      return;
    }
    this.rows.push({
      ...key,
      Bunrui: bunrui,
      Chaku1: counts[0],
      Chaku2: counts[1],
      Chaku3: counts[2],
      Chaku4: counts[3],
      Chaku5: counts[4],
      Chakugai: counts[5],
    });
  }
}
