import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const ShussoubaHassouJoukyou = sqliteTable(
  "ShussoubaHassouJoukyou",
  {
    Id: integer().primaryKey(),
    RaceHassouJoukyouId: integer().notNull(),
    ShussoubaId: integer().notNull(),
  },
  (t) => [index("IxShussoubaHassouJoukyou").on(t.RaceHassouJoukyouId, t.ShussoubaId)],
);

export type ShussoubaHassouJoukyou = typeof ShussoubaHassouJoukyou.$inferSelect;
