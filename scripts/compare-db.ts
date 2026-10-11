/**
 * 2 つの SQLite データベースを、テーブルごとに件数と内容で比べる。
 * 実装を置き換えたときに、同じデータを取り込んだ結果が変わらないことを確かめるのに使う。
 *
 *   bun scripts/compare-db.ts <比較元.sqlite> <比較先.sqlite>
 *
 * 差があれば、テーブルごとに片方にしかない行の件数と先頭の数行を出し、終了コード 1 で終わる。
 */
import { Database } from "bun:sqlite";

const [before, after] = process.argv.slice(2);
if (!before || !after) {
  console.error("使い方: bun scripts/compare-db.ts <比較元.sqlite> <比較先.sqlite>");
  process.exit(2);
}

const db = new Database(before, { readonly: true });
db.exec(`ATTACH DATABASE '${after.replaceAll("'", "''")}' AS other`);

const tablesOf = (schema: string) =>
  db
    .query(
      `SELECT name FROM ${schema}.sqlite_master
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%'
        ORDER BY name`,
    )
    .all()
    .map((row: { name: string }) => row.name);

const columnsOf = (schema: string, table: string) =>
  db
    .query(`SELECT name FROM ${schema}.pragma_table_info(?) ORDER BY name`)
    .all(table)
    .map((row: { name: string }) => row.name);

const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;

let different = false;
const beforeTables = tablesOf("main");
const afterTables = tablesOf("other");
for (const table of beforeTables.filter((t) => !afterTables.includes(t))) {
  console.log(`${table}: 比較先にありません`);
  different = true;
}
for (const table of afterTables.filter((t) => !beforeTables.includes(t))) {
  console.log(`${table}: 比較元にありません`);
  different = true;
}

for (const table of beforeTables.filter((t) => afterTables.includes(t))) {
  const beforeColumns = columnsOf("main", table);
  const afterColumns = columnsOf("other", table);
  if (beforeColumns.join() !== afterColumns.join()) {
    console.log(`${table}: 列が違います (${beforeColumns.join(",")}) / (${afterColumns.join(",")})`);
    different = true;
    continue;
  }
  const columns = beforeColumns.map(quote).join(", ");
  const name = quote(table);
  const onlyIn = (a: string, b: string) =>
    db.query(`SELECT ${columns} FROM ${a}.${name} EXCEPT SELECT ${columns} FROM ${b}.${name}`).all();
  const onlyBefore = onlyIn("main", "other");
  const onlyAfter = onlyIn("other", "main");
  const count = (schema: string) =>
    (db.query(`SELECT count(*) AS n FROM ${schema}.${name}`).get() as { n: number }).n;
  const counts = `${count("main")} / ${count("other")}`;
  if (onlyBefore.length === 0 && onlyAfter.length === 0) {
    console.log(`${table}: 一致 (${counts})`);
    continue;
  }
  different = true;
  console.log(
    `${table}: 不一致 (${counts}) 比較元だけ ${onlyBefore.length} 行、比較先だけ ${onlyAfter.length} 行`,
  );
  for (const row of onlyBefore.slice(0, 3)) {
    console.log(`  - ${JSON.stringify(row)}`);
  }
  for (const row of onlyAfter.slice(0, 3)) {
    console.log(`  + ${JSON.stringify(row)}`);
  }
}

process.exit(different ? 1 : 0);
