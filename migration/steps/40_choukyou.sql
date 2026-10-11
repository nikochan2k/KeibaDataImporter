-- 40_choukyou.sql: 調教を移行する。
--
-- 旧テーブル                    -> 新テーブル
--   ChoukyouRireki                -> Choukyou  (1件 = 馬 x 調教1回)
--                                 -> ShussoubaChoukyou (出走馬と調教の連関。1件 = 旧 ChoukyouRireki 1件)
--   ChoukyouTime                  -> ChoukyouTime
--   Choukyou(出走馬ごとの集計)    -> ShussoubaHyouka (調教短評・調教本数)
--
-- 旧 ChoukyouRireki は出走馬ごとに調教履歴を持つため、同じ調教が複数のレースに重複して入っている。
-- (馬, 調教日, 騎乗者, 場所, コース, 位置取り, 追い切り, 脚色) が同じものを1件の Choukyou にまとめ、
-- どの出走馬に出てきたかは ShussoubaChoukyou に残す。
-- 矢印・例外はレース(出走馬)ごとに付くので、ShussoubaChoukyou に入れる(Importer と同じ)。
--
-- 新 Choukyou は、場所・コース・馬場・追い切りなどをコード化して持つが、旧テーブルは
-- 文字列で持っているため、コード化せず原文を残す。
--   場所 + コース -> BashoCourse (原文)
--   脚色          -> OikiriSonota (原文)
--   併せ馬        -> AwaseReigai (原文)
--   馬場          -> 移行しない
--   旧 Choukyou.Rating / KyuuyouRiyuu -> 移行しない
-- 乗り役(Noriyaku)は判定できないため NULL。騎乗者の短縮名は TanshukuKishuMeiId に入れる。
-- 調教フラグ(前回 / 追切り)は旧テーブルにないため NULL。
--
-- ここで振る Choukyou の Id は仮の値(馬Id * 2^31 + 経過日数 * 2^16 + 同じ馬・同じ日の連番)で、Renban も仮に 1 とする。
-- Importer と同じ Id(馬・日付・場所・種別・連番)にするには、場所・種別を Importer の変換表で
-- コード化する必要があり SQL では書けないため、この後 fill-choukyou-id.ts で Basho / Type / Course /
-- Renban を埋めて Id を振り直す(ChoukyouTime と ShussoubaChoukyou の ChoukyouId も合わせて直す)。

-- 旧 ChoukyouRireki ごとに、同じ調教の代表(旧 ChoukyouRireki.Id の最小)と、新しい出走馬 Id を求める
CREATE TABLE mig_choukyou_rireki (
  RirekiId BIGINT NOT NULL PRIMARY KEY
  ,RepId BIGINT NOT NULL
  ,ShussoubaId BIGINT
);

INSERT INTO mig_choukyou_rireki (RirekiId, RepId, ShussoubaId)
SELECT
  r.Id
  ,MIN(r.Id) OVER (
    PARTITION BY c.KyousoubaId, cal.Ymd, r.Kijousha, r.Basho, r.ChoukyouCourse, r.IchiDori, r.Oikiri, r.Ashiiro
  )
  ,ms.NewId
FROM old.ChoukyouRireki r
INNER JOIN old.Choukyou c ON c.Id = r.ChoukyouId
INNER JOIN mig_calendar cal ON cal.D = r.Nengappi
LEFT JOIN mig_shussouba ms ON ms.OldId = c.Id;

CREATE TABLE mig_choukyou (
  RepId BIGINT NOT NULL PRIMARY KEY
  ,UmaId BIGINT NOT NULL
  ,Ymd INT NOT NULL
  ,Days INT NOT NULL
  ,NewId BIGINT NOT NULL
);

-- 同じ馬・同じ日の中で連番を振って仮の Id にする
INSERT INTO mig_choukyou (RepId, UmaId, Ymd, Days, NewId)
SELECT
  g.RepId
  ,g.UmaId
  ,g.Ymd
  ,g.Days
  ,g.UmaId * 2147483648 + g.Days * 65536 + ROW_NUMBER() OVER (PARTITION BY g.UmaId, g.Ymd ORDER BY g.RepId)
FROM (
  SELECT
    r.Id AS RepId
    ,CAST(c.KyousoubaId AS DECIMAL(18, 0)) AS UmaId
    ,cal.Ymd AS Ymd
    ,cal.Days AS Days
  FROM mig_choukyou_rireki mr
  INNER JOIN old.ChoukyouRireki r ON r.Id = mr.RirekiId
  INNER JOIN old.Choukyou c ON c.Id = r.ChoukyouId
  INNER JOIN mig_calendar cal ON cal.D = r.Nengappi
  WHERE mr.RirekiId = mr.RepId
) g;

INSERT INTO Choukyou (
  Id, UmaId, TanshukuKishuMeiId, Nengappi, Renban, BashoCourse, Kaisuu, IchiDori, OikiriSonota, AwaseReigai
)
SELECT
  mc.NewId
  ,mc.UmaId
  ,j.Id
  ,mc.Ymd
  ,1
  ,COALESCE(r.Basho, '') || COALESCE(r.ChoukyouCourse, '')
  ,r.Kaisuu
  ,r.IchiDori
  ,r.Ashiiro
  ,r.Awase
FROM mig_choukyou mc
INNER JOIN old.ChoukyouRireki r ON r.Id = mc.RepId
LEFT JOIN Jinmei j ON j.Meishou = r.Kijousha;

INSERT INTO ChoukyouTime (ChoukyouId, F, Time, Comment)
SELECT mc.NewId, t.F, t.Time, t.Comment
FROM old.ChoukyouTime t
INNER JOIN mig_choukyou mc ON mc.RepId = t.ChoukyouRirekiId;

-- 出走馬と調教の連関。同じ出走馬に同じ調教が2回出てくる場合は1件にする(旧 ChoukyouRireki.Id の最小を使う)。
-- Id = 出走馬Id * 2^3 + 出走馬ごとの連番(0 始まり)
INSERT INTO ShussoubaChoukyou (Id, ShussoubaId, ChoukyouId, Yajirushi, Reigai)
SELECT
  l.ShussoubaId * 8 + ROW_NUMBER() OVER (PARTITION BY l.ShussoubaId ORDER BY l.RirekiId) - 1
  ,l.ShussoubaId
  ,mc.NewId
  ,r.Yajirushi
  ,r.Reigai
FROM (
  SELECT ShussoubaId, RepId, MIN(RirekiId) AS RirekiId
  FROM mig_choukyou_rireki
  WHERE ShussoubaId IS NOT NULL
  GROUP BY ShussoubaId, RepId
) l
INNER JOIN mig_choukyou mc ON mc.RepId = l.RepId
INNER JOIN old.ChoukyouRireki r ON r.Id = l.RirekiId;

-- 出走馬ごとの調教短評・調教本数
INSERT INTO ShussoubaHyouka (Id, ChoukyouTanpyou, ChoukyouHonsuuCourse, ChoukyouHonsuuHanro, ChoukyouHonsuuPool)
SELECT ms.NewId, c.Tanpyou, c.HonsuuCourse, c.HonsuuHanro, c.HonsuuPool
FROM old.Choukyou c
INNER JOIN mig_shussouba ms ON ms.OldId = c.Id
WHERE c.Tanpyou IS NOT NULL
  OR c.HonsuuCourse IS NOT NULL
  OR c.HonsuuHanro IS NOT NULL
  OR c.HonsuuPool IS NOT NULL;
