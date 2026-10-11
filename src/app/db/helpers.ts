import {
  and,
  count as countRows,
  eq,
  getTableColumns,
  inArray,
  isNull,
  type SQL,
} from "drizzle-orm";
import { getTableConfig, type SQLiteColumn, type SQLiteTable } from "drizzle-orm/sqlite-core";
import { currentDb, currentSqlite } from "./db";

/**
 * TypeORM の EntityManager / Repository と同じ使い方ができる、Drizzle の薄い関数。
 * 条件はオブジェクト ({ 列名: 値 }) で、すべての列が一致する行を探す。
 */

type Row<T extends SQLiteTable> = T["$inferSelect"];

/** 条件に使うと「NULL の行」になる (TypeORM の IsNull())。null や undefined は TypeORM と同じく誤りとして例外にする */
export const IS_NULL = Symbol("IS_NULL");

export type Where<T extends SQLiteTable> = {
  [K in keyof Row<T>]?: Row<T>[K] | readonly Row<T>[K][] | typeof IS_NULL;
};

function columnOf(table: SQLiteTable, key: string): SQLiteColumn {
  const column = getTableColumns(table)[key];
  if (!column) {
    throw new Error(`${getTableConfig(table).name} に ${key} 列はありません`);
  }
  return column;
}

function whereOf<T extends SQLiteTable>(table: T, where: Where<T>): SQL | undefined {
  const conditions = Object.entries(where).map(([key, value]) => {
    const column = columnOf(table, key);
    if (value === undefined || value === null) {
      throw new Error(`${getTableConfig(table).name}.${key} の条件が ${value} です`);
    }
    if (value === IS_NULL) {
      return isNull(column);
    }
    if (Array.isArray(value)) {
      return inArray(column, value);
    }
    return eq(column, value);
  });
  return and(...conditions);
}

/** 条件に合う最初の行。なければ null */
export function findOneBy<T extends SQLiteTable>(table: T, where: Where<T>): Row<T> | null {
  return (
    (currentDb().select().from(table).where(whereOf(table, where)).limit(1).get() as Row<T>) ?? null
  );
}

/** 条件に合う全部の行 */
export function findBy<T extends SQLiteTable>(table: T, where: Where<T> = {}): Row<T>[] {
  return currentDb().select().from(table).where(whereOf(table, where)).all() as Row<T>[];
}

/** 条件に合う行の数 */
export function countBy<T extends SQLiteTable>(table: T, where: Where<T> = {}): number {
  return currentDb().select({ n: countRows() }).from(table).where(whereOf(table, where)).get().n;
}

/** undefined の項目を除く (TypeORM と同じく、undefined の項目は保存しない) */
function definedOf(row: object) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));
}

/**
 * 行を保存する (TypeORM の save)。主キーの行があれば渡した項目だけ更新し、なければ追加する。
 * 自動採番の主キーが空なら追加して、採番された Id を row に入れる。row をそのまま返す。
 */
export function save<T extends SQLiteTable>(table: T, row: Partial<Row<T>>): Row<T> {
  const config = getTableConfig(table);
  const keys = config.primaryKeys[0]?.columns ?? config.columns.filter((c) => c.primary);
  const values = definedOf(row);
  const generated = keys.length === 1 && "autoIncrement" in keys[0] && keys[0].autoIncrement;
  if (generated && values[keys[0].name] == null) {
    const inserted = currentDb()
      .insert(table)
      .values(values as never)
      .returning({ id: keys[0] })
      .get() as { id: number };
    (row as Record<string, unknown>)[keys[0].name] = inserted.id;
    return row as Row<T>;
  }
  const set = Object.fromEntries(
    Object.entries(values).filter(([key]) => !keys.some((k) => k.name === key)),
  );
  const insert = currentDb()
    .insert(table)
    .values(values as never);
  if (0 < Object.keys(set).length) {
    insert.onConflictDoUpdate({ target: keys, set: set as never }).run();
  } else {
    insert.onConflictDoNothing({ target: keys }).run();
  }
  return row as Row<T>;
}

/**
 * 主キーが決まっている行を、読み戻さずに 1 文で追加または更新する (INSERT ... ON CONFLICT DO UPDATE)。
 * undefined の項目は書かない。skipNull のときは null の項目も書かず、既存の値を消さない。
 * 保存後の行 (既存の値と合わせたもの) を返す。
 * 追加の時点で NOT NULL 列が空だと、既存の行があっても失敗するので、NOT NULL 列のある表には使わない。
 */
export function upsert<T extends SQLiteTable>(
  table: T,
  row: Partial<Row<T>>,
  skipNull = false,
): Row<T> {
  const config = getTableConfig(table);
  const keys = config.primaryKeys[0]?.columns ?? config.columns.filter((c) => c.primary);
  const values = Object.fromEntries(
    Object.entries(definedOf(row)).filter(([, value]) => !(skipNull && value === null)),
  );
  const set = Object.fromEntries(
    Object.entries(values).filter(([key]) => !keys.some((k) => k.name === key)),
  );
  // 更新する項目がなくても、既存の行を RETURNING で受け取れるよう、主キーを同じ値で更新する
  const update = 0 < Object.keys(set).length ? set : { [keys[0].name]: values[keys[0].name] };
  return currentDb()
    .insert(table)
    .values(values as never)
    .onConflictDoUpdate({ target: keys, set: update as never })
    .returning()
    .get() as Row<T>;
}

/** 条件に合う行の項目を更新する */
export function updateBy<T extends SQLiteTable>(
  table: T,
  where: Where<T>,
  set: Partial<Row<T>>,
): void {
  const values = definedOf(set);
  if (Object.keys(values).length === 0) {
    return;
  }
  currentDb()
    .update(table)
    .set(values as never)
    .where(whereOf(table, where))
    .run();
}

/** 生の SQL で読む (? に params を順に当てる) */
export function query<T>(sql: string, ...params: (string | number | null)[]): T[] {
  return currentSqlite()
    .query(sql)
    .all(...params) as T[];
}
