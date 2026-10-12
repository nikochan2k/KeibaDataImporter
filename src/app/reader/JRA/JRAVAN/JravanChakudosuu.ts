import {
  babaBunrui,
  ChakudosuuBunrui,
  ChakudosuuKikan,
  type ChakudosuuTaishou,
  ChakudosuuTrack,
  jravanKyori,
  keibajouBunrui,
  kyoriBunrui,
} from "../../../converters/Chakudosuu";
import * as $C from "../../../converters/Common";
import type { ChakudosuuKey, ChakudosuuWriter } from "../../../daos/ChakudosuuDao";
import { readInt } from "../../Reader";

/** 競馬場別の並び (競馬場コード 01〜10: 札幌・函館・福島・新潟・東京・中山・中京・京都・阪神・小倉) の i 番目の場所 */
function bashoAt(i: number) {
  return $C.basho.toCodeFromJravan(String(i + 1).padStart(2, "0")) as number;
}

/** 本年・前年ぶんの項目の位置 */
export interface JravanSeisekiOffsets {
  /** 平地本賞金・平地付加賞金・障害本賞金・障害付加賞金 (各 7 バイト、千円) の先頭 */
  shoukin: number;
  /** 平地着回数・障害着回数 (各 12 バイト) の先頭 */
  chakukaisuu: number;
  /** 競馬場別 x10 (平地・障害 各 12 バイト) の先頭 */
  keibajou: number;
  /** 距離別 (芝・ダート 各 3 区分、各 12 バイト) の先頭。ないときは省略 */
  kyori?: number;
}

/**
 * JRA-VAN の騎手・調教師の成績 (生涯・本年・前年)。回数は 1 着・2 着・3 着・4 着以下。
 * nengappi はデータ作成年月日で、本年はその年、前年はその前の年。
 */
export function addJravanJinSeiseki(
  writer: ChakudosuuWriter,
  buffer: Buffer,
  taishou: ChakudosuuTaishou,
  taishouId: number,
  nengappi: number,
  shougaiOffset: number,
  honnen: JravanSeisekiOffsets,
  zennen: JravanSeisekiOffsets,
) {
  const base = { Taishou: taishou, TaishouId: taishouId, Nengappi: nengappi };
  const ruikei = { ...base, Kikan: ChakudosuuKikan.Ruikei };
  writer.add(ruikei, ChakudosuuBunrui.Heichi, buffer, shougaiOffset, 5);
  writer.add(ruikei, ChakudosuuBunrui.Shougai, buffer, shougaiOffset + 20, 5);

  const nen = Math.floor(nengappi / 10000);
  for (const [kikan, o, year] of [
    [ChakudosuuKikan.Honnen, honnen, nen],
    [ChakudosuuKikan.Zennen, zennen, nen - 1],
  ] as const) {
    const key: ChakudosuuKey = { ...base, Kikan: kikan };
    writer.add(key, ChakudosuuBunrui.Heichi, buffer, o.chakukaisuu, 3);
    writer.add(key, ChakudosuuBunrui.Shougai, buffer, o.chakukaisuu + 12, 3);
    for (let i = 0; i < 10; i++) {
      const basho = bashoAt(i);
      writer.add(
        key,
        keibajouBunrui(ChakudosuuTrack.Heichi, basho),
        buffer,
        o.keibajou + i * 24,
        3,
      );
      writer.add(
        key,
        keibajouBunrui(ChakudosuuTrack.Shougai, basho),
        buffer,
        o.keibajou + i * 24 + 12,
        3,
      );
    }
    if (o.kyori !== undefined) {
      addJravanKyori(writer, key, buffer, o.kyori);
    }
    const shoukin = (i: number) => readInt(buffer, o.shoukin + i * 7, 7, 1000);
    writer.addShuukei({
      ...key,
      Nen: year,
      HeichiHonShoukin: shoukin(0),
      HeichiFukaShoukin: shoukin(1),
      ShougaiHonShoukin: shoukin(2),
      ShougaiFukaShoukin: shoukin(3),
    });
  }
}

/** 距離別 (芝・ダート 各 〜1600・1601〜2200・2201〜) */
export function addJravanKyori(
  writer: ChakudosuuWriter,
  key: ChakudosuuKey,
  buffer: Buffer,
  offset: number,
) {
  for (let i = 0; i < 6; i++) {
    const bunrui = kyoriBunrui(Math.floor(i / 3), jravanKyori, i % 3);
    writer.add(key, bunrui, buffer, offset + i * 12, 3);
  }
}

/** 競走馬の馬場別・馬場状態別 (芝右・芝左・ダ右・ダ左・障害、芝・ダ・障害の 良〜不良) */
export function addJravanUmaBaba(
  writer: ChakudosuuWriter,
  key: ChakudosuuKey,
  buffer: Buffer,
  offset: number,
) {
  [
    ChakudosuuBunrui.ShibaMigi,
    ChakudosuuBunrui.ShibaHidari,
    ChakudosuuBunrui.DirtMigi,
    ChakudosuuBunrui.DirtHidari,
    ChakudosuuBunrui.Shougai,
  ].forEach((bunrui, i) => {
    writer.add(key, bunrui, buffer, offset + i * 12, 3);
  });
  for (let i = 0; i < 12; i++) {
    writer.add(key, babaBunrui(Math.floor(i / 4), i % 4), buffer, offset + 60 + i * 12, 3);
  }
}
