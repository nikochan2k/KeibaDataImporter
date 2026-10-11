# KeibaDataImporter

JRDB・KOL・JRA-VAN・JV-Data の競馬データを SQLite に取り込み、ブラウザで閲覧する。
Bun + ElysiaJS + Drizzle ORM。

## 使い方

```sh
bun install

# ディレクトリ (zip / lzh も可) のデータを取り込む
bun start <ディレクトリ>

# 画面をビルドして、閲覧・取り込み用のサーバーを起動する (http://127.0.0.1:3000)
bun run web:build
bun run serve
```

## 環境変数

- `KEIBA_DB`: データベースのファイル (既定は `db/keiba.sqlite`)
- `PORT` / `HOST`: サーバーの待ち受け (既定は `3000` / `127.0.0.1`)
- `WEB_DIR`: 配信する画面のディレクトリ (既定は `web/dist`)
- `IMPORT_ROOT`: 画面から取り込めるディレクトリの上限。未設定なら制限しない
- `IMPORT_MAX_ERRORS`: 取り込みを止めるエラーの件数 (既定は 20)

## 開発

```sh
bun test
bun run typecheck
bun run check   # Biome
```

### テーブルを変えるとき

テーブルの定義は `src/app/entities/*.ts` (Drizzle の `sqliteTable`)。変えたら、マイグレーションを作る。

```sh
bunx drizzle-kit generate --name <変更の名前>
```

`drizzle/` に SQL ができる。起動時 (`bun start` / `bun run serve`) に、まだ当たっていないマイグレーションが当たる。

### 以前の実装で作ったデータベース

TypeORM の頃に作ったデータベースは、そのままでは起動時のマイグレーションでエラーになる。
バックアップを取ってから、1 回だけ次を実行して Drizzle の管理下に置く。

```sh
bun scripts/baseline-db.ts [データベース]
```

### 実装を変えたときの確かめ方

同じデータを取り込んだ 2 つのデータベースを、テーブルごとに内容で比べる。

```sh
KEIBA_DB=tmp/before.sqlite bun start <ディレクトリ>   # 変える前
KEIBA_DB=tmp/after.sqlite bun start <ディレクトリ>    # 変えた後
bun scripts/compare-db.ts tmp/before.sqlite tmp/after.sqlite
```
