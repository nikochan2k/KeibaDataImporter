import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ShussoubaSeiseki = sqliteTable(
  "ShussoubaSeiseki",
  {
    Id: integer().primaryKey(),
    /* KOL 競走成績出走馬データ */
    Gate: integer(),
    Kinryou: real(),
    Bataijuu: integer(),
    Zougen: integer(),
    KishuId: integer(),
    KishuTouzaiBetsu: integer(),
    KishuShozokuBasho: integer(),
    KishuShozokuChoukyoushiId: integer(),
    MinaraiKubun: integer(),
    Norikawari: integer(),
    KakuteiChakujun: integer(),
    ChakujunFuka: integer(),
    NyuusenChakujun: integer(),
    TorikeshiShubetsu: integer(),
    RecordNinshiki: integer(),
    Time: real(),
    Chakusa1: integer(),
    Chakusa2: integer(),
    TimeSa: real(),
    Ten3F: real(),
    Ten3FIkou: real(),
    Douchuu: real(),
    Agari3FIzen: real(),
    Agari3F: real(),
    YonCornerIchiDori: integer(),
    /** 前3F地点での先頭とのタイム差(秒) */
    Ten3FSentouSa: real(),
    /** 後3F地点での先頭とのタイム差(秒) */
    Agari3FSentouSa: real(),
    /** 1着馬は2着馬との、それ以外は1着馬とのタイム差(秒) */
    Chaku12TimeSa: real(),
    /** 備考(地方競馬場名など) */
    Bikou: text(),
    /* KOL 騎手厩舎コメント／次走へのメモ */
    KishuKyuushaComment: text(),
    JisouhenoMemo: text(),
    /* JRDB 成績データ */
    HonShoukin: integer(),
    ShuutokuShoukin: integer(),
    KolNengappi: integer(),
  },
  (t) => [
    index("IxShussoubaSeiseki1").on(t.Time),
    index("IxShussoubaSeiseki2").on(t.Ten3F),
    index("IxShussoubaSeiseki3").on(t.Agari3F),
    index("IxShussoubaSeiseki4").on(t.KishuId),
  ],
);

export type ShussoubaSeiseki = typeof ShussoubaSeiseki.$inferSelect;
