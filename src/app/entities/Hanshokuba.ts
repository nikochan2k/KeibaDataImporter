import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * JV-Data の繁殖登録番号と馬の対応。同じ馬に繁殖登録番号が複数あることがあるので、Uma の列にしない。
 * 繁殖馬マスタ (HN)、産駒マスタ (SK)、競走馬マスタ (UM) の 3 代血統が、この番号で祖先を指す。
 */
export const Hanshokuba = sqliteTable(
  "Hanshokuba",
  {
    HanshokuTourokuBangou: text().primaryKey(),
    UmaId: integer().notNull(),
  },
  (t) => [index("IxHanshokuba").on(t.UmaId)],
);

export type Hanshokuba = typeof Hanshokuba.$inferSelect;
