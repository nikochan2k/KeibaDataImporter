import { Codes } from "./Codes";

export const bakenShubetsu = new Codes(
  [
    { code: 0, naiyou: "単勝" },
    { code: 1, naiyou: "複勝" },
    { code: 2, naiyou: "枠連" },
    { code: 3, naiyou: "馬連" },
    { code: 4, naiyou: "ワイド" },
    { code: 5, naiyou: "馬単" },
    { code: 6, naiyou: "三連複" },
    { code: 7, naiyou: "三連単" }
  ]
);

export enum Baken {
  Tanshou,
  Fukushou,
  Wakuren,
  Umaren,
  Wide,
  Umatan,
  Sanrenpuku,
  Sanrentan
}

export interface HaitouInfo {
  baken: Baken;
  bangou1: number;
  bangou1Len: number;
  bangou2?: number;
  bangou2Len?: number;
  bangou3?: number;
  bangou3Len?: number;
  haitou: number;
  haitouLen: number;
  ninki?: number;
  ninkiLen?: number;
}
