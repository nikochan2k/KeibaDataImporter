#!/usr/bin/env bash
# KeibaDataAnalizer のデータベースを、MySQL 8.0 上の KeibaDataImporter のデータベースへ移行する。(未検証)
#
# 使い方:
#   migration/migrate-mysql.sh <移行先データベース名> [mysql のオプション...]
#   例) migration/migrate-mysql.sh keiba -h localhost -u root -p
#
# 前提:
#   * 移行先データベースに、src/app/entities と同じ定義のテーブルが作成済みで、データが空であること
#   * 同じサーバーの別データベース old に、旧 Keiba.sql と同じ構造のテーブルとデータがあること
#     (migration/old/Keiba.sql は SQLite 用の記述なので、MySQL 用に直して流し込む)
#   * 移行先は先にバックアップを取ること。MySQL は CREATE TABLE で暗黙コミットされるため、
#     途中で失敗してもロールバックされない。失敗した場合は、移行先のデータを消して作り直し、
#     mig_ で始まる作業テーブルを削除してから再実行する。
#
# 詳細は migration/README.md を参照。
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: $0 <new database> [mysql options...]" >&2
  exit 1
fi

NEW_DB="$1"
shift
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

command -v mysql >/dev/null || { echo "mysql が見つかりません" >&2; exit 1; }

# 1つのセッションで流す(dialect/mysql.sql の SET SESSION を後続の SQL で有効にするため)
mysql --default-character-set=utf8mb4 --table "$@" "$NEW_DB" <<SQL
SOURCE $DIR/dialect/mysql.sql
SOURCE $DIR/steps/10_master.sql
SOURCE $DIR/steps/20_race.sql
SOURCE $DIR/steps/30_shussouba.sql
SOURCE $DIR/steps/40_choukyou.sql
SOURCE $DIR/steps/90_verify.sql
SOURCE $DIR/steps/99_cleanup.sql
SQL
