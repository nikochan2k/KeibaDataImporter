import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * 放牧先の辞書。表記(Meishou)ごとに1行で、表記が違えば別の行にする。
 * MatchingKey は表記ゆれを許して探す(UIからの検索)ための索引で、一意ではない。
 */
export const Houbokusaki = sqliteTable(
  "Houbokusaki",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    Meishou: text().notNull(),
    /** 表記ゆれを探すためのキー (空白や異体字などを揃えたもの) */
    MatchingKey: text().notNull(),
  },
  (t) => [uniqueIndex("IxHoubokusaki").on(t.Meishou), index("IxHoubokusaki2").on(t.MatchingKey)],
);

export type Houbokusaki = typeof Houbokusaki.$inferSelect;
