import { KolLayout } from "../KolLayout";

/*
 * KD2 の項目のアドレス。KD3 のアドレスからのずれで表す。
 * KD2 と KD3 で項目の並びが同じ種別 (厩舎、騎手、種牡馬、競走馬、3代血統図、予想オッズ、確定オッズ) は、
 * KD3 の取り込み処理がそのまま使える。競走成績出走馬データとコメントデータは、
 * 末尾の項目が増えただけなので、レコード長だけを差し替える。
 * 項目の位置が変わった種別のずれを、ここに書く。KD3 で増えた項目は null (KD2 では読まない)。
 */

/** 出馬表レースデータ (779 バイト)。KD3 は 848 バイト */
export const kd2Den1Layout = new KolLayout([
  { from: 0, delta: 0 },
  { from: 73, delta: null }, // Ｊｐｎフラグ
  { from: 74, delta: -1 },
  { from: 350, delta: null }, // レース短評、予想展開、予想者名２
  { from: 418, delta: -69 }, // データ作成年月日、馬番表
]);

/** 出馬表出走馬データ (743 バイト)。KD3 は 1000 バイト */
export const kd2Den2Layout = new KolLayout([
  { from: 0, delta: 0 },
  { from: 255, delta: null }, // 予想２
  { from: 256, delta: -1 },
  { from: 694, delta: null }, // 調教短評、調教本数
  { from: 727, delta: -34 }, // データ作成日、生年、レイティング
  { from: 742, delta: null }, // スピード指数、ローテーション、休養理由、場所別成績
  { from: 998, delta: -257 }, // データ区切り
]);

/** 競走成績レースデータ (2756 バイト)。KD3 は 3200 バイト */
export const kd2Sei1Layout = new KolLayout([
  { from: 0, delta: 0 },
  { from: 74, delta: null }, // Ｊｐｎフラグ
  { from: 75, delta: -1 },
  { from: 382, delta: 373 }, // 上り１哩、ラップタイム、経過、発走状況は、払戻のあとにある
  { from: 1953, delta: null },
  { from: 2100, delta: -1719 }, // 単勝～３連複の払戻
  { from: 2466, delta: -132 }, // ３連単の払戻は、データ作成年月日のあとにある
  { from: 2580, delta: null },
  { from: 2910, delta: -584 }, // データ作成年月日
  { from: 2918, delta: -444 }, // 馬番表
]);
