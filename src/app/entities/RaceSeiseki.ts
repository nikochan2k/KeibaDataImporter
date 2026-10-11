import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const RaceSeiseki = sqliteTable("RaceSeiseki", {
  Id: integer().primaryKey(),
  TorikeshiTousuu: integer(),
  Pace: integer(),
  PaceShisuu: real(),
  PaceUpNokoriFalon: integer(),
  PaceNagare: integer(),
  Tenki: integer(),
  Baba: integer(),
  BabaSokudo: integer(), // 0:普通 1:速い 2:遅い
  ShougaiHeikin1F: real(),
  Shoukin1Chaku: integer(),
  Shoukin2Chaku: integer(),
  Shoukin3Chaku: integer(),
  Shoukin4Chaku: integer(),
  Shoukin5Chaku: integer(),
  Shoukin5ChakuDouchaku: integer(),
  Shoukin5ChakuDouchaku2: integer(),
  SeisaiNaiyou: text(),
  RaceComment: text(),
  KolNengappi: integer(),
});

export type RaceSeiseki = typeof RaceSeiseki.$inferSelect;
