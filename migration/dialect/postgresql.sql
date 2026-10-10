-- PostgreSQL 用の準備: 日付変換用カレンダー(mig_calendar)を作る。(未検証)
-- 前提:
--   * 移行元のテーブルを、スキーマ old に作成済みであること
--       CREATE SCHEMA old;  -- Keiba.sql を search_path = old で流し込み、データをインポートする
--   * 移行先のテーブル(TypeORM のエンティティ定義と同じもの)が作成済みであること
--   * 本スクリプトは識別子をクォートしない(小文字に折り畳まれる)箇所と、"Key" のように
--     クォートする箇所が混在する。移行先のテーブル名・列名の大文字小文字は、
--     作成方法に合わせて調整すること。

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
  SELECT x + 1 FROM d WHERE x < DATE '2100-12-31'
)
SELECT
  x
  ,CAST(EXTRACT(YEAR FROM x) AS INT)
  ,CAST(EXTRACT(MONTH FROM x) AS INT)
  ,CAST(EXTRACT(DAY FROM x) AS INT)
  ,CAST(EXTRACT(YEAR FROM x) AS INT) * 10000 + CAST(EXTRACT(MONTH FROM x) AS INT) * 100 + CAST(EXTRACT(DAY FROM x) AS INT)
  ,x - DATE '1970-01-01'
FROM d;
