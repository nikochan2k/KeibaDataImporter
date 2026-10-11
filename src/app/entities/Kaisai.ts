import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Kaisai = sqliteTable(
  "Kaisai",
  {
    Id: integer().primaryKey(), // 22ビット
    Key: integer().notNull(),
    Basho: integer().notNull(),
    Nen: integer().notNull(),
    Gatsu: integer().notNull(),
    Nichi: integer().notNull(),
    Kaiji: integer(),
    Nichiji: integer(),
    Youbi: integer(),
    Kyuujitsu: integer(),
    KaisaiKubun: integer(),
    ChuuouChihouGaikoku: integer(),
    GaikokuKeibajouMei: text(),
  },
  (t) => [
    index("IxKaisai1").on(t.Key),
    index("IxKaisai2").on(t.Basho, t.Kaiji, t.Nichiji),
    index("IxKaisai3").on(t.Basho, t.Nen, t.Gatsu, t.Nichi),
  ],
);

export type Kaisai = typeof Kaisai.$inferSelect;
