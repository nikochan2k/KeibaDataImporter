# NestJS / TypeORM をやめて ElysiaJS / Drizzle にする計画

## 目的

- NestJS をやめる。HTTP は ElysiaJS にする。
- TypeORM をやめる。DB アクセスは Drizzle にする。
- DI コンテナ (Nest の DI、typedi など) は使わない。依存は ES モジュールの import で解決する。
- デコレーター (`experimentalDecorators` / `emitDecoratorMetadata` / `reflect-metadata`) をなくす。

方針は「できるだけ今のコードの形を残し、機械的に置き換える」。設計の作り直しはしない。

## 現状

- `src/app/ImporterModule.ts` に約 140 のプロバイダー (リーダー、Tool、DAO) を登録している。
  依存はプロパティの `@Inject()` (207 箇所) で、継承しているクラスでも使っている。
- 取り込み中の共有状態は `Bridge` (中身は `JrdbBridge` / `KolBridge` の項目) を DI のシングルトンで共有している。
- `Importer` はファイル名の正規表現とリーダーのクラスの対応表を持ち、`ModuleRef` でインスタンスを取り出している。
- DB は bun:sqlite を better-sqlite3 に見せかけて TypeORM に渡している (`src/app/BunSqlite.ts`)。
  スキーマは `src/app/entities` (34 エンティティ) で、起動時に `synchronize` している。
- DB アクセスは `@OrmManager()` / `@OrmRepository()` で差し込んだ `EntityManager` / `Repository` 経由。
  主な使い方は `findOneBy` (約 60)、`save` (約 15)、`createQueryBuilder` (8)、生 SQL の `query` (約 10、主に `BrowseService`)。
- トランザクションは `runInTransaction` (AsyncLocalStorage) でファイル単位にかけている。
- HTTP は `/api/imports` (取り込み、ローカル限定) と `/api/*` (閲覧) の 2 コントローラーと、`web/dist` の静的配信。
- テストは `test/container.ts` で Nest のアプリケーションコンテキストを作り、`Container.get(X)` でインスタンスを取り出している。

## 完成形

```
src/app/
  main.ts            CLI 取り込み (DI なし。traverse(dirName) を呼ぶだけ)
  server.ts          Elysia を起動する
  http/
    app.ts           Elysia アプリを組み立てて返す (テストからも使う)
    importRoutes.ts  /api/imports
    browseRoutes.ts  /api/race-months など
    localOnly.ts     ローカル限定のチェック (beforeHandle)
  db/
    schema/*.ts      Drizzle のテーブル定義 (entities を置き換える)
    db.ts            bun:sqlite + drizzle の接続、トランザクション、currentDb()
    helpers.ts       findOneBy / findBy / save / updateById (TypeORM の使い方に寄せた薄い関数)
  bridge.ts          export const bridge = {...}  (取り込み中の共有状態)
  daos/, reader/, converters/ ...   今の構成のまま。@Injectable / @Inject を外すだけ
drizzle/             drizzle-kit が出すマイグレーション SQL
drizzle.config.ts
```

### 依存の解決 (DI をやめる)

- DAO と Tool は状態を持たない (DB は `currentDb()` で取る) ので、モジュールの末尾で 1 つだけ作って export する。

  ```ts
  export class UmaDao { ... }
  export const umaDao = new UmaDao();
  ```

  使う側は `@Inject() private umaDao: UmaDao` を消して `import { umaDao } from "../daos/UmaDao"` にする。
  継承しているクラス (`Kyi extends Kyh` など) でもそのまま使える。
- `Tool` の派生 (`JrdbRaceTool` など) も同じく 1 インスタンスを export する。
- `Bridge` は `src/app/bridge.ts` の 1 つのオブジェクトにまとめる。`JrdbBridge` / `KolBridge` の項目も型として持たせ、キャストをなくす。
- リーダーは `Importer` の対応表で直接 `new` する (`type: Kyi` → `reader: new Kyi()`)。
  リーダー同士で使っているもの (`JvData` が持つレコード別リーダーなど) は、持つ側で `new` する。
- `ImportProgress` と `ImportJobService` は 1 インスタンスを export する。
- 循環 import になる箇所が出たら、その箇所だけ関数の中で参照するように直す (起動時にインスタンスを使わなければ問題にならない)。

### DB (Drizzle)

