import { index, integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * 馬の馬主。馬主は変わるので、「その日の時点の馬主」を日付ごとに持つ。
 * 日付は、出走馬のデータならレースの日、競走馬マスタならデータ作成年月日。
 * ある日の馬主は、その日以前で最も新しい行の馬主 (取り込む順序によらず、同じ結果になる)。
 */
export const UmaBanushi = sqliteTable(
  "UmaBanushi",
  {
    UmaId: integer().notNull(),
    /** yyyymmdd */
    Nengappi: integer().notNull(),
    BanushiId: integer().notNull(),
  },
  (t) => [primaryKey({ columns: [t.UmaId, t.Nengappi] }), index("IxUmaBanushi").on(t.BanushiId)],
);

export type UmaBanushi = typeof UmaBanushi.$inferSelect;
