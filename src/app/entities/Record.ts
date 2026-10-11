import { integer, real, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

export const Record = sqliteTable(
  "Record",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    Nengappi: integer().notNull(),
    Time: real().notNull(),
    UmaId: integer().notNull(),
    Kinryou: real().notNull(),
    TanshukuKishuMeiId: integer().notNull(),
    Basho: integer().notNull(),
  },
  (t) => [uniqueIndex("IxRecord").on(t.Nengappi, t.UmaId)],
);

export type Record = typeof Record.$inferSelect;
