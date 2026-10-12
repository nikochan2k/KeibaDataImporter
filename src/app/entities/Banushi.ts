import { index, integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";
import { MeishouKubun } from "./MeishouKubun";

export const Banushi = sqliteTable(
  "Banushi",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    ShussoubaId: integer().notNull(),
    ShoyuuId: integer().notNull(),
    Kubun: integer().$type<MeishouKubun>().notNull(),
  },
  (t) => [
    uniqueIndex("IxBanushi1").on(t.ShussoubaId, t.ShoyuuId, t.Kubun),
    index("IxBanushi2").on(t.ShoyuuId),
  ],
);

export type Banushi = typeof Banushi.$inferSelect;
