# KeibaDataImporter

## テストの実行ルール

`bun test` は全体で約40秒かかる。

- 作業中は全体を実行しない。変更に関係するテストファイルだけ実行する（例: `bun test test/jrdb-records.test.ts`）。
- 全体の `bun test` は push の直前に1回だけ実行し、通ってから push する。
- コミットごと・編集ごとに全体テストを走らせない。
- 型の確認は `bun run typecheck`、整形・import 整理・lint 修正は `bun run lint`（`biome check --write .`）。
