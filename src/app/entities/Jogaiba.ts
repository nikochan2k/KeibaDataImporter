import { index, integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * 競走除外馬 (JV-Data の競走馬除外情報 JG)。出馬投票した馬のうち、抽選などで除外された馬。
 * 同じ馬が同じ日に何度も出馬投票することがあるので、受付の順番まで主キーに含める。
 */
export const Jogaiba = sqliteTable(
  "Jogaiba",
  {
    RaceId: integer().notNull(),
    UmaId: integer().notNull(),
    /** 出馬投票受付順番 (同じ業務日付で、同じ馬を受け付けた順番) */
    UketsukeJun: integer().notNull(),
    /** 出走区分 (1: 投票馬, 2: 締切での除外馬, 4: 再投票馬, 5: 再投票除外馬, 6: 馬番を付さない出走取消馬, 9: 取消馬) */
    ShussouKubun: integer(),
    /** 除外状態区分 (1: 非抽選馬, 2: 非当選馬) */
    JogaiJoutai: integer(),
  },
  (t) => [
    primaryKey({ columns: [t.RaceId, t.UmaId, t.UketsukeJun] }),
    index("IxJogaiba").on(t.UmaId),
  ],
);

export type Jogaiba = typeof Jogaiba.$inferSelect;
