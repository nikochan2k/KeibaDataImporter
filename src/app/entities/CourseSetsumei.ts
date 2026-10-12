import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * JV-Data のコース情報 (CS)。コースの説明文。
 * 主キーは (場所, 距離, トラックコード, コース改修年月日)。トラックコードは JV-Data のコード表 2009 のまま持ち、
 * レース (Race) と同じ芝・ダート・回り・内外も持つ (トラックコードと 1 対 1 ではないので主キーにはしない)。
 */
export const CourseSetsumei = sqliteTable(
  "CourseSetsumei",
  {
    Basho: integer().notNull(),
    Kyori: integer().notNull(),
    TrackCode: integer().notNull(),
    /** コース改修後、最初に行われた開催日 (yyyymmdd) */
    KaishuuNengappi: integer().notNull(),
    DirtShiba: integer(),
    MigiHidari: integer(),
    UchiSoto: integer(),
    Setsumei: text(),
  },
  (t) => [primaryKey({ columns: [t.Basho, t.Kyori, t.TrackCode, t.KaishuuNengappi] })],
);

export type CourseSetsumei = typeof CourseSetsumei.$inferSelect;
