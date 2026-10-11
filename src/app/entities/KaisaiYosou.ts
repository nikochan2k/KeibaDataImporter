import { integer, real, sqliteTable } from "drizzle-orm/sqlite-core";

export const KaisaiYosou = sqliteTable("KaisaiYosou", {
  Id: integer().primaryKey(),
  Tenki: integer(),
  ShibaBaba: integer(),
  ShibaBabaSokudo: integer(), // 0:普通 1:速い 2:遅い
  ShibaBabaUchi: integer(),
  ShibaBabaNaka: integer(),
  ShibaBabaSoto: integer(),
  ShibaBabaSa: real(),
  ChokusenBabaSaSaiuchi: real(),
  ChokusenBabaSaUchi: real(),
  ChokusenBabaSaNaka: real(),
  ChokusenBabaSaSoto: real(),
  ChokusenBabaSaOsoto: real(),
  DirtBaba: integer(),
  DirtBabaSokudo: integer(), // 0:普通 1:速い 2:遅い
  DirtBabaUchi: integer(),
  DirtBabaNaka: integer(),
  DirtBabaSoto: integer(),
  DirtBabaSa: real(),
  RenzokuNissuu: integer(),
  ShibaShurui: integer(),
  Kusatake: real(),
  Tenatsu: integer(),
  TouketsuBoushizai: integer(),
  ChuukanKousuiryou: real(),
});

export type KaisaiYosou = typeof KaisaiYosou.$inferSelect;
