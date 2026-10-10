#!/usr/bin/env bash
# KeibaDataAnalizer のデータベースを、PostgreSQL 上の KeibaDataImporter のデータベースへ移行する。(未検証)
#
# 使い方:
#   migration/migrate-postgresql.sh <接続文字列 または データベース名> [psql のオプション...]
#   例) migration/migrate-postgresql.sh keiba -h localhost -U postgres
#       migration/migrate-postgresql.sh "postgresql://user:pass@localhost/keiba"
#
# 前提:
#   * 移行先データベースに、src/app/entities と同じ定義のテーブルが、クォートなし(小文字)の名前で
#     作成済みで、データが空であること(詳細は dialect/postgresql.sql の冒頭)
#   * 同じデータベースのスキーマ old に、旧 Keiba.sql と同じ構造のテーブルとデータがあること
#     (migration/old/Keiba.sql は SQLite 用の記述なので、PostgreSQL 用に直して流し込む)
#   * 全体を1つのトランザクションで実行する。途中で失敗した場合は、すべて元に戻る。
#
# 詳細は migration/README.md を参照。
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: $0 <connection string or database> [psql options...]" >&2
  exit 1
fi

TARGET="$1"
shift
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

command -v psql >/dev/null || { echo "psql が見つかりません" >&2; exit 1; }

# -1: 全体を1トランザクションにする / ON_ERROR_STOP: 最初のエラーで止める
psql -X -q -1 -v ON_ERROR_STOP=1 "$@" "$TARGET" <<SQL
\i $DIR/dialect/postgresql.sql
\i $DIR/steps/10_master.sql
\i $DIR/steps/20_race.sql
\i $DIR/steps/30_shussouba.sql
\i $DIR/steps/40_choukyou.sql
\pset format aligned
\i $DIR/steps/90_verify.sql
\i $DIR/steps/99_cleanup.sql
SQL
