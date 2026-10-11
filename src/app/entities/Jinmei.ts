import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/** 人名の区分。名前がどの区分かは人によって違うため、KishuMei / ChoukyoushiMei に持つ */
export enum JinmeiKubun {
  Seimei,
  Tanshuku,
  Furigana,
}

/**
 * 人名の辞書。突き合わせ用のキーが同じ名前(異体字・空白の違い)は1行にまとめ、
 * Meishou には最初に取り込んだ表記を残す。
 */
export const Jinmei = sqliteTable(
  "Jinmei",
  {
    Id: integer().primaryKey({ autoIncrement: true }),
    Meishou: text().notNull(),
    /** 突き合わせ用のキー (異体字などを揃えたもの) */
    MatchingKey: text().notNull(),
  },
  (t) => [uniqueIndex("IxJinmei").on(t.MatchingKey)],
);

export type Jinmei = typeof Jinmei.$inferSelect;
