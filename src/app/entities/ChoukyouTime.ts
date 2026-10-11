import { integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** 調教のハロンごとの時計。主キーは (調教ID, ハロン) */
export const ChoukyouTime = sqliteTable(
  "ChoukyouTime",
  {
    ChoukyouId: integer().notNull(),
    F: integer().notNull(),
    Time: real(),
    Comment: text(),
  },
  (t) => [primaryKey({ columns: [t.ChoukyouId, t.F] })],
);

export type ChoukyouTime = typeof ChoukyouTime.$inferSelect;
