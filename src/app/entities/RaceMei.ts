import { integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

export const RaceMei = sqliteTable(
  "RaceMei",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    RaceId: integer().notNull(),
    TokubetsuMeiId: integer().notNull(),
  },
  (t) => [uniqueIndex("IxRaceMei").on(t.RaceId, t.TokubetsuMeiId)],
);

export type RaceMei = typeof RaceMei.$inferSelect;
