import { index, integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

/** 馬と、その馬の生産者 (Seisansha) */
export const Seisanba = sqliteTable(
  "Seisanba",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    UmaId: integer().notNull(),
    SeisanshaId: integer().notNull(),
  },
  (t) => [
    uniqueIndex("IxSeisanba1").on(t.UmaId, t.SeisanshaId),
    index("IxSeisanba2").on(t.SeisanshaId),
  ],
);

export type Seisanba = typeof Seisanba.$inferSelect;
