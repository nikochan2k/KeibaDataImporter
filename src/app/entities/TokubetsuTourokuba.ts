import { index, integer, primaryKey, real, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * 特別登録馬。特別レースに登録した馬で、出走馬 (Shussouba) ではない (馬番がなく、大半は出走しない)。
 * 主キーは (レース, 馬)。JV-Data の特別登録馬 (TK) と JRA-VAN の特別登録馬 (JracTok1) にある。
 */
export const TokubetsuTourokuba = sqliteTable(
  "TokubetsuTourokuba",
  {
    RaceId: integer().notNull(),
    UmaId: integer().notNull(),
    /** 特別登録馬の一覧での連番 */
    Renban: integer(),
    KyousoubaId: integer(),
    /** 負担重量 (kg)。ハンデキャップ競走はハンデ発表後に入る */
    Kinryou: real(),
    /** 交流区分 (1: 地方馬, 2: 外国馬)。JV-Data だけにある */
    KouryuuKubun: integer(),
  },
  (t) => [primaryKey({ columns: [t.RaceId, t.UmaId] }), index("IxTokubetsuTourokuba").on(t.UmaId)],
);

export type TokubetsuTourokuba = typeof TokubetsuTourokuba.$inferSelect;
