import { index, integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";

/** 重勝式 (WIN5) の対象レース。主キーは (開催日, 何レース目) */
export const Win5Race = sqliteTable(
  "Win5Race",
  {
    Nengappi: integer().notNull(),
    /** 何レース目か (1〜5) */
    Jun: integer().notNull(),
    RaceId: integer().notNull(),
    /** このレースの確定時に、的中の可能性が残っている票数 */
    YuukouHyousuu: integer(),
  },
  (t) => [primaryKey({ columns: [t.Nengappi, t.Jun] }), index("IxWin5Race").on(t.RaceId)],
);

export type Win5Race = typeof Win5Race.$inferSelect;
