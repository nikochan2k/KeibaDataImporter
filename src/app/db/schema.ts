import type { Database } from "bun:sqlite";
import * as fs from "node:fs";
import * as path from "node:path";
import { is } from "drizzle-orm";
import { getTableConfig, SQLiteTable } from "drizzle-orm/sqlite-core";

/**
 * テーブルは src/app/entities/*.ts の定義から直接作る (マイグレーションは使わない)。
 * テーブルの構成を変えたら、データベースを作り直して取り込み直す。
 */
const ENTITIES = path.resolve(import.meta.dirname, "../entities");

/** entities/*.ts で定義した表 */
export function entityTables(): SQLiteTable[] {
  const tables: SQLiteTable[] = [];
  for (const file of fs.readdirSync(ENTITIES).sort()) {
    if (!file.endsWith(".ts")) {
      continue;
    }
    const module = require(path.join(ENTITIES, file));
    for (const value of Object.values(module)) {
      if (is(value, SQLiteTable)) {
        tables.push(value);
      }
    }
  }
  return tables;
}

function id(name: string) {
  return `"${name.replaceAll('"', '""')}"`;
}

/** 表を作る SQL (CREATE TABLE と CREATE INDEX) */
export function createTableSql(table: SQLiteTable): string[] {
  const { name, columns, indexes, primaryKeys, foreignKeys, checks, uniqueConstraints } =
    getTableConfig(table);
  if (foreignKeys.length || checks.length || uniqueConstraints.length) {
    throw new Error(`${name}: 外部キー・CHECK・UNIQUE 制約には対応していません (index を使う)`);
  }
  const definitions = columns.map((column) => {
    // 自動採番の主キーも hasDefault になるので、既定値そのものを見る
    if (column.default !== undefined || column.defaultFn || column.onUpdateFn) {
      throw new Error(`${name}.${column.name}: 既定値には対応していません`);
    }
    let definition = `${id(column.name)} ${column.getSQLType()}`;
    if (column.primary) {
      definition += " PRIMARY KEY";
      if ("autoIncrement" in column && column.autoIncrement) {
        definition += " AUTOINCREMENT";
      }
    }
    if (column.notNull) {
      definition += " NOT NULL";
    }
    return definition;
  });
  for (const primaryKey of primaryKeys) {
    definitions.push(`PRIMARY KEY (${primaryKey.columns.map((c) => id(c.name)).join(", ")})`);
  }
  const statements = [`CREATE TABLE ${id(name)} (\n  ${definitions.join(",\n  ")}\n)`];
  for (const { config } of indexes) {
    const indexColumns = config.columns.map((c) => {
      if (!("name" in c)) {
        throw new Error(`${name}.${config.name}: 式のインデックスには対応していません`);
      }
      return id(c.name);
    });
    statements.push(
      `CREATE ${config.unique ? "UNIQUE " : ""}INDEX ${id(config.name)} ON ${id(name)} (${indexColumns.join(", ")})`,
    );
  }
  return statements;
}

/** データベースにある表と列 (SQLite の内部の表は除く) */
function existingColumns(sqlite: Database) {
  const tables = sqlite
    .query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];
  return new Map(
    tables.map(({ name }) => [
      name,
      (sqlite.query(`PRAGMA table_info(${id(name)})`).all() as { name: string }[]).map(
        (c) => c.name,
      ),
    ]),
  );
}

/**
 * 空のデータベースなら表を作る。表があれば、表と列が entities の定義と同じか確かめ、違えばエラーにする
 * (テーブルの構成を変えたあとの古いデータベースは、作り直して取り込み直す)。
 */
export function ensureSchema(sqlite: Database, file: string) {
  const tables = entityTables();
  const existing = existingColumns(sqlite);
  if (existing.size === 0) {
    sqlite.transaction(() => {
      for (const table of tables) {
        for (const statement of createTableSql(table)) {
          sqlite.exec(statement);
        }
      }
    })();
    return;
  }
  const differences: string[] = [];
  const expected = new Map(
    tables.map((t) => {
      const config = getTableConfig(t);
      return [config.name, config.columns.map((c) => c.name)];
    }),
  );
  for (const [name, columns] of expected) {
    const actual = existing.get(name);
    if (!actual) {
      differences.push(`${name} がない`);
    } else if ([...columns].sort().join() !== [...actual].sort().join()) {
      differences.push(`${name} の列が違う`);
    }
  }
  for (const name of existing.keys()) {
    if (!expected.has(name)) {
      differences.push(`${name} は定義にない`);
    }
  }
  if (differences.length) {
    throw new Error(
      `${file} のテーブルが entities の定義と違います (${differences.join("、")})。データベースを作り直して取り込み直してください`,
    );
  }
}
