import { DataSource } from "typeorm";
import { BunSqliteDatabase } from "./BunSqlite";

export const dataSource = new DataSource({
  type: "better-sqlite3",
  driver: BunSqliteDatabase,
  database: "keiba.sqlite",
  entities: [`${import.meta.dirname}/entities/*.ts`],
  logging: ["error", "warn"],
});
