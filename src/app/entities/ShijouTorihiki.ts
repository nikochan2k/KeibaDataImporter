import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * 市場での競走馬の取引 (JV-Data の競走馬市場取引価格 HS)。
 * 同じ馬が同じ市場で何度も取引されることがあるので、市場の開催開始日まで主キーに含める。
 */
export const ShijouTorihiki = sqliteTable(
  "ShijouTorihiki",
  {
    UmaId: integer().notNull(),
    ShijouCode: text().notNull(),
    /** 市場の開催期間の開始日 (yyyymmdd) */
    KaishiNengappi: integer().notNull(),
    /** 市場の開催期間の終了日 (yyyymmdd) */
    ShuuryouNengappi: integer(),
    /** 取引時の年齢 */
    Nenrei: integer(),
    /** 取引価格 (円) */
    Kakaku: integer(),
  },
  (t) => [
    primaryKey({ columns: [t.UmaId, t.ShijouCode, t.KaishiNengappi] }),
    index("IxShijouTorihiki").on(t.ShijouCode),
  ],
);

export type ShijouTorihiki = typeof ShijouTorihiki.$inferSelect;
