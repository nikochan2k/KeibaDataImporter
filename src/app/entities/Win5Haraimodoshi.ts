import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * 重勝式 (WIN5) の払戻。対象レースの順の、的中の馬番の組ごと (同着があると複数の組になる)。
 * 的中がなかったときも、的中の組を払戻金 0 で持つ。
 */
export const Win5Haraimodoshi = sqliteTable(
  "Win5Haraimodoshi",
  {
    Nengappi: integer().notNull(),
    Umaban1: integer().notNull(),
    Umaban2: integer().notNull(),
    Umaban3: integer().notNull(),
    Umaban4: integer().notNull(),
    Umaban5: integer().notNull(),
    /** 払戻金 (円) */
    Haraimodoshikin: integer(),
    TekichuuHyousuu: integer(),
  },
  (t) => [
    primaryKey({
      columns: [t.Nengappi, t.Umaban1, t.Umaban2, t.Umaban3, t.Umaban4, t.Umaban5],
    }),
  ],
);

export type Win5Haraimodoshi = typeof Win5Haraimodoshi.$inferSelect;
