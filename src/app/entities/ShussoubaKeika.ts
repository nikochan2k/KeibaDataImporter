import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const ShussoubaKeika = sqliteTable(
  "ShussoubaKeika",
  {
    Id: integer().primaryKey(),
    RaceKeikaId: integer().notNull(),
    ShussoubaId: integer().notNull(),
    TateCount: integer().notNull(),
    TateHanareteCount: integer().notNull(),
    TateOokikuHanareteCount: integer().notNull(),
    YokoCount: integer().notNull(),
    YokoHanareteCount: integer().notNull(),
  },
  (t) => [index("IxShussoubaKeika").on(t.RaceKeikaId, t.ShussoubaId)],
);

export type ShussoubaKeika = typeof ShussoubaKeika.$inferSelect;
