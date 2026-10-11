// Jinmei / Shoyuu の MatchingKey を埋める。
//
// Importer は名前を MatchingKey (itaiji-normalize の異体字の正規化) で突き合わせるが、
// SQL では同じキーを計算できないので、移行の後でこのスクリプトで埋める。
// Jinmei は MatchingKey が一意なので、キーが同じになる名前は Id の小さい行にまとめ、
// それを参照する KishuMei / ChoukyoushiMei / Choukyou / Record も付け替える。
//
//   bun migration/fill-matching-key.ts <移行先 keiba.sqlite>
//
// SQLite 専用。MySQL / PostgreSQL へ移行した場合は、同じ計算(jinmeiMatchingKey)で
// MatchingKey を更新し、同じキーの Jinmei をまとめること。
import { Database } from "bun:sqlite";
import { jinmeiMatchingKey } from "../src/app/daos/JinmeiDao";

const path = process.argv[2];
if (!path) {
  console.error("usage: bun migration/fill-matching-key.ts <keiba.sqlite>");
  process.exit(1);
}

const db = new Database(path);
db.transaction(() => {
  fillJinmei();
  fillShoyuu();
})();

function fillJinmei() {
  const rows = db
    .query<{ Id: number; Meishou: string }, []>("SELECT Id, Meishou FROM Jinmei ORDER BY Id")
    .all();
  // 計算したキーが他の行の仮のキーとぶつからないよう、いったん Id から作った値にする
  db.run("UPDATE Jinmei SET MatchingKey = '#' || Id");

  const update = db.prepare("UPDATE Jinmei SET MatchingKey = ? WHERE Id = ?");
  // 付け替え先に同じ行がある連関は UPDATE OR IGNORE で残るので、その後で消す
  const relink = [
    "UPDATE OR IGNORE KishuMei SET JinmeiId = ?1 WHERE JinmeiId = ?2",
    "DELETE FROM KishuMei WHERE JinmeiId = ?2",
    "UPDATE OR IGNORE ChoukyoushiMei SET JinmeiId = ?1 WHERE JinmeiId = ?2",
    "DELETE FROM ChoukyoushiMei WHERE JinmeiId = ?2",
    "UPDATE Choukyou SET TanshukuKishuMeiId = ?1 WHERE TanshukuKishuMeiId = ?2",
    "UPDATE Record SET TanshukuKishuMeiId = ?1 WHERE TanshukuKishuMeiId = ?2",
    "DELETE FROM Jinmei WHERE Id = ?2",
  ].map((sql) => db.prepare(sql));

  const idByKey = new Map<string, number>();
  let merged = 0;
  for (const row of rows) {
    const key = jinmeiMatchingKey(row.Meishou);
    const to = idByKey.get(key);
    if (to === undefined) {
      idByKey.set(key, row.Id);
      update.run(key, row.Id);
    } else {
      for (const stmt of relink) {
        stmt.run(to, row.Id);
      }
      merged++;
    }
  }
  console.log(`Jinmei: ${rows.length} 件の MatchingKey を設定し、${merged} 件を同じ名前にまとめた`);
}

function fillShoyuu() {
  const rows = db
    .query<{ Id: number; Meishou: string }, []>(
      "SELECT Id, Meishou FROM Shoyuu WHERE MatchingKey IS NULL",
    )
    .all();
  const update = db.prepare("UPDATE Shoyuu SET MatchingKey = ? WHERE Id = ?");
  for (const row of rows) {
    update.run(jinmeiMatchingKey(row.Meishou), row.Id);
  }
  console.log(`Shoyuu: ${rows.length} 件の MatchingKey を設定した`);
}
