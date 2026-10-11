import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const Kishu = sqliteTable(
  "Kishu",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    KolKishuCode: integer(),
    JrdbKishuCode: integer(),
    JvDataKishuCode: text(),
    Seinengappi: integer(),
    Seibetsu: integer(),
    MenkyoKoufuNengappi: integer(),
    MenkyoMasshouNengappi: integer(),
    /** 所属(1:関東, 2:関西, 3:他) */
    Shozoku: integer(),
    /** 所属調教師 (JRA-VAN) */
    ShozokuChoukyoushiId: integer(),
    /** 招待区分 (1:地方 2:外国) */
    ShoutaiKubun: integer(),
    /** 招待騎手の地域名 (外国は招待国名、地方は所属地名) */
    ShozokuBashoMei: text(),
    /** 現在の見習い区分 */
    MinaraiKubun: integer(),
  },
  (t) => [
    uniqueIndex("IxKishu1").on(t.KolKishuCode),
    uniqueIndex("IxKishu2").on(t.JrdbKishuCode),
    uniqueIndex("IxKishu3").on(t.JvDataKishuCode),
  ],
);

export type Kishu = typeof Kishu.$inferSelect;
