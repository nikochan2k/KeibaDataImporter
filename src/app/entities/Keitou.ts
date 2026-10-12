import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * JV-Data の系統情報 (BT) の系統。
 * 系統 ID は 2 桁ずつ系譜を表すので、末尾の 2 桁を除くと親の系統になる。馬は Uma.KeitouId で指す。
 */
export const Keitou = sqliteTable("Keitou", {
  Id: text().primaryKey(),
  Meishou: text(),
  Setsumei: text(),
});

export type Keitou = typeof Keitou.$inferSelect;
