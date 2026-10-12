# KeibaDataImporter

## テストの実行ルール

`bun test` は全体で約40秒かかる。

- 作業中は全体を実行しない。変更に関係するテストファイルだけ実行する（例: `bun test test/jrdb-records.test.ts`）。
- 全体の `bun test` は push の直前に1回だけ実行し、通ってから push する。
- コミットごと・編集ごとに全体テストを走らせない。

## 型チェックと lint

テストとは別。コード修正のひとまとまり（機能・修正の区切り）が終わるたびに、両方を実行する。

- 型の確認: `bun run typecheck`
- 整形・import 整理・lint 修正: `bun run lint`（`biome check --write .`）
