-- 40_choukyou.sql: 調教を移行する。
--
-- 旧テーブル                    -> 新テーブル
--   Choukyou + ChoukyouRireki     -> Choukyou  (1件 = 馬 x 調教1回)
--   ChoukyouTime                  -> ChoukyouTime
--
-- 旧 Choukyou は出走馬ごとに調教履歴を持つため、同じ調教が複数のレースに重複して入っている。
-- (馬, 調教日, 騎乗者, 場所, コース, 位置取り, 追い切り, 脚色, 矢印) が同じものを1件にまとめる。
--
-- 新 Choukyou は、場所・コース・馬場・追い切りなどをコード化して持つが、旧テーブルは
-- 文字列で持っているため、コード化せず原文を残す。
--   場所 + コース -> BashoCourse (原文)
--   脚色          -> OikiriSonota (原文)
--   併せ馬        -> AwaseReigai (原文)
--   馬場          -> 移行しない
--   旧 Choukyou.Tanpyou / HonsuuCourse / HonsuuHanro / HonsuuPool / Rating / KyuuyouRiyuu -> 移行しない
-- 乗り役(Noriyaku)は判定できないため NULL。騎乗者の短縮名は TanshukuKishuMeiId に入れる。
--
-- Id = 馬Id * 2^31 + 1970-01-01からの経過日数 * 2^16 + 同じ馬・同じ日の連番
-- (Importer は連番の代わりに CRC16 を使うので、Id は一致しない)

CREATE TABLE mig_choukyou (
  RepId BIGINT NOT NULL PRIMARY KEY
  ,UmaId BIGINT NOT NULL
  ,Ymd INT NOT NULL
  ,Days INT NOT NULL
  ,NewId BIGINT NOT NULL
);

-- 同じ調教の代表(旧 ChoukyouRireki.Id の最小)を選び、同じ馬・同じ日の中で連番を振る
INSERT INTO mig_choukyou (RepId, UmaId, Ymd, Days, NewId)
SELECT
  g.RepId
  ,g.UmaId
  ,g.Ymd
  ,g.Days
  ,g.UmaId * 2147483648 + g.Days * 65536 + ROW_NUMBER() OVER (PARTITION BY g.UmaId, g.Ymd ORDER BY g.RepId)
FROM (
  SELECT
    MIN(r.Id) AS RepId
    ,CAST(c.KyousoubaId AS DECIMAL(18, 0)) AS UmaId
    ,cal.Ymd AS Ymd
    ,cal.Days AS Days
  FROM old.ChoukyouRireki r
  INNER JOIN old.Choukyou c ON c.Id = r.ChoukyouId
  INNER JOIN mig_calendar cal ON cal.D = r.Nengappi
  GROUP BY
    c.KyousoubaId, cal.Ymd, cal.Days, r.Kijousha, r.Basho, r.ChoukyouCourse, r.IchiDori, r.Oikiri, r.Ashiiro, r.Yajirushi
) g;

INSERT INTO Choukyou (
  Id, UmaId, TanshukuKishuMeiId, Nengappi, BashoCourse, Kaisuu, IchiDori, OikiriSonota, Yajirushi, Reigai, AwaseReigai
)
SELECT
  mc.NewId
  ,mc.UmaId
  ,j.Id
  ,mc.Ymd
  ,COALESCE(r.Basho, '') || COALESCE(r.ChoukyouCourse, '')
  ,r.Kaisuu
  ,r.IchiDori
  ,r.Ashiiro
  ,r.Yajirushi
  ,r.Reigai
  ,r.Awase
FROM mig_choukyou mc
INNER JOIN old.ChoukyouRireki r ON r.Id = mc.RepId
LEFT JOIN Jinmei j ON j.Meishou = r.Kijousha;

INSERT INTO ChoukyouTime (Id, ChoukyouId, F, Time, Comment)
SELECT mc.NewId * 32 + t.F, mc.NewId, t.F, t.Time, t.Comment
FROM old.ChoukyouTime t
INNER JOIN mig_choukyou mc ON mc.RepId = t.ChoukyouRirekiId;
