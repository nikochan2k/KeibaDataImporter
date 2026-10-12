# 一括 upsert の計画

[performance.md](./performance.md) の「残った課題」にある、1 行ずつの INSERT をまとめて書く構造への組み替えの計画。

## 1. 目的と見込み

- 対象: 取り込み時の 1 行ずつの `upsert` / `save`。`KOL uma` では `ShussoubaYosou` / `ShussoubaHyouka` / `RaceSeiseki` / `ShussoubaSeiseki` などが各 948 行。
- 見込み: `uma` の取り込みが 1.6 秒から 1.1 秒前後。テスト全体 (約 40 秒) への効果は数百ミリ秒。
- 効果が小さいので、**計測で見込みが出なければ途中でやめてよい**。段階 1 だけで止めることも想定する。

## 2. 現状

- `upsertAll` (`src/app/db/helpers.ts`) は実装済み。項目の組が同じ行を 1 文にまとめ、30,000 変数ごとに分ける。`ChoukyouTime` / `ShussoubaTsuukaJuni` / `OddsHaitou` で使用中。
- この 3 つは「呼び出しの中で行を全部集めてから 1 回で書く」形なので簡単だった。
- 残りは、`KolUma.save` のように 1 レコードの中で表ごとに 1 行ずつ `upsert` を呼ぶ形。**呼び出しをまたいで行を溜める仕組み**がない。
- 外部キー制約は使っていない (`references` なし、`PRAGMA foreign_keys` なし)。**親から順に書く必要はない**。performance.md の「親から順に」は、読み戻しの依存を指すもので、制約の話ではない。

## 3. 難しい点

溜めて後で書くと、次の 3 つが壊れる。

1. **自分が書いた行を後で読む** (read-your-writes)。`KolUma.save` は `findOneBy(RaceSeiseki)` / `findOneBy(Race)` / `findOneBy(Shussouba)` で、前のレコードが書いた行の有無を見て分岐している。
2. **戻り値を使う**。`upsert` は既存の値と合わせた行を返す。`saveKaisai` / `saveRace` の戻り値は後続が使う (`race.Kyori` など)。
3. **同じ主キーを複数回書く**。レコードをまたいで同じ行を上書きするとき、順序が保たれること。

## 4. 方針

`helpers.ts` に **書き込みの待ち行列** を足す。呼び出し側の変更は、戻り値を使わない `upsert` を `upsertLater` に替えるだけにする。

### 4.1 API

```ts
/** 戻り値が要らない upsert。トランザクションの中なら溜めて、あとでまとめて書く。外なら今すぐ書く */
export function upsertLater<T extends SQLiteTable>(table: T, row: Partial<Row<T>>): void;

/** 溜めた行を書く。table を渡すとその表だけ */
export function flushWrites(table?: SQLiteTable): void;
```

### 4.2 待ち行列

- 表ごとに `Map<主キーの文字列, 項目の Record>` を持つ。
- 同じ主キーが来たら**項目ごとにマージ** (あとの値が勝つ、undefined は書かない)。これは `upsert` を順に呼んだ結果と同じ。マージ後は 1 主キー 1 行なので、`upsertAll` の「組が違う行どうしの順序は保証しない」が問題にならない。
- 主キーが undefined / null の行は例外にする (自動採番の表は対象外、4.5 参照)。
- 溜める場所は、接続ごとのモジュール変数 (`statementCache` と同じ作り)。`openDb` / `closeDb` で捨てる。

### 4.3 書き出す (flush) 契機

| 契機 | 理由 |
|---|---|
| `findOneBy` / `findBy` / `countBy` / `updateBy` / `save` / `upsert` / `getOrCreate` が**同じ表**を対象にする直前 | read-your-writes。その表だけ書く |
| `query` (生の SQL) の直前 | 表がわからないので全部書く |
| `runInTransaction` の `COMMIT` の直前 | 取りこぼし防止 |
| 溜めた行数が上限 (例: 5,000 行) を超えたとき | メモリーの抑制 |

- `ROLLBACK` のときは**書かずに捨てる**。
- トランザクションの外では溜めず、その場で `upsertAll` する (テストや単発の呼び出しの挙動を変えない)。
- 同じ表を読む直前に書くので、`KolUma` の `findOneBy(RaceSeiseki)` のように**毎レコード同じ表を読む**場合は、毎回 flush して 1 行ずつ書くのと変わらない。この表は 5.1 の対象から外すか、読み取りを待ち行列を見る形に替える (4.4)。

### 4.4 読み取りを待ち行列に通す (必要な表だけ)

`findOneBy` の前に flush する代わりに、`pendingOf(table, id)` で待ち行列を先に見る手もある。ただし、

