import {
  babaBunrui,
  ChakudosuuBunrui,
  ChakudosuuKikan,
  type ChakudosuuTaishou,
  ChakudosuuTrack,
  keibajouBunrui,
  kolKyori,
  kyoriBunrui,
} from "../../converters/Chakudosuu";
import type { ChakudosuuKey, ChakudosuuWriter } from "../../daos/ChakudosuuDao";
import { readInt } from "../Reader";

/** KOL の成績の項目の位置。回数は 1 着・2 着・3 着・着外 (4 着以下) */
export interface KolSeisekiOffsets {
  /** 平地・障害 (各 4 x width バイト) */
  heichiShougai?: number;
  /** 総計 (4 x width バイト) */
  sougou?: number;
  /** 地方交流 (4 x width バイト) */
  chihouKouryuu?: number;
  /** 地方・外国の成績 (KOL の (地)[地][外] 馬) */
  chihouGaikoku?: number;
  /** 連対脚質別回数 (逃・先・差・追) */
  rentaiKyakushitsu?: number;
  /** 芝右・芝左・ダ右・ダ左・直線 (直線は芝とダート) */
  babaBetsu?: number;
  /** 障害 (馬場別の続き。競走馬だけ) */
  shougai?: number;
  /** 芝・ダート・障害の 良・稍重・重・不良 */
  babaJoutai?: number;
  /** 芝・ダートの距離別 (各 8 区分) */
  kyori?: number;
  /** 競馬場別 (京都・阪神・中京・小倉・東京・中山・福島・新潟・札幌・函館) */
  keibajou?: number;
}

/**
 * KOL の成績を、着度数に足します。width は回数 1 つぶんのバイト数。
 * 項目の並びは、騎手・厩舎・競走馬・種牡馬で共通 (ない項目は位置を省略)。
 */
export function addKolSeiseki(
  writer: ChakudosuuWriter,
  key: ChakudosuuKey,
  buffer: Buffer,
  o: KolSeisekiOffsets,
  width: number,
) {
  const step = width * 4;
  const add = (bunrui: number, offset: number) => writer.add(key, bunrui, buffer, offset, width);
  if (o.sougou !== undefined) {
    add(ChakudosuuBunrui.Sougou, o.sougou);
  }
  if (o.heichiShougai !== undefined) {
    add(ChakudosuuBunrui.Heichi, o.heichiShougai);
    add(ChakudosuuBunrui.Shougai, o.heichiShougai + step);
  }
  if (o.chihouKouryuu !== undefined) {
    add(ChakudosuuBunrui.ChihouKouryuu, o.chihouKouryuu);
  }
  if (o.chihouGaikoku !== undefined) {
    add(ChakudosuuBunrui.ChihouGaikoku, o.chihouGaikoku);
  }
  if (o.babaBetsu !== undefined) {
    [
      ChakudosuuBunrui.ShibaMigi,
      ChakudosuuBunrui.ShibaHidari,
      ChakudosuuBunrui.DirtMigi,
      ChakudosuuBunrui.DirtHidari,
      ChakudosuuBunrui.Chokusen,
    ].forEach((bunrui, i) => {
      add(bunrui, (o.babaBetsu as number) + i * step);
    });
  }
  if (o.shougai !== undefined) {
    add(ChakudosuuBunrui.Shougai, o.shougai);
  }
  if (o.babaJoutai !== undefined) {
    for (let i = 0; i < 12; i++) {
      add(babaBunrui(Math.floor(i / 4), i % 4), o.babaJoutai + i * step);
    }
  }
  if (o.kyori !== undefined) {
    for (let i = 0; i < 16; i++) {
      add(kyoriBunrui(Math.floor(i / 8), kolKyori, i % 8), o.kyori + i * step);
    }
  }
  if (o.keibajou !== undefined) {
    // KOL の場所コードは 00:京都 〜 09:函館 で、この並びと同じ
    for (let basho = 0; basho < 10; basho++) {
      add(keibajouBunrui(ChakudosuuTrack.Subete, basho), o.keibajou + basho * step);
    }
  }
}

/** 連対脚質別回数 (逃・先・差・追) */
export function readKolRentaiKyakushitsu(buffer: Buffer, offset: number, width: number) {
  const read = (i: number) => readInt(buffer, offset + i * width, width);
  return {
    RentaiNige: read(0),
    RentaiSenkou: read(1),
    RentaiSashi: read(2),
    RentaiOikomi: read(3),
  };
}

/**
 * KOL の騎手・厩舎の成績 (通算累計・本年・昨年)。本年・昨年は同じ並びで、
 * 通算 (平地・障害)・地方交流・賞金 (平地本賞金・附加賞金・障害本賞金・附加賞金、千円)・
 * [騎手だけ: 連対脚質・馬場別・馬場状態別]・距離別・場所別 の順。
 */
export function addKolJinSeiseki(
  writer: ChakudosuuWriter,
  buffer: Buffer,
  taishou: ChakudosuuTaishou,
  taishouId: number,
  nengappi: number,
  ruikeiOffset: number,
  honnen: number,
  zennen: number,
  hasBaba: boolean,
) {
  const base = { Taishou: taishou, TaishouId: taishouId, Nengappi: nengappi };
  addKolSeiseki(
    writer,
    { ...base, Kikan: ChakudosuuKikan.Ruikei },
    buffer,
    { heichiShougai: ruikeiOffset },
    5,
  );
  const nen = Math.floor(nengappi / 10000);
  for (const [kikan, b, year] of [
    [ChakudosuuKikan.Honnen, honnen, nen],
    [ChakudosuuKikan.Zennen, zennen, nen - 1],
  ] as const) {
    const key = { ...base, Kikan: kikan };
    // 通算 24、地方交流 12、賞金 26、(連対脚質 12、馬場別 60、馬場状態別 144)、距離別 192、場所別 120
    const shoukin = b + 36;
    const baba = shoukin + 26;
    const kyori = hasBaba ? baba + 12 + 60 + 144 : baba;
    addKolSeiseki(
      writer,
      key,
      buffer,
      {
        heichiShougai: b,
        chihouKouryuu: b + 24,
        babaBetsu: hasBaba ? baba + 12 : undefined,
        babaJoutai: hasBaba ? baba + 72 : undefined,
        kyori,
        keibajou: kyori + 192,
      },
      3,
    );
    writer.addShuukei({
      ...key,
      Nen: year,
      HeichiHonShoukin: readInt(buffer, shoukin, 7, 1000),
      HeichiFukaShoukin: readInt(buffer, shoukin + 7, 6, 1000),
      ShougaiHonShoukin: readInt(buffer, shoukin + 13, 7, 1000),
      ShougaiFukaShoukin: readInt(buffer, shoukin + 20, 6, 1000),
      ...(hasBaba ? readKolRentaiKyakushitsu(buffer, baba, 3) : {}),
    });
  }
}