- 接続: `drizzle(new Database(path), { schema })` (`drizzle-orm/bun-sqlite`)。`BunSqlite.ts` は不要になる。
- WAL は今と同じく起動時に `PRAGMA journal_mode = WAL`。
- 閲覧用に読み取り専用の接続をもう 1 本作る。今は取り込みと閲覧が同じ接続なので、閲覧が取り込み中の未コミットの行を見てしまう。WAL なので別接続にすれば取り込み中も閲覧が止まらない。
- スキーマ: `entities/*.ts` を `sqliteTable` に書き換える。テーブル名・列名・インデックス名は今と同じにする (既存 DB をそのまま使うため)。
  - `int` / `smallint` / `tinyint` → `integer`、`varchar(n)` → `text`、`real` / `float` → `real`。
  - エンティティのクラスの代わりに `typeof uma.$inferSelect` / `$inferInsert` を型として export する (`export type Uma = typeof uma.$inferSelect`)。
  - `new Uma()` で作っている箇所は `const toBe: NewUma = {}` にする。
- トランザクション: Drizzle の `db.transaction()` は bun-sqlite では同期的に動き、途中に `await` を挟めない。
  取り込みはレコードの合間にイベントループへ処理を返す (`yieldToEventLoop`) ので、今の `runInTransaction` と同じく
  `BEGIN` / `COMMIT` / `ROLLBACK` を自分で発行し、入れ子は AsyncLocalStorage で外側に合流させる。
  接続が 1 本なので `currentDb()` は単に書き込み用の `db` を返せばよく、AsyncLocalStorage は入れ子の判定だけに使う。
- 置き換えの手引き (`db/helpers.ts`):

  | TypeORM | Drizzle |
  | --- | --- |
  | `em.findOneBy(Uma, { KolUmaCode: x })` | `findOneBy(uma, { KolUmaCode: x })` (helpers。`and(eq(...))` を組んで `.get()`) |
  | `repo.findBy({...})` | `findBy(uma, {...})` (helpers。`.all()`) |
  | `em.save(row)` (主キーを自分で決めるテーブル) | `save(table, row)` = `insert().values(row).onConflictDoUpdate({ target: 主キー, set: row })`。戻り値は `.returning().get()` |
  | `em.save(row)` (自動採番のテーブル) | `insert().values(row).returning().get()` |
  | `Tool.saveOrUpdate` の `createQueryBuilder().update()` | `db.update(table).set(updateSet).where(eq(table.Id, id))` |
  | `UmaDao.getKyousouba` の QueryBuilder | 条件を配列に積んで `and(...conds)` |
  | `dataSource.query(sql, params)` | `readDb.query(sql).all(...params)` (bun:sqlite をそのまま使う。BrowseService の SQL は変えない) |

  `save` は TypeORM と同じく「渡した項目だけ更新、`undefined` の項目は触らない」動きにする (`set` から `undefined` を除く)。
- マイグレーション: `drizzle-kit generate` で `drizzle/` に SQL を出し、起動時 (`main.ts` / `server.ts`) とテストで `migrate()` する。`synchronize` はやめる。
  - 既存の `db/keiba.sqlite` は TypeORM が作ったテーブルがあるので、最初のマイグレーション (0000) は適用済みとして記録する
    1 回きりのスクリプト `scripts/baseline-db.ts` を用意する (`__drizzle_migrations` に 0000 のハッシュを入れる)。
  - その前に、新規に migrate した DB と既存 DB の `sqlite_master` を比べ、テーブル・列・インデックスの名前と NULL 可否、主キーが一致することを確かめる (型名の違い `tinyint` / `integer` は SQLite では同じ扱いなので無視してよい)。

### HTTP (Elysia)

- `http/app.ts` で `new Elysia()` に閲覧と取り込みのルートを `.use()` してまとめる。`server.ts` は `app.listen({ hostname, port })` だけ。
- パラメータの検証は Elysia の `t` スキーマにする (`BrowseController` の `toInt` を置き換える)。範囲チェックが要るものは `t.Numeric({ minimum, maximum })`。
- エラー: `NotFoundException` / `BadRequestException` の代わりに、`HttpError(status, message)` を 1 つ定義して投げ、`onError` で `{ message }` と状態コードに変える。レスポンスの形は今の画面 (`web/src/api.ts`) が読める形に合わせる。
- ローカル限定: `/api/imports` のグループに `beforeHandle` を付け、`server.requestIP(request)` のアドレスと Host ヘッダを今の `LocalOnlyGuard` と同じ規則で見る。
- 静的配信: `@elysiajs/static` で `web/dist` を配信し、`/api` 以外で拡張子のない GET には `index.html` を返す (今の `serveWeb` と同じ)。
- API のパスとレスポンスは変えない。フロントエンドは触らない。
- Eden (型付きクライアント) は今回は入れない。

