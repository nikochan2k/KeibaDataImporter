import { basho } from "./Common";

/** 着度数の対象 */
export enum ChakudosuuTaishou {
  Uma = 1,
  Kishu,
  Choukyoushi,
  Banushi,
  Seisansha,
  /** 種牡馬の産駒 (TaishouId は種牡馬の UmaId) */
  Sanku,
}

/** 着度数の期間 */
export enum ChakudosuuKikan {
  /** 累計 (生涯・通算) */
  Ruikei,
  Honnen,
  Zennen,
}

/** 芝・ダート・障害などの区分 (馬場状態別・距離別・競馬場別の分類の番号に使う) */
export enum ChakudosuuTrack {
  Shiba,
  Dirt,
  Shougai,
  /** 芝とダート (平地) */
  Heichi,
  /** 芝・ダート・障害の全部 */
  Subete,
}

/** 着度数の分類。馬場状態別・距離別・競馬場別は babaBunrui・kyoriBunrui・keibajouBunrui で番号を作る */
export enum ChakudosuuBunrui {
  /** 中央・地方・海外の合計 */
  Sougou = 1,
  /** 中央の合計 */
  Chuuou,
  Heichi,
  Shiba,
  Dirt,
  Shougai,
  /** 地方交流競走 (中央所属になってから) */
  ChihouKouryuu,
  /** 地方・外国での成績 (KOL の (地)[地][外] 馬。中央開催のレースを含まない) */
  ChihouGaikoku,
  ShibaChokusen = 11,
  ShibaMigi,
  ShibaHidari,
  DirtChokusen,
  DirtMigi,
  DirtHidari,
  /** 直線 (芝とダート) */
  Chokusen,
  /** 産駒の年齢別 */
  Nenrei2 = 21,
  Nenrei3,
  Nenrei4Ijou,
  /** その日のレースの競馬場・コースでの成績 (KOL の出馬表の場所別成績) */
  KonkaiCourse = 31,
  /** JRDB の交流成績 (JRA 所属馬の地方交流と海外。KOL の地方交流とは範囲が違う) */
  JrdbKouryuu = 41,
  /** JRDB の他成績 (地方所属時などの地方・海外) */
  JrdbSonota,
}

/**
 * 出走馬の「今回のレースと同じ条件」での着度数の条件 (JRDB の競走馬拡張データ)。
 * 番号は項目の並び順で、項目の位置は 47 + (番号 - 1) * 12。
 */
export enum ShussoubaJouken {
  /** 馬: 今回と同じ芝・ダート・障害 */
  ShibaDirtShougai = 1,
  /** 馬: 今回と同じ芝・ダート・障害と距離 */
  ShibaDirtShougaiKyori,
  /** 馬: 今回と同じトラックと距離 */
  TrackKyori,
  /** 馬: 今回と同じローテーション */
  Rote,
  /** 馬: 今回と同じ回り */
  Mawari,
  /** 馬: 今回と同じ騎手 */
  Kishu,
  /** 馬: 今回と同じ馬場状態 (良) */
  Ryou,
  /** 馬: 今回と同じ馬場状態 (稍重) */
  Yaya,
  /** 馬: 今回と同じ馬場状態 (重。不良を含む) */
  Omo,
  /** 馬: S ペース */
  SPace,
  /** 馬: M ペース */
  MPace,
  /** 馬: H ペース */
  HPace,
  /** 馬: 今回と同じ季節 (JRDB 独自の区分) */
  Kisetsu,
  /** 馬: 今回と同じ枠 (JRDB 独自の区分) */
  Waku,
  /** 今回の騎手: 今回と同じ距離 */
  KishuKyori,
  /** 今回の騎手: 今回と同じトラックと距離 */
  KishuTrackKyori,
  /** 今回の騎手: 今回の調教師との組み合わせ */
  KishuChoukyoushi,
  /** 今回の騎手: 今回の馬主との組み合わせ */
  KishuBanushi,
  /** 今回の騎手: 今回と同じブリンカー */
  KishuBlinker,
  /** 今回の調教師: 今回の馬主との組み合わせ */
  ChoukyoushiBanushi,
}

const trackNames = ["芝", "ダート", "障害", "平地", ""];
const babaNames = ["良", "稍重", "重", "不良"];

