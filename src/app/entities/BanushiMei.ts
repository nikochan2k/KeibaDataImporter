import { index, integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";
import { MeishouKubun } from "./MeishouKubun";

/**
 * 馬主の名前。馬主 (Banushi) と名前 (Shoyuu) は多対多
 * (KOL の正式名と略称のように 1 人に名前が複数あり、同じ名前の別の馬主もいる)。
 * 正式名は法人格を除いたもの。
 */
export const BanushiMei = sqliteTable(
  "BanushiMei",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    BanushiId: integer().notNull(),
    ShoyuuId: integer().notNull(),
    Kubun: integer().$type<MeishouKubun>().notNull(),
  },
  (t) => [
    uniqueIndex("IxBanushiMei1").on(t.BanushiId, t.ShoyuuId, t.Kubun),
    index("IxBanushiMei2").on(t.ShoyuuId),
  ],
);

export type BanushiMei = typeof BanushiMei.$inferSelect;
