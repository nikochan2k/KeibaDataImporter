import {
  and,
  count as countRows,
  eq,
  getTableColumns,
  getTableName,
  inArray,
  isNull,
  type SQL,
  sql,
} from "drizzle-orm";
import { getTableConfig, type SQLiteColumn, type SQLiteTable } from "drizzle-orm/sqlite-core";
import {
  currentDb,
  currentSqlite,
  isInTransaction,
  setTransactionHooks,
  statementCache,
} from "./db";

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

/**
 * 同じ形のクエリは、組み立てと準備を 1 回で済ませて使い回す (値は placeholder で渡す)。
 * 形が同じとは、表・演算・条件や項目の名前と数が同じこと。
 * 値を変換する列 (mode 付きの列など) は placeholder に変換が効かないので、使う列には使わないこと。
 */
function cached<Q>(key: string, build: () => Q): Q {
  const cache = statementCache();
  let statement = cache.get(key) as Q | undefined;
  if (statement === undefined) {
    statement = build();
    cache.set(key, statement);
  }
  return statement;
}

/** 条件の形 (cached の key 用) と、placeholder に渡す値 */
function whereParts<T extends SQLiteTable>(table: T, where: Where<T>) {
  let signature = "";
  const params: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(where)) {
    if (value === undefined || value === null) {
      throw new Error(`${getTableName(table)}.${key} の条件が ${value} です`);
    }
    if (value === IS_NULL) {
      signature += `|${key}:null`;
    } else if (Array.isArray(value)) {
      signature += `|${key}:in${value.length}`;
      value.forEach((v, i) => {
        params[`w_${key}_${i}`] = v;
      });
    } else {
      signature += `|${key}:eq`;
      params[`w_${key}`] = value;
    }
  }
  return { signature, params };
}

/** 条件の SQL。値は whereParts の placeholder (w_列名) にする */
function whereOf<T extends SQLiteTable>(table: T, where: Where<T>): SQL | undefined {
  const conditions = Object.entries(where).map(([key, value]) => {
    const column = columnOf(table, key);
    if (value === IS_NULL) {
      return isNull(column);
    }
    if (Array.isArray(value)) {
      return inArray(
        column,
        value.map((_, i) => sql.placeholder(`w_${key}_${i}`)),
      );
    }
    return eq(column, sql.placeholder(`w_${key}`));
  });
  return and(...conditions);
}

/** 条件に合う最初の行。なければ null */
export function findOneBy<T extends SQLiteTable>(table: T, where: Where<T>): Row<T> | null {
  flushWritesFor(table, where);
  const { signature, params } = whereParts(table, where);
  const statement = cached(`findOne:${getTableName(table)}${signature}`, () =>
    currentDb().select().from(table).where(whereOf(table, where)).limit(1).prepare(),
  );
  return (statement.get(params) as Row<T>) ?? null;
}

/** 条件に合う全部の行 */
export function findBy<T extends SQLiteTable>(table: T, where: Where<T> = {}): Row<T>[] {
  flushWrites(table);
  const { signature, params } = whereParts(table, where);
  const statement = cached(`find:${getTableName(table)}${signature}`, () =>
    currentDb().select().from(table).where(whereOf(table, where)).prepare(),
  );
  return statement.all(params) as Row<T>[];
}

/** 条件に合う行の数 */
export function countBy<T extends SQLiteTable>(table: T, where: Where<T> = {}): number {
  flushWrites(table);
  const { signature, params } = whereParts(table, where);
  const statement = cached(`count:${getTableName(table)}${signature}`, () =>
    currentDb().select({ n: countRows() }).from(table).where(whereOf(table, where)).prepare(),
  );
  return (statement.get(params) as { n: number }).n;
}

/** undefined の項目を除く */
function definedOf(row: object) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));
}

/** undefined と null の項目を除く (既存の値を消さないため) */
function definedNonNullOf(row: object) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value != null));
}

const primaryKeys = new WeakMap<SQLiteTable, SQLiteColumn[]>();