/** 馬場状態別の分類 (track は芝・ダート・障害、baba は 0: 良, 1: 稍重, 2: 重, 3: 不良) */
export function babaBunrui(track: ChakudosuuTrack, baba: number) {
  return 100 + track * 10 + baba;
}

/**
 * 距離別の分類。距離の区切りがデータ元ごとに違うので、区分の上限 (m) の並びと、何番目の区分かから番号を作る。
 * 区分は「上限以下」で、下限は 1 つ前の区分の上限 + 1 m。最後の区分は上限なし (null)。上限は 100 m 単位。
 */
export function kyoriBunrui(
  track: ChakudosuuTrack,
  maxList: readonly (number | null)[],
  index: number,
) {
  const min = index === 0 ? 0 : (maxList[index - 1] as number) / 100;
  const max = maxList[index];
  return 1_000_000 + track * 100_000 + min * 100 + (max === null ? 99 : max / 100);
}

/** JV-Data の距離区分の上限 */
export const jvdataKyori = [1200, 1400, 1600, 1800, 2000, 2200, 2400, 2800, null] as const;

/** KOL の距離区分の上限 */
export const kolKyori = [1000, 1200, 1400, 1600, 1800, 2000, 2200, null] as const;

/** JRA-VAN の距離区分の上限 */
export const jravanKyori = [1600, 2200, null] as const;

/** 競馬場別の分類 (bashoCode は場所のコード) */
export function keibajouBunrui(track: ChakudosuuTrack, bashoCode: number) {
  return 10_000 + track * 1000 + bashoCode;
}

const fixedNames: { [code: number]: string } = {
  [ChakudosuuBunrui.Sougou]: "総合",
  [ChakudosuuBunrui.Chuuou]: "中央",
  [ChakudosuuBunrui.Heichi]: "平地",
  [ChakudosuuBunrui.Shiba]: "芝",
  [ChakudosuuBunrui.Dirt]: "ダート",
  [ChakudosuuBunrui.Shougai]: "障害",
  [ChakudosuuBunrui.ChihouKouryuu]: "地方交流",
  [ChakudosuuBunrui.ChihouGaikoku]: "地方・外国",
  [ChakudosuuBunrui.ShibaChokusen]: "芝・直線",
  [ChakudosuuBunrui.ShibaMigi]: "芝・右",
  [ChakudosuuBunrui.ShibaHidari]: "芝・左",
  [ChakudosuuBunrui.DirtChokusen]: "ダート・直線",
  [ChakudosuuBunrui.DirtMigi]: "ダート・右",
  [ChakudosuuBunrui.DirtHidari]: "ダート・左",
  [ChakudosuuBunrui.Chokusen]: "直線",
  [ChakudosuuBunrui.Nenrei2]: "2 歳",
  [ChakudosuuBunrui.Nenrei3]: "3 歳",
  [ChakudosuuBunrui.Nenrei4Ijou]: "4 歳以上",
  [ChakudosuuBunrui.KonkaiCourse]: "その日の競馬場・コース",
  [ChakudosuuBunrui.JrdbKouryuu]: "JRDB 交流",
  [ChakudosuuBunrui.JrdbSonota]: "JRDB 他",
};

const withTrack = (track: number, name: string) =>
  trackNames[track] ? `${trackNames[track]}・${name}` : name;

/** 分類の内容 (例: 「芝・1401〜1600m」「東京・ダート」)。分からない番号は null */
export function chakudosuuBunruiNaiyou(code: number): string | null {
  if (fixedNames[code]) {
    return fixedNames[code];
  }
  if (1_000_000 <= code) {
    const track = Math.floor((code - 1_000_000) / 100_000);
    const rest = (code - 1_000_000) % 100_000;
    const min = Math.floor(rest / 100) * 100;
    const max = (rest % 100) * 100;
    const kyori =
      max === 9900 ? `${min + 1}m 以上` : min === 0 ? `${max}m 以下` : `${min + 1}〜${max}m`;
    return withTrack(track, kyori);
  }
  if (10_000 <= code) {
    const track = Math.floor((code - 10_000) / 1000);
    const name = basho.toNaiyou(code % 1000);
    return name ? `${name}${trackNames[track] ? `・${trackNames[track]}` : ""}` : null;
  }
  if (100 <= code && code < 200) {
    const track = Math.floor((code - 100) / 10);
    return withTrack(track, babaNames[code % 10]);
  }
  return null;
}
