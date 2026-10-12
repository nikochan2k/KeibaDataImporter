import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import type {
  ChakudosuuBunrui,
  ChakudosuuKikan,
  ChakudosuuTaishou,
} from "../converters/Chakudosuu";

/**
 * 着度数。馬・騎手・調教師・馬主・生産者・種牡馬の産駒の、ある日の時点の、期間 (累計・本年・前年) と
 * 分類 (総合、芝・ダート、馬場状態別、距離別、競馬場別など) ごとの着順の回数。
 * 時点は、JV-Data の出走別着度数 (CK) と KOL の出馬表はレースの日、
 * マスタ (KOL の競走馬・騎手・厩舎・種牡馬、JRA-VAN の競走馬・騎手・調教師) はデータ作成年月日。
 * 同じ日の同じ対象は 1 組の行になる (同じ騎手が何レース騎乗しても)。
 *
 * 着外の数え方がデータ元で違う (JV-Data は 4 着・5 着・6 着以下、ほかは 4 着以下) ので、
 * 4 着以下 (Chaku4Ika) は必ず入れ、4 着・5 着・6 着以下は分かるときだけ入れる。
 * 回数が全部 0 の分類は行を作らない (行がなければ 0 回)。
 */
export const Chakudosuu = sqliteTable(
  "Chakudosuu",
  {
    Taishou: integer().$type<ChakudosuuTaishou>().notNull(),
    /** 対象の Id (馬・種牡馬は Uma、ほかは Kishu・Choukyoushi・Banushi・Seisansha) */
    TaishouId: integer().notNull(),
    /** 時点 (yyyymmdd) */
    Nengappi: integer().notNull(),
    Kikan: integer().$type<ChakudosuuKikan>().notNull(),
    /** 分類 (ChakudosuuBunrui と、babaBunrui・kyoriBunrui・keibajouBunrui で作る番号) */
    Bunrui: integer().$type<ChakudosuuBunrui | number>().notNull(),
    Chaku1: integer().notNull(),
    Chaku2: integer().notNull(),
    Chaku3: integer().notNull(),
    Chaku4Ika: integer().notNull(),
    Chaku4: integer(),
    Chaku5: integer(),
    /** 6 着以下 */
    Chakugai: integer(),
  },
  (t) => [primaryKey({ columns: [t.Taishou, t.TaishouId, t.Nengappi, t.Kikan, t.Bunrui] })],
);

export type Chakudosuu = typeof Chakudosuu.$inferSelect;
