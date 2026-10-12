import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import type { ChakudosuuKikan, ChakudosuuTaishou } from "../converters/Chakudosuu";

/**
 * 着度数 (Chakudosuu) と同じ対象・時点・期間の、賞金と脚質の集計。賞金は円。
 * データ元によって持つ項目が違う。
 */
export const ChakudosuuShuukei = sqliteTable(
  "ChakudosuuShuukei",
  {
    Taishou: integer().$type<ChakudosuuTaishou>().notNull(),
    TaishouId: integer().notNull(),
    Nengappi: integer().notNull(),
    Kikan: integer().$type<ChakudosuuKikan>().notNull(),
    /** 本年・前年の年 */
    Nen: integer(),
    HeichiHonShoukin: integer(),
    ShougaiHonShoukin: integer(),
    HeichiFukaShoukin: integer(),
    ShougaiFukaShoukin: integer(),
    HeichiShuutokuShoukin: integer(),
    ShougaiShuutokuShoukin: integer(),
    /** 本賞金の合計 (平地と障害を分けないデータ元) */
    HonShoukin: integer(),
    FukaShoukin: integer(),
    /** 総賞金 (本賞金と付加賞金の合計。KOL の競走馬) */
    SouShoukin: integer(),
    ShougaiSouShoukin: integer(),
    /** 脚質傾向 (出走したレースの脚質の回数。JV-Data の馬) */
    Nige: integer(),
    Senkou: integer(),
    Sashi: integer(),
    Oikomi: integer(),
    /** 連対したレースの脚質の回数 (KOL) */
    RentaiNige: integer(),
    RentaiSenkou: integer(),
    RentaiSashi: integer(),
    RentaiOikomi: integer(),
    /** JRA-VAN に登録されている成績のレース数 (JV-Data の馬) */
    TourokuRaceSuu: integer(),
  },
  (t) => [primaryKey({ columns: [t.Taishou, t.TaishouId, t.Nengappi, t.Kikan] })],
);

export type ChakudosuuShuukei = typeof ChakudosuuShuukei.$inferSelect;
