#!/usr/bin/env bash
# KeibaDataAnalizer の SQLite データベースを、KeibaDataImporter のデータベースへ移行する。
#
# 使い方:
#   migration/migrate-sqlite.sh <移行元 Keiba.sqlite> <移行先 keiba.sqlite>
#
# 前提:
#   * 移行先は、Importer を一度起動してテーブルを作成済み(bun start で
#     drizzle/ のマイグレーションが当たる)で、データが空であること
#   * 移行先は、先にバックアップを取ること。途中で失敗した場合は、トランザクションで
#     元に戻る。移行元は読み取りのみ。
#
# 詳細(対応表・移行しないデータ・前提)は migration/README.md を参照。
#
# MySQL / PostgreSQL へ移行する場合は dialect/*.sql の冒頭を読み、dialect/<DB>.sql と
# steps/*.sql を順に実行する。(SQLite 以外は未検証)
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "usage: $0 <old Keiba.sqlite> <new keiba.sqlite>" >&2
  exit 1
fi

OLD_DB="$1"
NEW_DB="$2"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[ -f "$OLD_DB" ] || { echo "移行元が見つかりません: $OLD_DB" >&2; exit 1; }
[ -f "$NEW_DB" ] || { echo "移行先が見つかりません: $NEW_DB (先に Importer を起動してテーブルを作成してください)" >&2; exit 1; }
command -v bun >/dev/null || { echo "bun が見つかりません" >&2; exit 1; }
command -v sqlite3 >/dev/null || { echo "sqlite3 が見つかりません" >&2; exit 1; }

# SQLite の ATTACH はトランザクションの外で行う
sqlite3 -bail "$NEW_DB" <<SQL
ATTACH DATABASE '$OLD_DB' AS old;
BEGIN;
.read $DIR/dialect/sqlite.sql
.read $DIR/steps/10_master.sql
.read $DIR/steps/20_race.sql
.read $DIR/steps/30_shussouba.sql
.read $DIR/steps/40_choukyou.sql
.headers on
.mode column
.read $DIR/steps/90_verify.sql
.read $DIR/steps/99_cleanup.sql
COMMIT;
SQL

# MatchingKey は SQL では計算できないので、Importer と同じ計算で埋める
bun "$DIR/fill-matching-key.ts" "$NEW_DB"
# 調教の場所・種別のコード化と Id の振り直し(SQL では Importer と同じ変換を書けない)
bun "$DIR/fill-choukyou-id.ts" "$NEW_DB"
