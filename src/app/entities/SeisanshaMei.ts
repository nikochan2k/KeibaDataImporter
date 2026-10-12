import { index, integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";
import { MeishouKubun } from "./MeishouKubun";

/**
 * 生産者の名前。生産者 (Seisansha) と名前 (Shoyuu) は多対多
 * (KOL の正式名と略称のように 1 人に名前が複数あり、同じ名前の別の生産者もいる)。
 * 正式名は法人格を除いたもの。外国の生産者の正式名は欧字の頭 70 バイト。
 */
export const SeisanshaMei = sqliteTable(
  "SeisanshaMei",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    SeisanshaId: integer().notNull(),
    ShoyuuId: integer().notNull(),
    Kubun: integer().$type<MeishouKubun>().notNull(),
  },
  (t) => [
    uniqueIndex("IxSeisanshaMei1").on(t.SeisanshaId, t.ShoyuuId, t.Kubun),
    index("IxSeisanshaMei2").on(t.ShoyuuId),
  ],
);

export type SeisanshaMei = typeof SeisanshaMei.$inferSelect;