### テスト

- `test/container.ts` を消し、`Container.get(X)` は export したインスタンスの import に置き換える。
  `helpers.ts` の `setFileDate` は `bridge` を直接書き換える。
- DB を使うテストは `KEIBA_DB=:memory:` のまま、準備で `migrate()` する。
- HTTP のテストは `app.handle(new Request("http://localhost/api/..."))` で呼ぶ (サーバーを起動しない)。
  ローカル限定のテストは、`requestIP` を差し替えられるように判定を関数に切り出してその関数を直接テストする。

## 手順

各段階の終わりで `bun test` と `bun run typecheck` が通ること、`bun start <テスト用データ>` の取り込み件数が変わらないことを確かめてからコミットする。

### 0. 準備

1. `bun test` が全部通ることを確かめる。
2. 比較用に、今の実装でテスト用データを取り込んだ DB を作っておく (`KEIBA_DB=tmp/before.sqlite bun start <dir>`)。
3. 今の DB のスキーマを `sqlite3 db/keiba.sqlite .schema > tmp/schema-before.sql` で控える。

実施結果 (2026-10-11):

- `bun test`: 429 pass / 7 skip / 0 fail。
- テスト用データ: `docs/jrdb-spec` と `docs/kol-spec` のサンプル (`*[0-9].txt` と `*.kd3`、55 ファイル) を `tmp/baseline/data` に集めた。
  `KEIBA_DB=tmp/baseline/before.sqlite bun start tmp/baseline/data` で取り込み、約 2 分 30 秒。
  `OddsHaitou.RaceId` の NOT NULL 違反のエラーが 2 件出る (サンプルに対応するレースがないため。今の実装のままの動き)。移行後も同じ 2 件なら問題ない。
- 同じデータを 2 回取り込んだ DB は全テーブルで一致した (取り込みは決定的なので、Id まで含めて比べられる)。
- 比較は `bun scripts/compare-db.ts tmp/baseline/before.sqlite <新しい DB>` で行う。
- スキーマは `tmp/baseline/schema-before.sql` に控えた (`db/keiba.sqlite` と、新規に作った DB のスキーマは同じ)。

### 1. DI をやめ、HTTP を Elysia にする (TypeORM はまだ残す)

ORM と同時に変えると原因が追えなくなるので、先に Nest だけを外す。

1. `bridge.ts` を作り、`Bridge` の注入をすべて置き換える。
2. DAO・Tool・`ImportProgress` に `export const xxx = new Xxx()` を足し、`@Inject()` のプロパティを import に置き換える。`@Injectable()` を消す。
3. リーダーの `@Inject()` / `@Injectable()` を消す。`Importer` の対応表を `reader: new Kyi()` の形にし、`ModuleRef` と `onModuleInit` を消す。
4. `Traversal` / `ImportJobService` も同じように 1 インスタンスを export する。
5. `http/` を作り、`ImportController` / `BrowseController` / `LocalOnlyGuard` / `serveWeb` を移す。`BrowseService` から Nest の例外を外す。
6. `main.ts` / `server.ts` から Nest を外す。`AppModule` / `ImporterModule` / `ApiModule` / `BrowseModule` を消す。
7. テストの `Container` を置き換える。
8. `@nestjs/*`、`@types/express`、`rxjs` を削除し、`elysia`、`@elysiajs/static` を入れる。
9. 画面から取り込み・閲覧ができることを手で確かめる。

この時点で TypeORM のデコレーター (`@Entity` など) と `reflect-metadata` は残る。

実施結果 (2026-10-12):

- `bun test`: 430 pass / 7 skip / 0 fail (HTTP の 403 のテストを 1 件足した)。`bun run typecheck` も通る。
- 見本データの取り込み結果は段階 0 の DB と全テーブルで一致し、エラーも同じ 2 件だった。
- サーバーを起動し、閲覧 API、400 / 404、画面の配信と画面遷移用の index.html、取り込みジョブの開始から完了まで、Host ヘッダが違うときの 403、SIGINT での停止を確かめた。

