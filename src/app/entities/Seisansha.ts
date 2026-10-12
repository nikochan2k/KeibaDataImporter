import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * 生産者。名前 (正式名・略称・フリガナ・欧字) は SeisanshaMei で Shoyuu (馬主と共用の名前の辞書) につなぎ、生産した馬は Seisanba。
 * KOL・JRDB・JRA-VAN の生産者は名前だけ、JV-Data の生産者はコードもある。名前は必ず 1 つ以上ある。
 */
export const Seisansha = sqliteTable(
  "Seisansha",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    /** JV-Data の生産者コード (8 桁) */
    JvDataCode: text(),
    /** 生産者の所在地 (住所自治省名) */
    Juusho: text(),
  },
  (t) => [uniqueIndex("IxSeisansha1").on(t.JvDataCode)],
);

export type Seisansha = typeof Seisansha.$inferSelect;
