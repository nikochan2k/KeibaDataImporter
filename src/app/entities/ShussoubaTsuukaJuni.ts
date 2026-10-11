import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const ShussoubaTsuukaJuni = sqliteTable(
  "ShussoubaTsuukaJuni",
  {
    Id: integer().primaryKey(),
    ShussoubaId: integer().notNull(),
    Bangou: integer().notNull(),
    Juni: integer(),
    Joukyou: integer(),
  },
  (t) => [index("IxShussoubaTsuukaJuni").on(t.ShussoubaId)],
);

export type ShussoubaTsuukaJuni = typeof ShussoubaTsuukaJuni.$inferSelect;
