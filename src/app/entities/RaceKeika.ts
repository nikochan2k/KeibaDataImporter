import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const RaceKeika = sqliteTable(
  "RaceKeika",
  {
    Id: integer().primaryKey(),
    RaceId: integer().notNull(),
    Keika: text().notNull(),
    Midashi1: integer(),
    Midashi2: integer(),
  },
  (t) => [index("IxRaceKeika").on(t.RaceId)],
);

export type RaceKeika = typeof RaceKeika.$inferSelect;
