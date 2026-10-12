import { index, integer, primaryKey, real, sqliteTable } from "drizzle-orm/sqlite-core";

/** レコードを持つ馬。同着があるので、1 つのレコードに複数いることがある */
export const RecordHoyuuba = sqliteTable(
  "RecordHoyuuba",
  {
    RecordId: integer().notNull(),
    UmaId: integer().notNull(),
    /** 負担重量 (kg) */
    Kinryou: real(),
    /** 騎手。JRA-VAN・JV-Data はコードがある */
    KishuId: integer(),
    /** 騎手の略称。KOL は略称だけ */
    TanshukuKishuMeiId: integer(),
    ChoukyoushiId: integer(),
  },
  (t) => [primaryKey({ columns: [t.RecordId, t.UmaId] }), index("IxRecordHoyuuba").on(t.UmaId)],
);

export type RecordHoyuuba = typeof RecordHoyuuba.$inferSelect;