計画から変えたこと:

- `bridge.ts` は作らず、`reader/Bridge.ts` に `export const bridge = new Bridge()` を足しただけにした (`JrdbBridge` / `KolBridge` へのキャストは残る)。
- シングルトンの名前はクラス名の先頭を小文字にしたもの (`UmaDao` → `umaDao`)。`@Inject()` のフィールドは消し、`this.umaDao` を import した `umaDao` に置き換えた。
  別名で注入していたもの (`oddsHaitouTool: JravanOddsHaitouTool` など) も型のシングルトン名にそろえた。
- リーダーの中で別のリーダーを使うもの (KD1 の読み取りなど) は、フィールドで `new` する (`private reader = new KolUma()`)。
- `ImportJobService` は、テストで取り込み処理と進捗を差し替えられるよう、コンストラクターの引数 (既定値はシングルトン) で受け取る。
- パラメータの検証は Elysia の `t` を使わず、今の `toInt` を残した (`t` だと検証エラーが 422 になり、レスポンスも変わるため)。
- 静的配信は `@elysiajs/static` を使わず、`http/app.ts` に 20 行ほどで書いた (画面遷移用の index.html の扱いを今と同じにするため)。
- ローカル限定は `http/localOnly.ts` の `assertLocal(接続元, Host)` にし、テストはこの関数を直接呼ぶ。
- Nest の例外の代わりに `http/errors.ts` の `HttpError` と、その派生 (`BadRequestError` / `ForbiddenError` / `NotFoundError` / `ConflictError`) を使う。
- `test/spec.test.ts` の「仕様書にないコード」のテストは、既知の値を `ファイル名:行番号` で除外しているので、`@Inject()` の行を消してずれた行番号を直した。段階 2 でも同じように直す必要がある。

### 2. TypeORM を Drizzle にする

1. `drizzle-orm`、`drizzle-kit` を入れ、`drizzle.config.ts` (dialect `sqlite`、schema `src/app/db/schema`) を書く。
2. `entities/*.ts` を `db/schema/*.ts` に書き換える (1 エンティティ 1 ファイルのまま)。
3. `drizzle-kit generate` で 0000 を作り、上の方法で既存 DB とスキーマを比べる。差があればスキーマ定義を直す。
4. `db/db.ts` と `db/helpers.ts` を作る。`OrmManager.ts` の `runInTransaction` を `db.ts` に移す。
5. DAO・Tool・リーダーの `@OrmManager()` / `@OrmRepository()` と TypeORM の呼び出しを、上の表に従って置き換える。
   ファイル数が多いので、DAO → Tool → JRDB → KOL → JRA-VAN → JV-Data の順に進め、データ源ごとにそのテストを通す。
6. `BrowseService` の `dataSource.query` を読み取り専用接続に置き換える。
7. `main.ts` / `server.ts` / テストの準備を `migrate()` に変える。
8. 段階 0 で作った DB と、新しい実装で同じデータを取り込んだ DB を、テーブルごとに件数と内容 (`EXCEPT` で差分) で比べる。
9. `scripts/baseline-db.ts` で既存の `db/keiba.sqlite` を Drizzle の管理下に置く (先にバックアップを取る)。
10. `typeorm`、`reflect-metadata`、`tslib` を削除し、`DataSource.ts` / `OrmManager.ts` / `BunSqlite.ts` / `entities/` を消す。
11. `tsconfig.json` から `experimentalDecorators` / `emitDecoratorMetadata` / `useDefineForClassFields: false` を外す。
    `useDefineForClassFields` を外すと、宣言だけで初期値のないフィールドの扱いが変わるので、テストで確かめる。

実施結果 (2026-10-12):

- `bun test`: 430 pass / 7 skip / 0 fail。`bun run typecheck` も通る。
- 新規に migrate した DB と `db/keiba.sqlite` のスキーマ (テーブル・列の名前と NOT NULL・主キー・インデックス・AUTOINCREMENT) は一致した。
- 見本データの取り込み結果は段階 0 の DB と全テーブルで一致し、エラーも同じ 2 件だった。所要時間も同じくらい (約 2 分 30 秒)。
- `db/keiba.sqlite` は `db/keiba.sqlite.bak-20261012` にバックアップしてから `scripts/baseline-db.ts` で Drizzle の管理下に置いた。
  バックアップとデータが一致すること、サーバーを起動して閲覧 API が読めることを確かめた。

