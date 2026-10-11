import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const Houbokusaki = sqliteTable(
  "Houbokusaki",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    Meishou: text().notNull(),
  },
  (t) => [uniqueIndex("IxHoubokusaki").on(t.Meishou)],
);

export type Houbokusaki = typeof Houbokusaki.$inferSelect;