/** 主キーの列 */
function keysOf(table: SQLiteTable): SQLiteColumn[] {
  let keys = primaryKeys.get(table);
  if (!keys) {
    const config = getTableConfig(table);
    keys = config.primaryKeys[0]?.columns ?? config.columns.filter((c) => c.primary);
    primaryKeys.set(table, keys);
  }
  return keys;
}

/** 項目名から、値を placeholder (v_項目名) にした行を作る */
function placeholders(names: string[]) {
  return Object.fromEntries(names.map((name) => [name, sql.placeholder(`v_${name}`)]));
}

/** 項目の値を、placeholder に渡す形 (v_項目名) にする */
function paramsOf(values: Record<string, unknown>) {
  const params: Record<string, unknown> = {};
  for (const name in values) {
    params[`v_${name}`] = values[name];
  }
  return params;
}

/**
 * 行を保存する (TypeORM の save)。主キーの行があれば渡した項目だけ更新し、なければ追加する。
 * undefined と null の項目は書かない (既存の値を消さない)。
 * 自動採番の主キーが空なら追加して、採番された Id を row に入れる。row をそのまま返す。
 */
export function save<T extends SQLiteTable>(table: T, row: Partial<Row<T>>): Row<T> {
  flushWrites(table);
  const keys = keysOf(table);
  const values = definedNonNullOf(row);
  const names = Object.keys(values);
  const params = paramsOf(values);
  const generated = keys.length === 1 && "autoIncrement" in keys[0] && keys[0].autoIncrement;
  if (generated && values[keys[0].name] == null) {
    const statement = cached(`insertId:${getTableName(table)}|${names.join(",")}`, () =>
      currentDb()
        .insert(table)
        .values(placeholders(names) as never)
        .returning({ id: keys[0] })
        .prepare(),
    );
    const inserted = statement.get(params) as { id: number };
    (row as Record<string, unknown>)[keys[0].name] = inserted.id;
    return row as Row<T>;
  }
  const statement = cached(`save:${getTableName(table)}|${names.join(",")}`, () => {
    const setNames = names.filter((name) => !keys.some((k) => k.name === name));
    const insert = currentDb()
      .insert(table)
      .values(placeholders(names) as never);
    return 0 < setNames.length
      ? insert.onConflictDoUpdate({ target: keys, set: placeholders(setNames) as never }).prepare()
      : insert.onConflictDoNothing({ target: keys }).prepare();
  });
  statement.run(params);
  return row as Row<T>;
}

/**
 * 主キーが決まっている行を、読み戻さずに 1 文で追加または更新する (INSERT ... ON CONFLICT DO UPDATE)。
 * undefined の項目は書かない。skipNull (既定 true) のときは null の項目も書かず、既存の値を消さない。
 * null で消したいときだけ skipNull = false にする。
 * 保存後の行 (既存の値と合わせたもの) を返す。
 * 追加の時点で NOT NULL 列が空だと、既存の行があっても失敗するので、NOT NULL 列のある表では、row にそれらを必ず入れる。
 */
export function upsert<T extends SQLiteTable>(
  table: T,
  row: Partial<Row<T>>,
  skipNull = true,
): Row<T> {
  flushWrites(table);
  const keys = keysOf(table);
  const values = Object.fromEntries(
    Object.entries(definedOf(row)).filter(([, value]) => !(skipNull && value === null)),
  );
  const names = Object.keys(values);
  const statement = cached(`upsert:${getTableName(table)}|${names.join(",")}`, () => {
    const setNames = names.filter((name) => !keys.some((k) => k.name === name));
    // 更新する項目がなくても、既存の行を RETURNING で受け取れるよう、主キーを同じ値で更新する
    const update = placeholders(0 < setNames.length ? setNames : [keys[0].name]);
    return currentDb()
      .insert(table)
      .values(placeholders(names) as never)
      .onConflictDoUpdate({ target: keys, set: update as never })
      .returning()
      .prepare();
  });
  return statement.get(paramsOf(values)) as Row<T>;
}

