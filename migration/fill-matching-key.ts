// Jinmei / Shoyuu の MatchingKey を埋める。
//
// Importer は名前を MatchingKey (itaiji-normalize の異体字の正規化) で突き合わせるが、
// SQL では同じキーを計算できないので、移行の後でこのスクリプトで埋める。
//
//   bun migration/fill-matching-key.ts <移行先 keiba.sqlite>
//
// SQLite 専用。MySQL / PostgreSQL へ移行した場合は、同じ計算(jinmeiMatchingKey)で
// MatchingKey が NULL の行を更新すること。
import { Database } from "bun:sqlite";
import { jinmeiMatchingKey } from "../src/app/daos/JinmeiDao";

const path = process.argv[2];
if (!path) {
  console.error("usage: bun migration/fill-matching-key.ts <keiba.sqlite>");
  process.exit(1);
}

const db = new Database(path);
db.transaction(() => {
  for (const table of ["Jinmei", "Shoyuu"]) {
    const rows = db
      .query<{ Id: number; Meishou: string }, []>(
        `SELECT Id, Meishou FROM ${table} WHERE MatchingKey IS NULL`,
      )
      .all();
    const update = db.prepare(`UPDATE ${table} SET MatchingKey = ? WHERE Id = ?`);
    for (const row of rows) {
      update.run(jinmeiMatchingKey(row.Meishou), row.Id);
    }
    console.log(`${table}: ${rows.length} 件の MatchingKey を設定した`);
  }
})();
