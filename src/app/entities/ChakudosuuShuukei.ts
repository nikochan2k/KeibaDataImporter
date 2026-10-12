import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import type { ChakudosuuKikan, ChakudosuuTaishou } from "../converters/Chakudosuu";

/**
 * 出走時点の着度数 (Chakudosuu) の対象・期間ごとの集計。賞金 (円) は中央のもの。
 * 馬は平地・障害の本賞金・付加賞金・収得賞金と脚質傾向、
 * 騎手・調教師は平地・障害の本賞金・付加賞金、馬主・生産者は本賞金・付加賞金の合計がある。
 */
export const ChakudosuuShuukei = sqliteTable(
  "ChakudosuuShuukei",
  {
    RaceId: integer().notNull(),
    UmaId: integer().notNull(),
    Taishou: integer().$type<ChakudosuuTaishou>().notNull(),
    Kikan: integer().$type<ChakudosuuKikan>().notNull(),
    /** 対象の騎手 (Kishu)・調教師 (Choukyoushi)・馬主 (Banushi)・生産者 (Seisansha) の Id。馬は UmaId */
    TaishouId: integer(),
    /** 本年の成績の年 */
    Nen: integer(),
    HeichiHonShoukin: integer(),
    ShougaiHonShoukin: integer(),
    HeichiFukaShoukin: integer(),
    ShougaiFukaShoukin: integer(),
    /** 平地の収得賞金 (中央と中央以外。馬だけ) */
    HeichiShuutokuShoukin: integer(),
    ShougaiShuutokuShoukin: integer(),
    /** 本賞金の合計 (馬主・生産者) */
    HonShoukin: integer(),
    FukaShoukin: integer(),
    /** 脚質傾向 (過去の中央のレースの脚質の回数。馬だけ) */
    Nige: integer(),
    Senkou: integer(),
    Sashi: integer(),
    Oikomi: integer(),
    /** JRA-VAN に登録されている成績のレース数 (馬だけ) */
    TourokuRaceSuu: integer(),
  },
  (t) => [primaryKey({ columns: [t.RaceId, t.UmaId, t.Taishou, t.Kikan] })],
);

export type ChakudosuuShuukei = typeof ChakudosuuShuukei.$inferSelect;
