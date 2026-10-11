// 閲覧 API が返す JSON の型。フロントエンドからも読み込むので、他のモジュールに依存させない。

export interface RaceSummary {
  id: number;
  date: string;
  basho: number;
  bashoMei: string | null;
  raceBangou: number;
  meishou: string | null;
  grade: string | null;
  heichiShougai: string | null;
  dirtShiba: string | null;
  kyori: number | null;
  tousuu: number | null;
  hassouJikan: string | null;
}

/** レース一覧の絞り込みに使う競馬場 */
export interface BashoOption {
  basho: number;
  bashoMei: string | null;
}

export interface RaceEntry {
  shussoubaId: number;
  wakuban: number | null;
  umaban: number;
  umaId: number | null;
  bamei: string | null;
  seibetsu: string | null;
  nenrei: number | null;
  kinryou: number | null;
  kishuMei: string | null;
  /** 確定着順。取消や除外などで着順のない馬は null */
  chakujun: number | null;
  torikeshi: number | null;
  /** 走破タイム(秒) */
  time: number | null;
  agari3F: number | null;
  bataijuu: number | null;
  zougen: number | null;
}

export interface UmaSummary {
  id: number;
  bamei: string | null;
  eigoBamei: string | null;
  seinen: number | null;
  seibetsu: string | null;
}

export interface UmaStart extends RaceSummary {
  umaban: number;
  chakujun: number | null;
  time: number | null;
  agari3F: number | null;
  kishuMei: string | null;
}
