-- PostgreSQL 用の準備: 日付変換用カレンダー(mig_calendar)を作る。(未検証)
-- 前提:
--   * 移行元のテーブルを、スキーマ old に作成済みであること
--       CREATE SCHEMA old;  -- Keiba.sql を search_path = old で流し込み、データをインポートする
--   * 移行先のテーブル(TypeORM のエンティティ定義と同じもの)が作成済みであること
--   * 識別子は、すべて小文字に折り畳まれる前提(クォートなし)で書いてある。移行先のテーブル・列は
--     クォートせずに作成し、小文字の名前(race, kaisai, key ...)になっていること。
--     TypeORM が作る "Race" のような大文字小文字を区別する名前の場合は、小文字に直すか、
--     steps/*.sql の識別子をクォートして合わせること。

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