/**
 * ユニーク制約の列 (target) が同じ行があればそれを、なければ row を追加して、その行を返す (INSERT ... ON CONFLICT DO UPDATE ... RETURNING)。
 * 既存の行の値は変えない (最初に登録された値が残る)。名前の表のような「あれば取得、なければ作成」用。
 * target は表のユニークインデックスと同じ列の組にすること。undefined の項目は書かない。
 */
export function getOrCreate<T extends SQLiteTable>(
  table: T,
  row: Partial<Row<T>>,
  target: readonly (keyof Row<T> & string)[],
): Row<T> {
  flushWrites(table);
  const values = definedOf(row);
  const names = Object.keys(values);
  const statement = cached(
    `getOrCreate:${getTableName(table)}|${names.join(",")}|${target.join(",")}`,
    () => {
      const columns = target.map((name) => columnOf(table, name));
      // 更新はしないが、既存の行を RETURNING で受け取れるよう、ユニーク列を同じ値で更新する
      return currentDb()
        .insert(table)
        .values(placeholders(names) as never)
        .onConflictDoUpdate({
          target: columns,
          set: { [target[0]]: sql`${columns[0]}` } as never,
        })
        .returning()
        .prepare();
    },
  );
  return statement.get(paramsOf(values)) as Row<T>;
}

/** SQLite の 1 文に渡せる変数の上限 (SQLITE_MAX_VARIABLE_NUMBER) に収まるよう、複数行の追加を分ける大きさ */
const MAX_VARIABLES = 30000;

/**
 * 主キーが決まっている複数の行を、まとめて追加または更新する (複数行の INSERT ... ON CONFLICT DO UPDATE)。
 * undefined の項目は書かず、渡した項目だけ更新する。skipNull (既定 true) のときは null の項目も書かない。保存後の行は読み戻さない。
 * 項目の組が同じ行ごとに 1 文にまとめるので、同じ項目を持つ行が多いほど速い。
 * 同じ主キーの行が複数あるときは、項目の組が同じ行の中ではあとの行の値が残る (組が違う行どうしの順序は保証しない)。
 */
export function upsertAll<T extends SQLiteTable>(
  table: T,
  rows: readonly Partial<Row<T>>[],
  skipNull = true,
): void {
  const keys = keysOf(table);
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const row of rows) {
    const values = skipNull ? definedNonNullOf(row) : definedOf(row);
    const signature = Object.keys(values).join(",");
    const group = groups.get(signature);
    if (group) {
      group.push(values);
    } else {
      groups.set(signature, [values]);
    }
  }
  const tableName = getTableName(table);
  for (const [signature, group] of groups) {
    const names = Object.keys(group[0]);
    const size = Math.max(1, Math.floor(MAX_VARIABLES / names.length));
    for (let i = 0; i < group.length; ) {
      // 行数を 2 のべきに揃えて、文の形を少数にする (文を使い回せる)
      const count = Math.min(group.length - i, size);
      const rowCount = 2 ** Math.floor(Math.log2(count));
      const params: unknown[] = [];
      for (let n = i; n < i + rowCount; n++) {
        for (const name of names) {
          params.push(group[n][name]);
        }
      }
      i += rowCount;
      const statement = cached(`upsertAll:${tableName}|${signature}|${rowCount}`, () => {
        const setNames = names.filter((name) => !keys.some((k) => k.name === name));
        const one = `(${names.map(() => "?").join(",")})`;
        const target = keys.map((k) => `"${k.name}"`).join(",");
        return currentSqlite().prepare(
          `INSERT INTO "${tableName}" (${names.map((name) => `"${name}"`).join(",")}) VALUES ${Array(rowCount).fill(one).join(",")} ` +
            (0 < setNames.length
              ? `ON CONFLICT (${target}) DO UPDATE SET ${setNames.map((name) => `"${name}"=excluded."${name}"`).join(",")}`
              : `ON CONFLICT (${target}) DO NOTHING`),
        );
      });
      statement.run(...(params as never[]));
    }
  }
}

/** 溜めておく行数の上限。超えたら書き出す (メモリーの抑制) */
const MAX_PENDING_ROWS = 5000;

const pending = new Map<SQLiteTable, Map<string, Record<string, unknown>>>();
let pendingRows = 0;

