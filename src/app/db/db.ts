import { Database } from "bun:sqlite";
import { AsyncLocalStorage } from "node:async_hooks";
import * as fs from "node:fs";
import * as path from "node:path";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

/** drizzle-kit generate が出すマイグレーション */
const MIGRATIONS = path.resolve(import.meta.dirname, "../../../drizzle");

let sqlite: Database | undefined;
let database: BunSQLiteDatabase | undefined;
let reader: Database | undefined;

/**
 * データベースを開き、マイグレーションを当てる。ファイルは環境変数 KEIBA_DB で変える。
 * 取り込み(書き込み)中も閲覧(読み込み)が止まらないよう WAL にし、閲覧用には別の接続を開く。
 */
export function openDb(file = process.env.KEIBA_DB || "db/keiba.sqlite") {
  closeDb();
  const memory = file === ":memory:";
  if (!memory) {
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  }
  sqlite = new Database(file, { create: true, readwrite: true });
  if (!memory) {
    sqlite.exec("PRAGMA journal_mode = WAL");
  }
  database = drizzle(sqlite);
  migrate(database, { migrationsFolder: MIGRATIONS });
  // メモリー上のデータベースは接続ごとに別物なので、同じ接続で読む
  reader = memory ? sqlite : new Database(file, { readwrite: true });
}

export function closeDb() {
  if (reader && reader !== sqlite) {
    reader.close();
  }
  sqlite?.close();
  sqlite = undefined;
  database = undefined;
  reader = undefined;
}

function opened<T>(value: T | undefined): T {
  if (!value) {
    throw new Error("データベースが開かれていません (openDb を呼んでください)");
  }
  return value;
}

/** 書き込み用の接続 */
export function currentDb(): BunSQLiteDatabase {
  return opened(database);
}

const statements = new WeakMap<object, Map<string, unknown>>();

/**
 * 今の接続に結びついた、準備済みの文の入れ物。接続を開き直すと別の入れ物になる。
 * 同じ形のクエリを何度も組み立てて準備し直さないよう、helpers が使う。
 */
export function statementCache(): Map<string, unknown> {
  const db = currentDb();
  let cache = statements.get(db);
  if (!cache) {
    cache = new Map();
    statements.set(db, cache);
  }
  return cache;
}

/** 書き込み用の接続 (bun:sqlite)。生の SQL を流すとき使う */
export function currentSqlite(): Database {
  return opened(sqlite);
}

/** 閲覧用の接続 (bun:sqlite)。取り込みのトランザクションの途中の行は見えない */
export function readDb(): Database {
  return opened(reader);
}

/** トランザクションの中かどうか。中で実行された処理(非同期の続きも含む)は、外側のトランザクションに加わる */
const inTransaction = new AsyncLocalStorage<boolean>();

/**
 * fn をひとつのトランザクションで実行します。fn が失敗するとロールバックされます。
 * 入れ子で呼ばれたときは、外側のトランザクションに加わります。
 * Drizzle の transaction() は bun:sqlite では途中に await を挟めないので、BEGIN / COMMIT を自分で発行します。
 */
export async function runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
  if (inTransaction.getStore()) {
    return fn();
  }
  const db = currentSqlite();
  return inTransaction.run(true, async () => {
    db.exec("BEGIN TRANSACTION");
    try {
      const result = await fn();
      db.exec("COMMIT");
      return result;
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  });
}
