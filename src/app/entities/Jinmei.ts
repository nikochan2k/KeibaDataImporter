import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * 人名の辞書。表記(Meishou)ごとに1行。斎藤と斉藤のように異体字で別人になりうるので、
 * 表記が違えば別の行にする。MatchingKey は表記ゆれを許して探す(取り込み時の突き合わせ、UIからの検索)ための索引で、一意ではない。
 */
export const Jinmei = sqliteTable(
  "Jinmei",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    Meishou: text().notNull(),
    /** 表記ゆれを探すためのキー (異体字などを揃えたもの) */
    MatchingKey: text().notNull(),
  },
  (t) => [uniqueIndex("IxJinmei1").on(t.Meishou), index("IxJinmei2").on(t.MatchingKey)],
);

export type Jinmei = typeof Jinmei.$inferSelect;
