import { Codes } from "./Codes";
import { basho } from "./Common";

/** 着度数の対象 */
export enum ChakudosuuTaishou {
  Uma = 1,
  Kishu,
  Choukyoushi,
  Banushi,
  Seisansha,
}

/** 着度数の期間。馬は出走時点までの累計だけ、騎手・調教師・馬主・生産者は本年と累計 */
export enum ChakudosuuKikan {
  Ruikei,
  Honnen,
}

/** 芝・ダート・障害 (距離別・競馬場別の分類の番号に使う) */
export enum ChakudosuuTrack {
  Shiba,
  Dirt,
  Shougai,
}

/** 着度数の分類。距離別・競馬場別は kyoriBunrui・keibajouBunrui で番号を作る */
export enum ChakudosuuBunrui {
  /** 中央・地方・海外の合計 (馬だけ) */
  Sougou = 1,
  /** 中央の合計 (馬・馬主・生産者) */
  Chuuou,
  /** 芝 (騎手・調教師) */
  Shiba,
  /** ダート (騎手・調教師) */
  Dirt,
  /** 障害 (馬・騎手・調教師) */
  Shougai,
  ShibaChokusen = 11,
  ShibaMigi,
  ShibaHidari,
  DirtChokusen,
  DirtMigi,
  DirtHidari,
  /** 馬場状態別は 21 から、芝・ダート・障害ごとに 良・稍重・重・不良 */
  ShibaRyou = 21,
}

/** 距離別の区切り (この距離以下)。最後は 2801 m 以上 */
export const chakudosuuKyori = [1200, 1400, 1600, 1800, 2000, 2200, 2400, 2800, null] as const;

const babaNames = ["良", "稍重", "重", "不良"];
const trackNames = ["芝", "ダート", "障害"];

/** 馬場状態別の分類 (baba は 0: 良, 1: 稍重, 2: 重, 3: 不良) */
export function babaBunrui(track: ChakudosuuTrack, baba: number) {
  return ChakudosuuBunrui.ShibaRyou + track * 4 + baba;
}

/** 距離別の分類 (index は chakudosuuKyori の位置)。芝とダートだけ */
export function kyoriBunrui(track: ChakudosuuTrack, index: number) {
  return 40 + track * 10 + index;
}

/** 競馬場別の分類 (bashoCode は場所のコード) */
export function keibajouBunrui(track: ChakudosuuTrack, bashoCode: number) {
  return 100 + track * 10 + bashoCode;
}

function kyoriName(index: number) {
  const max = chakudosuuKyori[index];
  const min = index === 0 ? null : chakudosuuKyori[index - 1];
  if (max === null) {
    return `${(min ?? 0) + 1}m 以上`;
  }
  return min === null ? `${max}m 以下` : `${min + 1}〜${max}m`;
}

/** 分類の内容 */
export const chakudosuuBunrui = new Codes([
  { code: ChakudosuuBunrui.Sougou, naiyou: "総合" },
  { code: ChakudosuuBunrui.Chuuou, naiyou: "中央" },
  { code: ChakudosuuBunrui.Shiba, naiyou: "芝" },
  { code: ChakudosuuBunrui.Dirt, naiyou: "ダート" },
  { code: ChakudosuuBunrui.Shougai, naiyou: "障害" },
  { code: ChakudosuuBunrui.ShibaChokusen, naiyou: "芝・直線" },
  { code: ChakudosuuBunrui.ShibaMigi, naiyou: "芝・右" },
  { code: ChakudosuuBunrui.ShibaHidari, naiyou: "芝・左" },
  { code: ChakudosuuBunrui.DirtChokusen, naiyou: "ダート・直線" },
  { code: ChakudosuuBunrui.DirtMigi, naiyou: "ダート・右" },
  { code: ChakudosuuBunrui.DirtHidari, naiyou: "ダート・左" },
  ...[0, 1, 2].flatMap((track) =>
    babaNames.map((name, baba) => ({
      code: babaBunrui(track, baba),
      naiyou: `${trackNames[track]}・${name}`,
    })),
  ),
  ...[0, 1].flatMap((track) =>
    chakudosuuKyori.map((_, index) => ({
      code: kyoriBunrui(track, index),
      naiyou: `${trackNames[track]}・${kyoriName(index)}`,
    })),
  ),
  ...[0, 1, 2].flatMap((track) =>
    Array.from({ length: 10 }, (_, i) => {
      const code = basho.toCodeFromJvData(String(i + 1).padStart(2, "0")) as number;
      return {
        code: keibajouBunrui(track, code),
        naiyou: `${basho.toNaiyou(code)}・${trackNames[track]}`,
      };
    }),
  ),
]);
