import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * 出走馬と調教の連関。同じ調教が複数のレースの出馬表・成績に出てくるため、
 * レース(出走馬)ごとに変わる項目はこちらに持つ。
 * Id = 出走馬Id * 2^3 + 出走馬ごとの連番(0〜7)
 */
export const ShussoubaChoukyou = sqliteTable(
  "ShussoubaChoukyou",
  {
    Id: integer().primaryKey(),
    ShussoubaId: integer().notNull(),
    ChoukyouId: integer().notNull(),
    /** KOL の調教フラグ 0:前回 1:追切り */
    ChoukyouFlag: integer(),
    Yajirushi: integer(), // 1:一変　2:平行 3:下降　4:良化　5:下降気味
    Reigai: text(),
    /** JRDB の本追切 1:本追切 */
    HonOikiri: integer(),
  },
  (t) => [
    index("IxShussoubaChoukyou1").on(t.ShussoubaId),
    index("IxShussoubaChoukyou2").on(t.ChoukyouId),
  ],
);

export type ShussoubaChoukyou = typeof ShussoubaChoukyou.$inferSelect;
