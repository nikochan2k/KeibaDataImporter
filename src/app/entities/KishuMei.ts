import { index, integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";
import { JinmeiKubun } from "./Jinmei";

export const KishuMei = sqliteTable(
  "KishuMei",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    KishuId: integer().notNull(),
    JinmeiId: integer().notNull(),
    Kubun: integer().$type<JinmeiKubun>().notNull(),
  },
  (t) => [
    uniqueIndex("IxKishuMei1").on(t.KishuId, t.JinmeiId, t.Kubun),
    index("IxKishuMei2").on(t.JinmeiId),
  ],
);

export type KishuMei = typeof KishuMei.$inferSelect;
