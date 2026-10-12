import { index, integer, real, sqliteTable } from "drizzle-orm/sqlite-core";
import type { RecordKubun, RecordShubetsu } from "../converters/Race";

/**
 * レコード (コースレコード・G1 レコード・距離の JRA レコード)。保持馬は RecordHoyuuba。
 * KOL・JRA-VAN はレースの出馬表・成績に、そのレースのコースのレコードがある (競馬場・距離・トラックはそのレースのもの)。
 * JV-Data はレコードマスタ (RC) にある。
 * 同じレコードは、種類・日付・場所・距離・タイムが同じ行にまとめる。
 */
export const Record = sqliteTable(
  "Record",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    Shubetsu: integer().$type<RecordShubetsu>().notNull(),
    /** レコードが出た日 (yyyymmdd) */
    Nengappi: integer().notNull(),
    /** レコードタイム (秒) */
    Time: real().notNull(),
    Kubun: integer().$type<RecordKubun>(),
    /** レコードが出た競馬場 */
    Basho: integer(),
    /** レコードが出たレース。そのレースを取り込んでいなければ Race の行はない */
    RaceId: integer(),
    Kyori: integer(),
    /** JV-Data のトラックコード (コード表 2009) */
    TrackCode: integer(),
    DirtShiba: integer(),
    MigiHidari: integer(),
    UchiSoto: integer(),
    /** JV-Data の競走種別コード (コード表 2005)。コースレコードは 2 歳と 3 歳以上で別 */
    KyousouShubetsuCode: integer(),
    /** 特別競走番号。G1 レコードのキー */
    TokubetsuBangou: integer(),
    Tenki: integer(),
    Baba: integer(),
  },
  (t) => [index("IxRecord1").on(t.Shubetsu, t.Basho, t.Kyori), index("IxRecord2").on(t.Nengappi)],
);

export type Record = typeof Record.$inferSelect;
