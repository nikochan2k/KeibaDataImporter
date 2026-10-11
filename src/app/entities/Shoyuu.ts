import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export enum MeishouKubun {
  Full,
  Tanshuku,
}

export const Shoyuu = sqliteTable(
  "Shoyuu",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    Kubun: integer().$type<MeishouKubun>().notNull(),
    Meishou: text().notNull(),
    /** 突き合わせ用のキー (空白や異体字などを揃えたもの) */
    MatchingKey: text(),
    BanushiKaiCode: integer(),
  },
  (t) => [uniqueIndex("IxShoyuu1").on(t.Meishou), index("IxShoyuu2").on(t.MatchingKey)],
);

export type Shoyuu = typeof Shoyuu.$inferSelect;
