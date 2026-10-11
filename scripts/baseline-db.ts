/**
 * TypeORM の synchronize で作ったデータベースを、Drizzle のマイグレーションの管理下に置く (1 回だけ実行する)。
 * 最初のマイグレーション (drizzle/0000_*.sql) と同じスキーマであることを確かめてから、
 * それを適用済みとして __drizzle_migrations に記録する。以後は起動時の migrate() で続きのマイグレーションが当たる。
 *
 *   bun scripts/baseline-db.ts [データベース (既定は db/keiba.sqlite)]
 *
 * 実行前にデータベースのバックアップを取ること。
 */
import { Database } from "bun:sqlite";
import * as path from "node:path";
import { readMigrationFiles } from "drizzle-orm/migrator";

const file = process.argv[2] || "db/keiba.sqlite";
const migrationsFolder = path.resolve(import.meta.dirname, "../drizzle");
const [first] = readMigrationFiles({ migrationsFolder });

const target = new Database(file, { readwrite: true });
if (target.query("SELECT 1 FROM sqlite_master WHERE name = '__drizzle_migrations'").get()) {
  console.log(`${file} はすでに Drizzle の管理下にあります`);
  process.exit(0);
}

// 最初のマイグレーションだけを当てた空のデータベースと、スキーマを比べる
const fresh = new Database(":memory:");
for (const statement of first.sql) {
  fresh.exec(statement);
}

/** テーブルごとの列(名前・NOT NULL・主キー)、インデックス(名前・一意・列)、AUTOINCREMENT */
function schemaOf(db: Database) {
  const tables = db
    .query(
      "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    .all() as { name: string; sql: string }[];
  return tables.map(({ name, sql }) => ({
    name,
    columns: db
      .query('SELECT name, "notnull", pk FROM pragma_table_info(?) ORDER BY cid')
      .all(name),
    indexes: (
      db
        .query(
          'SELECT name, "unique" FROM pragma_index_list(?) WHERE origin = \'c\' ORDER BY name',
        )
        .all(name) as { name: string; unique: number }[]
    ).map((index) => ({
      ...index,
      columns: db.query("SELECT name FROM pragma_index_info(?) ORDER BY seqno").all(index.name),
    })),
    autoIncrement: /AUTOINCREMENT/i.test(sql),
  }));
}

const expected = JSON.stringify(schemaOf(fresh));
const actual = JSON.stringify(schemaOf(target));
if (expected !== actual) {
  console.error(`${file} のスキーマが ${first.folderMillis} のマイグレーションと一致しません。記録しませんでした`);
  process.exit(1);
}

// drizzle-orm の migrate() と同じ表に、適用済みとして記録する
target.exec(
  'CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)',
);
target
  .query('INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES (?, ?)')
  .run(first.hash, first.folderMillis);
console.log(`${file} を Drizzle の管理下に置きました`);
