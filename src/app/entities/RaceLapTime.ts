import { index, integer, real, sqliteTable } from "drizzle-orm/sqlite-core";

export const RaceLapTime = sqliteTable(
  "RaceLapTime",
  {
    Id: integer().primaryKey(),
    RaceId: integer().notNull(),
    KaishiKyori: integer().notNull(),
    ShuuryouKyori: integer().notNull(),
    LapTime: real().notNull(),
  },
  (t) => [index("IxRaceLapTime").on(t.RaceId)],
);

export type RaceLapTime = typeof RaceLapTime.$inferSelect;
