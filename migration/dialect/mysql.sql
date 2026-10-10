-- MySQL 8.0 用の準備: 日付変換用カレンダー(mig_calendar)を作る。(未検証)
-- 前提:
--   * 移行元のテーブルを、移行先と同じサーバーの別データベース old に作成済みであること
--       CREATE DATABASE old;  -- Keiba.sql を old に流し込み、データをインポートする
--   * 移行先のテーブル(TypeORM のエンティティ定義と同じもの)が作成済みであること
--   * 識別子を "Key" のように二重引用符で囲み、文字列結合に || を使うため、ANSI モードにする

SET SESSION sql_mode = 'ANSI';
SET SESSION cte_max_recursion_depth = 100000;

CREATE TABLE mig_calendar (
  D DATE NOT NULL PRIMARY KEY
  ,Y INT NOT NULL
  ,M INT NOT NULL
  ,DD INT NOT NULL
  ,Ymd INT NOT NULL    -- YYYYMMDD
  ,Days INT NOT NULL   -- 1970-01-01 からの経過日数
);

INSERT INTO mig_calendar (D, Y, M, DD, Ymd, Days)
WITH RECURSIVE d(x) AS (
  SELECT DATE '1900-01-01'
  UNION ALL
  SELECT x + INTERVAL 1 DAY FROM d WHERE x < DATE '2100-12-31'
)
SELECT
  x
  ,YEAR(x)
  ,MONTH(x)
  ,DAY(x)
  ,YEAR(x) * 10000 + MONTH(x) * 100 + DAY(x)
  ,DATEDIFF(x, DATE '1970-01-01')
FROM d;
