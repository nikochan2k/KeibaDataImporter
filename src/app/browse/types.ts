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

/** 開催のある競馬場 */
export interface BashoOption {
  basho: number;
  bashoMei: string | null;
}

/** レースのある年月 */
export interface RaceMonth {
  year: number;
  month: number;
}

/** 開催のある日と、その日に開催のある競馬場 */
export interface RaceDay {
  date: string;
  bashos: BashoOption[];
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
  /** 着差(クビ、1/2、1.3/4 など) */
  chakusa: string | null;
  ninki: number | null;
  odds: number | null;
  /** コーナー通過順(例: 3-3-2-1) */
  tsuuka: string | null;
  choukyoushiMei: string | null;
  /** 調教師の所属(東・西など) */
  choukyoushiShozoku: string | null;
}

export interface UmaSummary {
  id: number;
  bamei: string | null;
  eigoBamei: string | null;
  seinen: number | null;
  seibetsu: string | null;
}

export interface KishuSummary {
  id: number;
  meishou: string | null;
  seinen: number | null;
  seibetsu: string | null;
  /** 所属(関東・関西など) */
  shozoku: string | null;
}

export interface KishuStart extends RaceSummary {
  umaban: number;
  chakujun: number | null;
  time: number | null;
  agari3F: number | null;
  umaId: number | null;
  bamei: string | null;
}

export interface PedigreeAncestor {
  id: number;
  bamei: string | null;
}

export interface UmaStart extends RaceSummary {
  umaban: number;
  chakujun: number | null;
  time: number | null;
  agari3F: number | null;
  kishuMei: string | null;
}

/** 調教1本 */
export interface PreviewChoukyou {
  date: string;
  basho: string | null;
  type: string | null;
  course: string | null;
  baba: string | null;
  oikiri: string | null;
  ashiiro: string | null;
  honOikiri: boolean;
  yajirushi: string | null;
  awase: string | null;
  /** 全体〜ラスト(ハロンの長い順)の時計 */
  times: { f: number; time: number | null }[];
}

/** 出走前の情報(状態・評価・予想・調教)を出走馬ごとにまとめたもの */
export interface PreviewEntry {
  shussoubaId: number;
  wakuban: number | null;
  umaban: number;
  umaId: number | null;
  bamei: string | null;
  kishuMei: string | null;
  joutai: { kubun: string; naiyou: string }[];
  hyouka: {
    idm: number | null;
    kehai: string | null;
    batai: string | null;
    paddock: string | null;
    ashimoto: string | null;
    bagu: string | null;
    kyuushaHyouka: string | null;
  };
  yosou: {
    shirushi: { name: string; mark: string }[];
    sougouShisuu: number | null;
    idm: number | null;
    kishuShisuu: number | null;
    jouhouShisuu: number | null;
    choukyouShisuu: number | null;
    kyuushaShisuu: number | null;
    ninkiShisuu: number | null;
    kyakushitsu: number | null;
  };
  choukyou: {
    tanpyou: string | null;
    type: string | null;
    ryou: string | null;
    ryouHyouka: string | null;
    yajirushi: string | null;
    isshuumaeShisuu: number | null;
    oikiriShisuu: number | null;
    shiageShisuu: number | null;
    shiageHenka: string | null;
    comment: string | null;
    items: PreviewChoukyou[];
  };
}
