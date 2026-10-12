import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { Baken, Kakutei } from "../converters/Common";

/** レースの賭式ごとの合計票数。組み合わせごとの票数は OddsHaitou.Hyousuu */
export const RaceHyousuu = sqliteTable(
  "RaceHyousuu",
  {
    /** レースID(28ビット)、確定(3ビット)、馬券(4ビット) */
    Id: integer().primaryKey(),
    RaceId: integer().notNull(),
    Kakutei: integer().$type<Kakutei>().notNull(),
    Baken: integer().$type<Baken>().notNull(),
    /** 合計票数。返還分を含む (1 票 100 円) */
    GoukeiHyousuu: integer(),
    /** 返還分の合計票数。合計票数から引くと有効票数になる。JV-Data だけにある */
    HenkanHyousuu: integer(),
  },
  (t) => [index("IxRaceHyousuu").on(t.RaceId)],
);

export type RaceHyousuu = typeof RaceHyousuu.$inferSelect;
