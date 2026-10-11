import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const RaceHassouJoukyou = sqliteTable(
  "RaceHassouJoukyou",
  {
    Id: integer().primaryKey(),
    RaceId: integer().notNull(),
    HassouJoukyou: text().notNull(),
    Ichi: integer().notNull(),
    Joukyou: integer().notNull(),
    FuriBashin: real(),
    FuriByou: real(),
  },
  (t) => [index("IxRaceHassouJoukyou").on(t.RaceId)],
);

export type RaceHassouJoukyou = typeof RaceHassouJoukyou.$inferSelect;
