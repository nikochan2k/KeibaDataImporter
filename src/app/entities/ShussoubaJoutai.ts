import { integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

export enum Kubun {
  // KYG, KYH, KYI
  TaikeiSougaou,
  UmaTokki,
  // SKB
  Tokki,
  Bagu,
  BaguHami,
  BaguBandage,
  BaguTeitetsu,
  BaguHidume,
  BaguSoe,
  BaguKotsuryuu,
  AshimotoSougou,
  AshimotoHidariMae,
  AshimotoMigiMae,
  AshimotoHidariUshiro,
  AshimotoMigiUshiro,
}

export const ShussoubaJoutai = sqliteTable(
  "ShussoubaJoutai",
  {
    Id: integer().primaryKey(),
    ShussoubaId: integer().notNull(),
    Kubun: integer().$type<Kubun>().notNull(),
    Code: integer(),
  },
  (t) => [uniqueIndex("IxShussoubaJoutai").on(t.ShussoubaId, t.Kubun, t.Code)],
);

export type ShussoubaJoutai = typeof ShussoubaJoutai.$inferSelect;
