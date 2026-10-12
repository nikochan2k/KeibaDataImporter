import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Kyousouba = sqliteTable(
  "Kyousouba",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    UmaId: integer().notNull(),
    Seibetsu: integer(),
    UmaKigou: integer(),
    ChoukyoushiId: integer(),
    KoueiGaikokuChoukyoushiMei: text(),
  },
  (t) => [index("IxKyousouba").on(t.UmaId), index("IxKyousouba2").on(t.ChoukyoushiId)],
);

export type Kyousouba = typeof Kyousouba.$inferSelect;
