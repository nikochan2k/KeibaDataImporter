import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const Choukyoushi = sqliteTable(
  "Choukyoushi",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    KolKyuushaCode: integer(),
    JrdbChoukyoushiCode: integer(),
    JvDataChoukyoushiCode: text(),
    Seinengappi: integer(),
    Seibetsu: integer(),
    HatsuMenkyoNen: integer(),
    TouzaiBetsu: integer(),
    ShozokuBasho: integer(),
    ShozokuBashoMei: text(),
    /** 招待区分 (1:地方 2:外国) */
    ShoutaiKubun: integer(),
    RitsuHokuNanBetsu: integer(),
    MenkyoKoufuNengappi: integer(),
    MenkyoMasshouNengappi: integer(),
  },
  (t) => [
    uniqueIndex("IxChoukyoushi1").on(t.KolKyuushaCode),
    uniqueIndex("IxChoukyoushi2").on(t.JrdbChoukyoushiCode),
    uniqueIndex("IxChoukyoushi3").on(t.JvDataChoukyoushiCode),
    index("IxChoukyoushi4").on(t.Seinengappi),
  ],
);

export type Choukyoushi = typeof Choukyoushi.$inferSelect;
