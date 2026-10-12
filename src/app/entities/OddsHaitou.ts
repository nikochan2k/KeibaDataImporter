import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Baken, Kakutei } from "../converters/Common";

export const OddsHaitou = sqliteTable(
  "OddsHaitou",
  {
    Id: integer().primaryKey(),
    RaceId: integer().notNull(),
    Baken: integer().$type<Baken>().notNull(),
    Kakutei: integer().$type<Kakutei>(),
    Bangou1: integer().notNull(),
    Bangou2: integer(),
    Bangou3: integer(),
    Odds1: real(),
    Odds2: real(),
    Haitoukin: integer(),
    Ninki: integer(),
    /** 票数。返還分を含む (1 票 100 円)。0 は無投票 */
    Hyousuu: integer(),
    /** オッズを取得した時刻(HH:MM)。直前オッズ(TYB)で分かる。 */
    ShutokuJikan: text(),
  },
  (t) => [index("IxOddsHaitou").on(t.RaceId, t.Baken)],
);

export type OddsHaitou = typeof OddsHaitou.$inferSelect;
