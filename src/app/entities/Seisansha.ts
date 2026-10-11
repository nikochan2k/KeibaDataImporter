import { index, integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

export const Seisansha = sqliteTable(
  "Seisansha",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    UmaId: integer().notNull(),
    ShoyuuId: integer().notNull(),
  },
  (t) => [
    uniqueIndex("IxSeisansha1").on(t.UmaId, t.ShoyuuId),
    index("IxSeisansha2").on(t.ShoyuuId),
  ],
);

export type Seisansha = typeof Seisansha.$inferSelect;
