import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Choukyou = sqliteTable(
  "Choukyou",
  {
    Id: integer().primaryKey(),
    UmaId: integer().notNull(),
    Noriyaku: integer(),
    TanshukuKishuMeiId: integer(),
    Nengappi: integer().notNull(),
    /** 同じ馬・同じ日・同じ場所・同じ種別の調教が複数あるときの連番(1 始まり) */
    Renban: integer().notNull(),
    Basho: integer(),
    Type: integer(),
    Course: integer(),
    BashoCourse: text(),
    Baba: integer(),
    Kaisuu: integer(),
    IchiDori: integer(),
    Oikiri: integer(),
    Ashiiro: integer(),
    OikiriSonota: text(),
    AwaseUmaId: integer(),
    AwaseKekka: integer(),
    Chakusa: integer(),
    TimeSa: real(),
    AwaseReigai: text(),
    /* JRDB 調教本追切データ */
    OiJoutai: integer(),
    /** 調教ハロンの長さ */
    ChoukyouF: integer(),
    TenF: real(),
    ChuukanF: real(),
    ShimaiF: real(),
    TenFShisuu: integer(),
    ChuukanFShisuu: integer(),
    ShimaiFShisuu: integer(),
    OikiriShisuu: integer(),
    AwaseUmaOikiriShurui: integer(),
    AwaseUmaNenrei: integer(),
    AwaseUmaClass: integer(),
  },
  (t) => [index("IxChoukyou").on(t.UmaId)],
);

export type Choukyou = typeof Choukyou.$inferSelect;
