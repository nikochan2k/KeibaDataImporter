import { index, integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";
import { JinmeiKubun } from "./Jinmei";

export const ChoukyoushiMei = sqliteTable(
  "ChoukyoushiMei",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    ChoukyoushiId: integer().notNull(),
    JinmeiId: integer().notNull(),
    Kubun: integer().$type<JinmeiKubun>().notNull(),
  },
  (t) => [
    uniqueIndex("IxChoukyoushiMei1").on(t.ChoukyoushiId, t.JinmeiId, t.Kubun),
    index("IxChoukyoushiMei2").on(t.JinmeiId),
  ],
);

export type ChoukyoushiMei = typeof ChoukyoushiMei.$inferSelect;
