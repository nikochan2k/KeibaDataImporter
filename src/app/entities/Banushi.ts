import { index, integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

export const Banushi = sqliteTable(
  "Banushi",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    ShussoubaId: integer().notNull(),
    ShoyuuId: integer().notNull(),
  },
  (t) => [
    uniqueIndex("IxBanushi1").on(t.ShussoubaId, t.ShoyuuId),
    index("IxBanushi2").on(t.ShoyuuId),
  ],
);

export type Banushi = typeof Banushi.$inferSelect;
