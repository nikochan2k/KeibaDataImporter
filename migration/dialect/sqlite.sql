-- SQLite 用の準備: 日付変換用カレンダー(mig_calendar)を作る。
-- 前提: 移行先DBに接続し、移行元を ATTACH 済みであること。
--   ATTACH DATABASE 'path/to/old/Keiba.sqlite' AS old;
-- SQLite は DATE 型を文字列で持つため、'YYYY-MM-DD' と 'YYYY-MM-DD 00:00:00' の両方の
-- 表記を D 列に登録して、どちらで保存されていても一致するようにしている。

CREATE TABLE mig_calendar (
  D VARCHAR(30) NOT NULL PRIMARY KEY
  ,Y INT NOT NULL
  ,M INT NOT NULL
  ,DD INT NOT NULL
  ,Ymd INT NOT NULL    -- YYYYMMDD
  ,Days INT NOT NULL   -- 1970-01-01 からの経過日数(UTC)
);

INSERT INTO mig_calendar (D, Y, M, DD, Ymd, Days)
WITH RECURSIVE d(x) AS (
  SELECT DATE('1900-01-01')
  UNION ALL
  SELECT DATE(x, '+1 day') FROM d WHERE x < '2100-12-31'
)
SELECT
  x
  ,CAST(STRFTIME('%Y', x) AS INTEGER)
  ,CAST(STRFTIME('%m', x) AS INTEGER)
  ,CAST(STRFTIME('%d', x) AS INTEGER)
  ,CAST(STRFTIME('%Y%m%d', x) AS INTEGER)
  ,CAST(ROUND(JULIANDAY(x) - 2440587.5) AS INTEGER)
FROM d;

INSERT INTO mig_calendar (D, Y, M, DD, Ymd, Days)
SELECT D || ' 00:00:00', Y, M, DD, Ymd, Days FROM mig_calendar;
