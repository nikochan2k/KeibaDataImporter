import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { Midashi } from "../converters/Race";
import { Ichi } from "../converters/Shussouba";

export const RaceTrackBias = sqliteTable(
  "RaceTrackBias",
  {
    Id: integer().primaryKey(),
    RaceId: integer().notNull(),
    Midashi: integer().$type<Midashi>().notNull(),
    Ichi: integer().$type<Ichi>().notNull(),
    TrackBias: integer().notNull(),
  },
  (t) => [index("IxRaceTrackBias").on(t.RaceId)],
);

export type RaceTrackBias = typeof RaceTrackBias.$inferSelect;
