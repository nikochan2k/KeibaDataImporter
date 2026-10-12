import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * 馬主・生産者の名前の辞書。表記(Meishou)ごとに1行で、表記が違えば別の行にする。
 * 名前の区分 (MeishouKubun) は、つなぐ表 (BanushiMei・SeisanshaMei) に持つ。
 * MatchingKey は表記ゆれを許して探す(UIからの検索)ための索引で、一意ではない。
 */
export const Shoyuu = sqliteTable(
  "Shoyuu",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    Meishou: text().notNull(),
    /** 表記ゆれを探すためのキー (空白や異体字などを揃えたもの) */
    MatchingKey: text().notNull(),
  },
  (t) => [uniqueIndex("IxShoyuu1").on(t.Meishou), index("IxShoyuu2").on(t.MatchingKey)],
);

export type Shoyuu = typeof Shoyuu.$inferSelect;
