import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import type { ShussoubaJouken } from "../converters/Chakudosuu";

/**
 * 出走馬の、今回のレースと同じ条件での着度数 (JRDB の競走馬拡張データ)。
 * 今回のレースが決まって初めて意味を持つ集計なので、時点ごとの表 (Chakudosuu) ではなく出走馬ごとに持つ。
 * 馬の成績を今回の条件で絞ったもの (芝ダ障害別・距離・ローテ・回り・騎手・馬場状態・ペース・季節・枠) は、
 * JRA 成績だけ。2007-01-14 までは JRA 成績と交流成績。
 * 今回の騎手・調教師などの成績を今回の条件や組み合わせで絞ったもの (騎手距離・騎手調教師別など) は、
 * JRA 成績の 3〜5 年分で、月 1 回程度の更新。
 * 重成績は不良を含む。季節・枠の区分は JRDB 独自。回数が全部 0 の条件は行を作らない。
 */
export const ShussoubaJoukenChakudosuu = sqliteTable(
  "ShussoubaJoukenChakudosuu",
  {
    ShussoubaId: integer().notNull(),
    Jouken: integer().$type<ShussoubaJouken>().notNull(),
    Chaku1: integer().notNull(),
    Chaku2: integer().notNull(),
    Chaku3: integer().notNull(),
    /** 4 着以下 */
    Chaku4Ika: integer().notNull(),
  },
  (t) => [primaryKey({ columns: [t.ShussoubaId, t.Jouken] })],
);

export type ShussoubaJoukenChakudosuu = typeof ShussoubaJoukenChakudosuu.$inferSelect;
