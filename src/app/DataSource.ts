import * as fs from "node:fs";
import * as path from "node:path";
import { DataSource } from "typeorm";
import { BunSqliteDatabase } from "./BunSqlite";

const database = process.env.KEIBA_DB || "db/keiba.sqlite";
if (database !== ":memory:") {
  fs.mkdirSync(path.dirname(path.resolve(database)), { recursive: true });
}

export const dataSource = new DataSource({
  type: "better-sqlite3",
  driver: BunSqliteDatabase,
  database,
  entities: [`${import.meta.dirname}/entities/*.ts`],
  logging: ["error", "warn"],
});
