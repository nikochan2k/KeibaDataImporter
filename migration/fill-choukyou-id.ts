// Choukyou の Basho / Type / Course / Renban を埋め、Id を Importer と同じ規則で振り直す。
//
// Importer は Choukyou.Id を (馬, 日付, 場所, 種別, 連番) から作るが、場所・種別は KOL の文字列を
// 変換表(src/app/converters/Choukyou)でコード化した値で、SQL では同じ変換を書けないので、
// 40_choukyou.sql が仮の Id で入れた後にこのスクリプトで振り直す。ChoukyouTime の Id と ChoukyouId、
// ShussoubaChoukyou の ChoukyouId も合わせて直す。
//
//   bun migration/fill-choukyou-id.ts <移行先 keiba.sqlite>
//
// SQLite 専用。MySQL / PostgreSQL へ移行した場合は、同じ計算(getChoukyouId)で更新すること。
// 同じ馬・同じ日・同じ場所・同じ種別の調教が 5 件以上あると Id に収まらないため、エラーで止まる。
import { Database } from "bun:sqlite";
import * as $CH from "../src/app/converters/Choukyou";
import { normalize } from "../src/app/reader/Reader";
import { getChoukyouId } from "../src/app/reader/Tool";

const path = process.argv[2];
if (!path) {
  console.error("usage: bun migration/fill-choukyou-id.ts <keiba.sqlite>");
  process.exit(1);
}

const db = new Database(path);
db.transaction(() => {
  const rows = db
    .query<{ Id: number; UmaId: number; Nengappi: number; BashoCourse: string | null }, []>(
      "SELECT Id, UmaId, Nengappi, BashoCourse FROM Choukyou ORDER BY Id",
    )
    .all();

  // 新しい Id が仮の Id とぶつからないよう、いったん負の値に退避する
  db.run("UPDATE Choukyou SET Id = -Id");
  db.run("UPDATE ChoukyouTime SET Id = -Id, ChoukyouId = -ChoukyouId");
  db.run("UPDATE ShussoubaChoukyou SET ChoukyouId = -ChoukyouId");

  const updateChoukyou = db.prepare(
    "UPDATE Choukyou SET Id = ?, Basho = ?, Type = ?, Course = ?, Renban = ? WHERE Id = ?",
  );
  const updateTime = db.prepare(
    "UPDATE ChoukyouTime SET Id = ? * 8 + (F - 1), ChoukyouId = ? WHERE ChoukyouId = ?",
  );
  const updateLink = db.prepare("UPDATE ShussoubaChoukyou SET ChoukyouId = ? WHERE ChoukyouId = ?");
  const renbans = new Map<string, number>();
  for (const row of rows) {
    const bashoCourse = row.BashoCourse ? normalize(row.BashoCourse)?.replace(/\s+/g, "") : null;
    const basho = bashoCourse ? $CH.basho.toCodeFromKol(bashoCourse) : null;
    const type = bashoCourse ? $CH.type.toCodeFromKol(bashoCourse) : null;
    const course = bashoCourse ? $CH.course.toCodeFromKol(bashoCourse) : null;
    const ymd = row.Nengappi;
    const days = Date.UTC(Math.floor(ymd / 10000), (Math.floor(ymd / 100) % 100) - 1, ymd % 100) / 86400000;
    const key = `${row.UmaId}:${days}:${basho}:${type}`;
    const renban = (renbans.get(key) ?? 0) + 1;
    renbans.set(key, renban);
    const id = getChoukyouId(row.UmaId, days, basho, type, renban);
    updateChoukyou.run(id, basho, type, course, renban, -row.Id);
    updateTime.run(id, id, -row.Id);
    updateLink.run(id, -row.Id);
  }
  console.log(`Choukyou: ${rows.length} 件の Id を振り直した`);
})();