計画から変えたこと:

- テーブル定義は `db/schema` に移さず、`entities/*.ts` の同じファイルに同じ名前で置いた。
  `export const Uma = sqliteTable(...)` と `export type Uma = typeof Uma.$inferSelect` を並べたので、
  `import { Uma }` で値 (テーブル) と型の両方が使え、import する側はほとんど変えずに済んだ。`new Uma()` は `{} as Uma` にした。
- 列の型は `integer` / `real` / `text` だけにした (`tinyint` などの名前は SQLite では意味がないため)。enum の列は `.$type<Baken>()` で型を付けた。
- `db/helpers.ts` の関数は `findOneBy` / `findBy` / `countBy` / `save` / `updateBy` / `query` (生の SQL) と、条件で NULL を表す `IS_NULL`。
  条件に `null` や `undefined` を渡すと、TypeORM 1.x の既定の動きと同じく例外にする。
- 名前で騎手・調教師を探す結合のクエリは、生の SQL にして、Id が重複した行を除いた (TypeORM の `getMany` と同じ結果にするため)。
- WAL は `server.ts` だけでなく、`openDb()` でファイルの DB なら常に有効にする。閲覧用の接続は `readDb()` (メモリー上の DB のときは同じ接続)。
- `useDefineForClassFields: false` は残した (外すと、親クラスのコンストラクターで設定した `logger` などが、子クラスのフィールド宣言で消えるため)。
- テストは `test/helpers.ts` に `repo(テーブル)` (TypeORM の Repository と同じ書き方で読む) と `findOneByOrFail` を置いて、書き換えを少なくした。
- `test/spec.test.ts` の行番号をまた直した (import の行が増減したため)。
- `scripts/compare-db.ts` は、WAL の DB を ATTACH できるよう読み取り専用で開くのをやめた。

### 3. 後片付け

1. `migration/README.md` の「TypeORM が作る名前」などの記述を直す。`migration/*.ts` が TypeORM を使っていれば直す。
2. `src/tslint.json` など使っていない設定を消す。
3. `README.md` に起動方法 (`bun run serve`、`bun start <dir>`、`drizzle-kit generate` の使い方) を書く。

実施結果 (2026-10-12):

- `migration/` の説明とコメントから TypeORM の記述を直した (`migration/*.ts` は TypeORM を使っていなかった)。
- `src/tslint.json` を消した。コード中の `tslint:disable` のコメントは残した (動きに関係しないため)。
- `README.md` に使い方、環境変数、マイグレーションの作り方、以前のデータベースの扱い、比べ方を書いた。
- 画面のコードは、エラーの形式についてのコメント (Nest の形式) だけ直した。

## 気をつけること

- **TypeORM の `save` の動き**: 主キーがある行は「SELECT して、あれば UPDATE、なければ INSERT」になる。
  `onConflictDoUpdate` の upsert でも結果は同じになるはずだが、UPDATE のときに TypeORM が `set` に何を含めていたか (渡していない項目を NULL にしないか) は差が出やすい。段階 2 の 8 の比較で見つける。
- **`undefined` と `null`**: TypeORM は `undefined` の項目を保存しない。Drizzle の `insert` は `undefined` を省略、`null` は NULL を書く。`saveOrUpdate` の `skipNull` の動きが変わらないことをテストで確かめる。
- **`returning()`**: 自動採番の Id を取るのに必要。bun-sqlite (SQLite 3.35 以上) なら使える。
- **フィールドの初期化順**: デコレーターをやめると、`useDefineForClassFields` を外したときに、親クラスのコンストラクターで設定した値が子クラスのフィールド宣言で `undefined` に上書きされることがある。外さずに残すのも可。
- **既存 DB**: ベースライン化の前に必ずバックアップする。スキーマが一致しないままベースライン化すると、以後のマイグレーションが壊れる。

## やらないこと

- フロントエンド (`web/`) の変更。
- API のパスやレスポンスの変更。
- リーダーや変換処理のロジック・クラス構成の見直し。
- MySQL / PostgreSQL への対応 (今も SQLite のみ)。
