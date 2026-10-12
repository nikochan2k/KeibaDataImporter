import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const Uma = sqliteTable(
  "Uma",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    KolUmaCode: integer(),
    KettouTourokuBangou: text(),
    FamilyNumber: text(),
    KanaBamei: text(),
    EigoBamei: text(),
    KyuuBamei: text(),
    Seinen: integer(),
    Seinengappi: integer(),
    Keiro: integer(),
    Kesshu: integer(),
    SanchiCode: text(),
    Sanchi: integer(),
    SanchiMei: text(),
    Seibetsu: integer(),
    ChichiUmaId: integer(),
    HahaUmaId: integer(),
    MasshouFlag: integer(),
    MasshouNengappi: integer(),
    Jiyuu: text(),
    Ikisaki: text(),
    YunyuubaFlag: integer(),
    /** 輸入年 (西暦)。JV-Data の繁殖馬マスタ・産駒マスタにある */
    YunyuuNen: integer(),
    /**
     * JV-Data の生産者コード (8 桁)。産駒マスタのように名前が分からないときのために、馬の側に持つ。
     * 生産者マスタを取り込むと、同じコードの生産者 (Seisansha) に Seisanba でつながる
     */
    JvDataSeisanshaCode: text(),
    KyoriTekisei: integer(),
    OmoKousetsu: integer(),
    DirtKousetsu: integer(),
    ShibouNen: integer(),
    ChichiKeitouCode: integer(),
    HahaChichiKeitouCode: integer(),
    /** JV-Data の系統 ID (Keitou)。系統情報 (BT) にある。JRDB の ChichiKeitouCode とは別の体系 */
    KeitouId: text(),
    /** 馬名の意味由来。JV-Data の馬名の意味由来情報 (HY) にある */
    BameiYurai: text(),
  },
  (t) => [
    uniqueIndex("IxUma1").on(t.KolUmaCode),
    uniqueIndex("IxUma2").on(t.KettouTourokuBangou),
    index("IxUma3").on(t.KanaBamei),
    index("IxUma4").on(t.EigoBamei),
    index("IxUma5").on(t.JvDataSeisanshaCode),
  ],
);

export type Uma = typeof Uma.$inferSelect;