/**
 * 戻り値が要らない upsert。トランザクションの中なら溜めて、あとでまとめて書く (upsertAll)。外ならその場で書く。
 * 同じ主キーの行は項目ごとにマージする (あとの値が勝つ)。upsert を順に呼んだ結果と同じになる。
 * 溜めた行は、同じ表を読む・書く直前、生の SQL の直前、COMMIT の直前に書き出す。ROLLBACK では捨てる。
 * skipNull の意味は upsert と同じ。主キーが空の行 (自動採番の表) には使えない。
 */
export function upsertLater<T extends SQLiteTable>(
  table: T,
  row: Partial<Row<T>>,
  skipNull = true,
): void {
  const values = Object.fromEntries(
    Object.entries(definedOf(row)).filter(([, value]) => !(skipNull && value === null)),
  );
  if (!isInTransaction()) {
    upsertAll(table, [values as Partial<Row<T>>], false);
    return;
  }
  const id = keysOf(table).map((k) => {
    const value = values[k.name];
    if (value === undefined || value === null) {
      throw new Error(`${getTableName(table)}.${k.name} が空の行は溜められません`);
    }
    return value;
  });
  let rows = pending.get(table);
  if (!rows) {
    rows = new Map();
    pending.set(table, rows);
  }
  const key = JSON.stringify(id);
  const queued = rows.get(key);
  if (queued) {
    Object.assign(queued, values);
  } else {
    rows.set(key, values);
    pendingRows++;
    if (MAX_PENDING_ROWS <= pendingRows) {
      flushWrites();
    }
  }
}

/** upsertLater で溜めた行を書く。table を渡すとその表だけ */
export function flushWrites(table?: SQLiteTable): void {
  if (pendingRows === 0) {
    return;
  }
  const tables = table ? [table] : [...pending.keys()];
  for (const t of tables) {
    const rows = pending.get(t);
    if (rows) {
      pending.delete(t);
      pendingRows -= rows.size;
      upsertAll(t, [...rows.values()] as Partial<Row<typeof t>>[], false);
    }
  }
}

/**
 * where が主キーの値だけを指す (全部の主キー列の一致) とき、その行が溜まっていなければ書き出さない。
 * ほかの主キーの溜めた行は、この行の読み書きに影響しないので、溜めたままにできる。それ以外の where は表ごと書き出す。
 */
function flushWritesFor<T extends SQLiteTable>(table: T, where: Where<T>): void {
  const rows = pending.get(table);
  if (!rows) {
    return;
  }
  const keys = keysOf(table);
  const entries = Object.entries(where);
  if (
    entries.length === keys.length &&
    keys.every((k) => {
      const value = (where as Record<string, unknown>)[k.name];
      return value !== undefined && value !== null && value !== IS_NULL && !Array.isArray(value);
    })
  ) {
    const id = JSON.stringify(keys.map((k) => (where as Record<string, unknown>)[k.name]));
    if (!rows.has(id)) {
      return;
    }
  }
  flushWrites(table);
}

function discardWrites() {
  pending.clear();
  pendingRows = 0;
}

setTransactionHooks(() => flushWrites(), discardWrites);

/** 条件に合う行の項目を更新する */
export function updateBy<T extends SQLiteTable>(
  table: T,
  where: Where<T>,
  set: Partial<Row<T>>,
): void {
  flushWritesFor(table, where);
  const values = definedOf(set);
  const names = Object.keys(values);
  if (names.length === 0) {
    return;
  }
  const { signature, params } = whereParts(table, where);
  const statement = cached(`update:${getTableName(table)}|${names.join(",")}${signature}`, () =>
    currentDb()
      .update(table)
      .set(placeholders(names) as never)
      .where(whereOf(table, where))
      .prepare(),
  );
  statement.run({ ...paramsOf(values), ...params });
}

/** 生の SQL で読む (? に params を順に当てる) */
export function query<T>(sql: string, ...params: (string | number | null)[]): T[] {
  flushWrites();
  return currentSqlite()
    .query(sql)
    .all(...params) as T[];
}
