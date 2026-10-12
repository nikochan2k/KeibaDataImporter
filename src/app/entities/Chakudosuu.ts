import { index, integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import type {
  ChakudosuuBunrui,
  ChakudosuuKikan,
  ChakudosuuTaishou,
} from "../converters/Chakudosuu";

/**
 * 出走時点の着度数 (JV-Data の出走別着度数 CK)。出走馬の馬・騎手・調教師・馬主・生産者それぞれの、
 * 分類 (総合、芝・ダート、馬場状態別、距離別、競馬場別など) ごとの 1〜5 着と着外の回数。
 * CK には馬番がないので、出走馬ではなく (レース, 馬) で持つ。
 * 回数が全部 0 の分類は行を作らない (行がなければ 0 回)。
 */
export const Chakudosuu = sqliteTable(
  "Chakudosuu",
  {
    RaceId: integer().notNull(),
    UmaId: integer().notNull(),
    Taishou: integer().$type<ChakudosuuTaishou>().notNull(),
    Kikan: integer().$type<ChakudosuuKikan>().notNull(),
    /** 分類 (ChakudosuuBunrui と、kyoriBunrui・keibajouBunrui などで作る番号) */
    Bunrui: integer().$type<ChakudosuuBunrui | number>().notNull(),
    Chaku1: integer(),
    Chaku2: integer(),
    Chaku3: integer(),
    Chaku4: integer(),
    Chaku5: integer(),
    Chakugai: integer(),
  },
  (t) => [
    primaryKey({ columns: [t.RaceId, t.UmaId, t.Taishou, t.Kikan, t.Bunrui] }),
    index("IxChakudosuu").on(t.UmaId),
  ],
);

export type Chakudosuu = typeof Chakudosuu.$inferSelect;
