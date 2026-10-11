import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Shussouba = sqliteTable(
  "Shussouba",
  {
    Id: integer().primaryKey(),
    RaceId: integer().notNull(),
    /* KOL 出馬表出走馬データ／競走成績出走馬データ */
    Wakuban: integer(),
    Umaban: integer().notNull(),
    KyousoubaId: integer(),
    Nenrei: integer(),
    Kinryou: real(),
    KishuId: integer(),
    KishuTouzaiBetsu: integer(),
    KishuShozokuBasho: integer(),
    KishuShozokuChoukyoushiId: integer(),
    MinaraiKubun: integer(),
    Norikawari: integer(),
    /** ブリンカー(1:初装着, 2:再装着, 3:ブリンカー)。装着なしは null */
    Blinker: integer(),
    /* JRDB 競走馬データ */
    WakuKakuteiBataijuu: integer(),
    WakuKakuteiZougen: integer(),
    TorikeshiShubetsu: integer(),
    /* KOL 競走成績出走馬データ */
    KyuuyouRiyuuCode: integer(),
    KyuuyouRiyuu: text(),
    KolNengappi: integer(),
  },
  (t) => [
    index("IxShussouba1").on(t.RaceId, t.Umaban),
    index("IxShussouba2").on(t.KyousoubaId),
    index("IxShussouba3").on(t.KishuId),
  ],
);

export type Shussouba = typeof Shussouba.$inferSelect;
