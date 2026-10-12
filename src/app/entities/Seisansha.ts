import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * 生産者。名前は Shoyuu (馬主と共用の名前の辞書)、生産した馬は Seisanba。
 * KOL・JRDB・JRA-VAN の生産者は名前だけ、JV-Data の生産者はコードもある。
 */
export const Seisansha = sqliteTable(
  "Seisansha",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    /** 生産者名 (法人格を除いたもの)。外国の生産者は欧字の頭 70 バイト */
    ShoyuuId: integer().notNull(),
    /** JV-Data の生産者コード (8 桁) */
    JvDataCode: text(),
    /** 生産者名のフリガナ (半角カナを全角にしたもの)。外国の生産者にはない */
    Furigana: text(),
    EigoMei: text(),
    /** 生産者の所在地 (住所自治省名) */
    Juusho: text(),
  },
  (t) => [uniqueIndex("IxSeisansha1").on(t.JvDataCode), index("IxSeisansha2").on(t.ShoyuuId)],
);

export type Seisansha = typeof Seisansha.$inferSelect;
