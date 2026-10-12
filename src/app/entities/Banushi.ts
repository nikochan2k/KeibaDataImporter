import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * 馬主。名前 (正式名・略称・フリガナ・欧字) は BanushiMei で Shoyuu (生産者と共用の名前の辞書) につなぎ、
 * 持っていた馬は UmaBanushi でつなぐ。
 * KOL・JRDB の馬主は名前だけ、JV-Data の馬主はコードもある。名前は必ず 1 つ以上ある。
 */
export const Banushi = sqliteTable(
  "Banushi",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    /** JV-Data の馬主コード (6 桁) */
    JvDataCode: text(),
    /** JRDB の馬主会コード */
    BanushiKaiCode: integer(),
    /** 服色標示 (例: 水色，赤山形一本輪，水色袖) */
    Fukushoku: text(),
  },
  (t) => [uniqueIndex("IxBanushi1").on(t.JvDataCode)],
);

export type Banushi = typeof Banushi.$inferSelect;
