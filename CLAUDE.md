# KeibaDataImporter

## 開発途中のルール

- テーブルの構成は気兼ねなく変える。
- マイグレーションは作らない。
  - テーブルは `src/app/entities/*.ts` の定義から、空のデータベースを開いたときに作る（`src/app/db/schema.ts`）。
  - `drizzle-kit generate` は使わない（drizzle-kit も入れていない）。
  - 既存のデータベースとの互換は考えない。定義を変えたら、データベースを作り直して取り込み直す。
- 修正量が多いからといって躊躇する必要はない。美しく洗練されたアーキテクチャを目指す。

## テストの実行ルール

`bun test` は全体で約40秒かかる。

- 作業中は全体を実行しない。変更に関係するテストファイルだけ実行する（例: `bun test test/jrdb-records.test.ts`）。
- 全体の `bun test` は push の直前に1回だけ実行し、通ってから push する。
- コミットごと・編集ごとに全体テストを走らせない。

## 型チェックと lint

テストとは別。コード修正のひとまとまり（機能・修正の区切り）が終わるたびに、両方を実行する。

- 型の確認: `bun run typecheck`
- 整形・import 整理・lint 修正: `bun run lint`（`biome check --write .`）