- `where` が主キー 1 つ (`{ Id }`) のときだけ使える。
- 待ち行列の行は部分的な項目しか持たないので、DB の行とマージして返す必要があり、実装が増える。

まず flush 方式で作り、計測で「読み取りのたびの flush」が残るなら、その表だけ 4.4 にする。

### 4.5 対象にしない表

- 自動採番の表 (`Uma` / `Jinmei` など)。Id の読み戻しが要る。
- 戻り値が後続に使われる `Kaisai` / `Race`。`Id` は計算できるが、`race.Kyori` などマージ後の値を使う。
- NOT NULL 列のある表で、項目が足りない行。`upsert` と同じく、追加の時点で失敗する (`upsert` の注意書きと同じ)。

## 5. 段階

各段階で、`bun test` の関連ファイルと `bun run typecheck` / `bun run lint` を通す。

### 段階 0: 計測の土台

- `uma` の取り込みの基準値を取る。performance.md の方法 (`prepare` の回数、SQL の回数と時間) を使う。
- 計測スクリプトは `scripts/` などに残さず、結果だけ performance.md に書く。

### 段階 1: 待ち行列と、一番安全な表

1. `helpers.ts` に `upsertLater` / `flushWrites` を足す。
2. `db.ts` の `runInTransaction` に COMMIT 前の flush と ROLLBACK での破棄を足す。flush は helpers の関数なので、`db.ts` が `helpers.ts` を import すると循環する。**`db.ts` に「COMMIT 前の処理」を登録する口を作り、`helpers.ts` が登録する**。
3. 戻り値を使わず、同じ表を読まれない表に適用する。
   - `ShussoubaYosou` / `ShussoubaHyouka` (`KolUma` / `KolSei*` / `KolDen*` / JRDB)
   - `ShussoubaSeiseki` (戻り値は呼び出し元で未使用)
4. performance.md の見込みどおり、まずここで `uma` の時間を測る。

### 段階 2: 読み取りがある表

- `RaceSeiseki`: `KolUma.save` が毎レコード `findOneBy` する。4.4 の方式にするか、「このファイルで書いた Id の集合」を持って読み取りを避ける。
- `Shussouba`: `saveShussouba` は `findOneBy` → `saveOrUpdate` → 戻り値の `shussouba.Id`。`Id = race.Id * 2**6 + umaban` で計算できるので、`Id` は先に決まる。「既に存在」の判定を待ち行列と DB の両方で見る必要がある。段階 1 の結果次第で着手を決める。

### 段階 3: JRDB / JRA

JRDB 系は 1 件ずつ保存する呼び出しが多く、performance.md では見送った。段階 1・2 で効果が確認できた場合のみ検討する。

## 6. テスト

`test/db.test.ts` に `describe("upsertLater")` を足す。

- トランザクションの外では、その場で書かれる。
- トランザクションの中で溜まり、COMMIT で書かれる。
- 同じ主キーの複数回は項目ごとにマージされる (一部の項目だけの行、あとの値が勝つ)。
- 同じ表の `findOneBy` / `updateBy` / `save` の前に flush されて、溜めた行が見える。
- ROLLBACK で捨てられる (DB に残らない)。
- 上限を超えると途中で書かれる。
- `openDb` で開き直すと、溜めた行は捨てられる。

結果の同一性は、既存の取り込みテスト (`kol.test.ts` / `kol-kd1.test.ts` / `kol-kd2.test.ts` / `jrdb-records.test.ts`) で確認する。さらに、**変更前後で取り込み後のデータベースの全表をダンプして比較**する (見本データを使う一回限りの検証。差異 0 件を確認する)。

## 7. リスクと対処

| リスク | 対処 |
|---|---|
| flush の取りこぼし (書かれないまま COMMIT) | COMMIT 直前の flush を `runInTransaction` に入れる。テストで確認 |
| 読み取りの前の flush 忘れ | 読み取り系の helpers は全部、先頭で `flushWrites(table)` を呼ぶ。直接 `currentSqlite()` を使う箇所を `grep` で洗う |
| 生の SQL (`query`) が溜めた行を見ない | `query` の先頭で全部 flush |
| マージ結果が逐次 upsert と違う | 全表ダンプの比較で確認 |
| `skipNull` の扱い | `upsertLater` にも `skipNull` を持たせ、溜める時点で null の項目を除く |
| 効果が小さく、複雑さだけ増える | 段階 1 の計測で、`uma` が 1.4 秒未満に縮まなければ打ち切る |

## 8. 完了条件

- 段階 1 の計測結果を performance.md に追記する (効いた手法または効かなかった手法として)。
- `bun test` 全体が通る (push 前に 1 回)。
- `bun run typecheck` / `bun run lint` が通る。
