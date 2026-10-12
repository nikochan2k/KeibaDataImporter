import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * 重勝式 (WIN5)。1 日 1 回なので、開催日を主キーにする。
 * 対象レースは Win5Race、払戻は Win5Haraimodoshi。JV-Data の重勝式 (WF) にある。
 */
export const Win5 = sqliteTable("Win5", {
  /** 開催日 (yyyymmdd) */
  Nengappi: integer().primaryKey(),
  /**
   * いつの時点の情報か。JV-Data のデータ区分
   * (1: 詳細発表時, 2: 1 レース目確定時, 3: 払戻発表時, 7: 成績 (月曜), 9: 重勝式中止)
   */
  Kubun: integer(),
  /** 発売票数 */
  HatsubaiHyousuu: integer(),
  /** 返還の有無 (1: 返還あり) */
  HenkanFlag: integer(),
  /** 不成立の有無 (1: 不成立) */
  FuseiritsuFlag: integer(),
  /** 的中の有無 (1: 的中なし) */
  TekichuuNashiFlag: integer(),
  /** その日の開始時のキャリーオーバー (円) */
  CarryOverShoki: integer(),
  /** 次回へのキャリーオーバー (円) */
  CarryOverZandaka: integer(),
});

export type Win5 = typeof Win5.$inferSelect;
