import {
  ChakudosuuBunrui,
  ChakudosuuKikan,
  ChakudosuuTaishou,
  ChakudosuuTrack,
  jravanKyori,
  keibajouBunrui,
  kyoriBunrui,
} from "../../../converters/Chakudosuu";
import * as $C from "../../../converters/Common";
import { type ChakudosuuKey, ChakudosuuWriter } from "../../../daos/ChakudosuuDao";
import { readInt, readPositiveInt } from "../../Reader";

/** 馬主・生産者の成績ブロック (設定年、本賞金合計、付加賞金合計、着回数) 1 つぶんのバイト数 */
const shoyuushaBlockLength = 60;

/** 競馬場別の並び (札幌・函館・福島・新潟・東京・中山・中京・京都・阪神・小倉) の i 番目の場所 */
export function bashoAt(i: number) {
  return $C.basho.toCodeFromJvData(String(i + 1).padStart(2, "0")) as number;
}

/**
 * 騎手・調教師の成績ブロックのうち、CK・KS・CH で並びが同じ部分 (設定年と賞金)。
 * 賞金は 10 バイトで百円単位。
 */
export function addJinShuukei(
  writer: ChakudosuuWriter,
  key: ChakudosuuKey,
  buffer: Buffer,
  b: number,
) {
  const shoukin = (offset: number) => readInt(buffer, b + offset, 10, 100);
  writer.addShuukei({
    ...key,
    Nen: readPositiveInt(buffer, b, 4),
    HeichiHonShoukin: shoukin(4),
    ShougaiHonShoukin: shoukin(14),
    HeichiFukaShoukin: shoukin(24),
    ShougaiFukaShoukin: shoukin(34),
  });
}

/**
 * 馬主・生産者の本年・累計 (60 バイトのブロックが 2 つ並ぶ) の着度数 (中央)。CK・BN・BR で並びが同じ。
 * taishouId が分からないときは何もしない。
 */
export function addShoyuushaBlocks(
  writer: ChakudosuuWriter,
  buffer: Buffer,
  taishou: ChakudosuuTaishou.Banushi | ChakudosuuTaishou.Seisansha,
  taishouId: number,
  nengappi: number,
  blockOffset: number,
) {
  [ChakudosuuKikan.Honnen, ChakudosuuKikan.Ruikei].forEach((kikan, k) => {
    const b = blockOffset + k * shoyuushaBlockLength;
    const key = { Taishou: taishou, TaishouId: taishouId, Nengappi: nengappi, Kikan: kikan };
    writer.add(key, ChakudosuuBunrui.Chuuou, buffer, b + 24, 6, 6);
    writer.addShuukei({
      ...key,
      Nen: readPositiveInt(buffer, b, 4),
      HonShoukin: readInt(buffer, b + 4, 10, 100),
      FukaShoukin: readInt(buffer, b + 14, 10, 100),
    });
  });
}

/**
 * 騎手マスタ・調教師マスタの本年・前年・累計成績 (1052 バイトのブロックが 3 つ並ぶ) の着度数。
 * 現役は 本年・前年・累計 の順、引退した人は 引退年・引退前年・累計 の順で、年は Nen で分かる。
 */
export function addMasterJinBlocks(
  writer: ChakudosuuWriter,
  buffer: Buffer,
  taishou: ChakudosuuTaishou.Kishu | ChakudosuuTaishou.Choukyoushi,
  taishouId: number,
  nengappi: number,
  blockOffset: number,
) {
  const blockLength = 1052;
  [ChakudosuuKikan.Honnen, ChakudosuuKikan.Zennen, ChakudosuuKikan.Ruikei].forEach((kikan, k) => {
    const b = blockOffset + k * blockLength;
    const key = { Taishou: taishou, TaishouId: taishouId, Nengappi: nengappi, Kikan: kikan };
    const add = (bunrui: number, offset: number) =>
      writer.add(key, bunrui, buffer, b + offset, 6, 6);
    add(ChakudosuuBunrui.Heichi, 44);
    add(ChakudosuuBunrui.Shougai, 80);
    for (let i = 0; i < 20; i++) {
      const track = i % 2 === 0 ? ChakudosuuTrack.Heichi : ChakudosuuTrack.Shougai;
      add(keibajouBunrui(track, bashoAt(Math.floor(i / 2))), 116 + i * 36);
    }
    for (let i = 0; i < 6; i++) {
      add(kyoriBunrui(Math.floor(i / 3), jravanKyori, i % 3), 836 + i * 36);
    }
    addJinShuukei(writer, key, buffer, b);
  });
}
