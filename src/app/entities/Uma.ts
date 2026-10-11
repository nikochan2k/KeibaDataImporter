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
    KyoriTekisei: integer(),
    OmoKousetsu: integer(),
    DirtKousetsu: integer(),
    ShibouNen: integer(),
    ChichiKeitouCode: integer(),
    HahaChichiKeitouCode: integer(),
  },
  (t) => [
    uniqueIndex("IxUma1").on(t.KolUmaCode),
    uniqueIndex("IxUma2").on(t.KettouTourokuBangou),
    index("IxUma3").on(t.KanaBamei),
    index("IxUma4").on(t.EigoBamei),
  ],
);

export type Uma = typeof Uma.$inferSelect;
