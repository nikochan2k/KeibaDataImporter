import { getTableName } from "drizzle-orm";
import { getTableConfig, type SQLiteColumn, type SQLiteTable } from "drizzle-orm/sqlite-core";
import { currentSqlite, isInTransaction, setTransactionHooks, statementCache } from "./db";

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

/** 識別子を引用符で囲む */
function id(name: string) {
  return `"${name}"`;
}

/** 準備した文 (生の SQL)。同じ key なら使い回す。値は ? で渡す */
function prepared(key: string, build: () => string) {
  return cached(key, () => currentSqlite().prepare(build()));
}

/** 条件の形 (prepared の key 用) と、? に渡す値 */
function whereParts<T extends SQLiteTable>(table: T, where: Where<T>) {
  let signature = "";
  const params: unknown[] = [];
  for (const [key, value] of Object.entries(where)) {
    if (value === undefined || value === null) {
      throw new Error(`${getTableName(table)}.${key} の条件が ${value} です`);
    }
    if (value === IS_NULL) {
      signature += `|${key}:null`;
    } else if (Array.isArray(value)) {
      signature += `|${key}:in${value.length}`;
      params.push(...value);
    } else {
      signature += `|${key}:eq`;
      params.push(value);
    }
  }
  return { signature, params };
}

/** 条件の SQL (WHERE ...)。値は whereParts の順の ? にする。条件がなければ空 */
function whereSql<T extends SQLiteTable>(where: Where<T>) {
  const conditions = Object.entries(where).map(([key, value]) => {
    if (value === IS_NULL) {
      return `${id(key)} IS NULL`;
    }
    if (Array.isArray(value)) {
      return `${id(key)} IN (${value.map(() => "?").join(",")})`;
    }
    return `${id(key)} = ?`;
  });
  return conditions.length === 0 ? "" : ` WHERE ${conditions.join(" AND ")}`;
}

/** 条件に合う最初の行。なければ null */
export function findOneBy<T extends SQLiteTable>(table: T, where: Where<T>): Row<T> | null {
  flushWritesFor(table, where);
  const { signature, params } = whereParts(table, where);
  const name = getTableName(table);
  const statement = prepared(
    `findOne:${name}${signature}`,
    () => `SELECT * FROM ${id(name)}${whereSql(where)} LIMIT 1`,
  );
  return (statement.get(...(params as never[])) as Row<T>) ?? null;
}

/** 条件に合う全部の行 */
export function findBy<T extends SQLiteTable>(table: T, where: Where<T> = {}): Row<T>[] {
  flushWrites(table);
  const { signature, params } = whereParts(table, where);
  const name = getTableName(table);
  const statement = prepared(
    `find:${name}${signature}`,
    () => `SELECT * FROM ${id(name)}${whereSql(where)}`,
  );
  return statement.all(...(params as never[])) as Row<T>[];
}

/** 条件に合う行の数 */
export function countBy<T extends SQLiteTable>(table: T, where: Where<T> = {}): number {
  flushWrites(table);
  const { signature, params } = whereParts(table, where);
  const name = getTableName(table);
  const statement = prepared(
    `count:${name}${signature}`,
    () => `SELECT COUNT(*) AS n FROM ${id(name)}${whereSql(where)}`,
  );
  return (statement.get(...(params as never[])) as { n: number }).n;
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

/** INSERT INTO 表 (項目) VALUES (?,..),(?,..) までの SQL。項目がなければ DEFAULT VALUES */
function insertSql(tableName: string, names: string[], rowCount = 1) {
  if (names.length === 0) {
    return `INSERT INTO ${id(tableName)} DEFAULT VALUES`;
  }
  const one = `(${names.map(() => "?").join(",")})`;
  return `INSERT INTO ${id(tableName)} (${names.map(id).join(",")}) VALUES ${Array(rowCount).fill(one).join(",")}`;
}

/** 項目の値を、insertSql の ? に渡す順にする */
function valuesOf(values: Record<string, unknown>) {
  return Object.values(values) as never[];
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
  const tableName = getTableName(table);
  const generated = keys.length === 1 && "autoIncrement" in keys[0] && keys[0].autoIncrement;
  if (generated && values[keys[0].name] == null) {
    const statement = prepared(
      `insertId:${tableName}|${names.join(",")}`,
      () => `${insertSql(tableName, names)} RETURNING ${id(keys[0].name)} AS id`,
    );
    const inserted = statement.get(...valuesOf(values)) as { id: number };
    (row as Record<string, unknown>)[keys[0].name] = inserted.id;
    return row as Row<T>;
  }
  const statement = prepared(`save:${tableName}|${names.join(",")}`, () => {
    const setNames = names.filter((name) => !keys.some((k) => k.name === name));
    return `${insertSql(tableName, names)} ON CONFLICT (${keys.map((k) => id(k.name)).join(",")}) ${
      0 < setNames.length
        ? `DO UPDATE SET ${setNames.map((name) => `${id(name)}=excluded.${id(name)}`).join(",")}`
        : "DO NOTHING"
    }`;
  });
  statement.run(...valuesOf(values));
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
  const tableName = getTableName(table);
  const statement = prepared(`upsert:${tableName}|${names.join(",")}`, () => {
    const setNames = names.filter((name) => !keys.some((k) => k.name === name));
    // 更新する項目がなくても、既存の行を RETURNING で受け取れるよう、主キーを同じ値で更新する
    const update = 0 < setNames.length ? setNames : [keys[0].name];
    return `${insertSql(tableName, names)} ON CONFLICT (${keys.map((k) => id(k.name)).join(",")}) DO UPDATE SET ${update
      .map((name) => `${id(name)}=excluded.${id(name)}`)
      .join(",")} RETURNING *`;
  });
  return statement.get(...valuesOf(values)) as Row<T>;
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
  const tableName = getTableName(table);
  const statement = prepared(
    `getOrCreate:${tableName}|${names.join(",")}|${target.join(",")}`,
    // 更新はしないが、既存の行を RETURNING で受け取れるよう、ユニーク列を同じ値で更新する
    () =>
      `${insertSql(tableName, names)} ON CONFLICT (${target.map(id).join(",")}) DO UPDATE SET ${id(target[0])}=${id(target[0])} RETURNING *`,
  );
  return statement.get(...valuesOf(values)) as Row<T>;
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
      const statement = prepared(`upsertAll:${tableName}|${signature}|${rowCount}`, () => {
        const setNames = names.filter((name) => !keys.some((k) => k.name === name));
        return `${insertSql(tableName, names, rowCount)} ON CONFLICT (${keys.map((k) => id(k.name)).join(",")}) ${
          0 < setNames.length
            ? `DO UPDATE SET ${setNames.map((name) => `${id(name)}=excluded.${id(name)}`).join(",")}`
            : "DO NOTHING"
        }`;
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
  const tableName = getTableName(table);
  const statement = prepared(
    `update:${tableName}|${names.join(",")}${signature}`,
    () =>
      `UPDATE ${id(tableName)} SET ${names.map((name) => `${id(name)}=?`).join(",")}${whereSql(where)}`,
  );
  statement.run(...valuesOf(values), ...(params as never[]));
}

/** 生の SQL で読む (? に params を順に当てる) */
export function query<T>(sql: string, ...params: (string | number | null)[]): T[] {
  flushWrites();
  return currentSqlite()
    .query(sql)
    .all(...params) as T[];
}
