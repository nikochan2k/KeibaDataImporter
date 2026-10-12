import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/** 競走馬の市場。JV-Data の競走馬市場取引価格 (HS) の主催者・市場コードを主キーにする */
export const Shijou = sqliteTable("Shijou", {
  Code: text().primaryKey(),
  ShusaishaMei: text(),
  Meishou: text(),
});

export type Shijou = typeof Shijou.$inferSelect;
