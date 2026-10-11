import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const TokubetsuMei = sqliteTable(
  "TokubetsuMei",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    Meishou: text().notNull(),
  },
  (t) => [uniqueIndex("IxTokubetsuMei").on(t.Meishou)],
);

export type TokubetsuMei = typeof TokubetsuMei.$inferSelect;
