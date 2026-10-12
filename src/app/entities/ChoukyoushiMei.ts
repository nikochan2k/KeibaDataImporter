import { index, integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";
import { MeishouKubun } from "./MeishouKubun";

export const ChoukyoushiMei = sqliteTable(
  "ChoukyoushiMei",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    ChoukyoushiId: integer().notNull(),
    JinmeiId: integer().notNull(),
    Kubun: integer().$type<MeishouKubun>().notNull(),
  },
  (t) => [
    uniqueIndex("IxChoukyoushiMei1").on(t.ChoukyoushiId, t.JinmeiId, t.Kubun),
    index("IxChoukyoushiMei2").on(t.JinmeiId),
  ],
);

export type ChoukyoushiMei = typeof ChoukyoushiMei.$inferSelect;
