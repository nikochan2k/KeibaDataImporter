-- 10_master.sql: 人名・騎手・調教師・馬のマスタを移行する。
--
-- 旧テーブル               -> 新テーブル
--   Kishu / Shussouba         -> Jinmei, Kishu, KishuMei
--   Kyuusha / Shussouba ほか  -> Jinmei, Choukyoushi, ChoukyoushiMei
--   Kyousouba / Shussouba ほか-> Uma
--
-- 新テーブルの Id は、KOL のコードがある場合はそのコードをそのまま Id にする
-- (Uma.Id = KolUmaCode, Kishu.Id = KolKishuCode, Choukyoushi.Id = KolKyuushaCode)。
-- 移行先は空のデータベースであることを前提とする。

-- ---------------------------------------------------------------
-- 名前の一覧(Owner: K=騎手, C=調教師, X=持ち主なし / Kubun: 0=正式, 1=短縮, 2=フリガナ)
-- ---------------------------------------------------------------
CREATE TABLE mig_name (
  Owner VARCHAR(1) NOT NULL
  ,OwnerCode BIGINT
  ,Kubun INT NOT NULL
  ,Meishou VARCHAR(255) NOT NULL
);

INSERT INTO mig_name (Owner, OwnerCode, Kubun, Meishou)
SELECT 'K', Id, 0, KishuMei FROM old.Kishu WHERE KishuMei <> ''
UNION ALL SELECT 'K', Id, 1, TanshukuKishuMei FROM old.Kishu WHERE TanshukuKishuMei <> ''
UNION ALL SELECT 'K', Id, 2, Furigana FROM old.Kishu WHERE Furigana <> ''
UNION ALL SELECT 'K', KishuId, 0, KishuMei FROM old.Shussouba WHERE KishuMei <> ''
UNION ALL SELECT 'K', KishuId, 1, TanshukuKishuMei FROM old.Shussouba WHERE TanshukuKishuMei <> ''
UNION ALL SELECT 'C', Id, 0, KyuushaMei FROM old.Kyuusha WHERE KyuushaMei <> ''
UNION ALL SELECT 'C', Id, 1, TanshukuKyuushaMei FROM old.Kyuusha WHERE TanshukuKyuushaMei <> ''
UNION ALL SELECT 'C', Id, 2, Furigana FROM old.Kyuusha WHERE Furigana <> ''
UNION ALL SELECT 'C', KyuushaId, 0, KyuushaMei FROM old.Shussouba WHERE KyuushaId IS NOT NULL AND KyuushaMei <> ''
UNION ALL SELECT 'C', KyuushaId, 1, TanshukuKyuushaMei FROM old.Shussouba WHERE KyuushaId IS NOT NULL AND TanshukuKyuushaMei <> ''
UNION ALL SELECT 'C', KyuushaId, 0, KyuushaMei FROM old.Kyousouba WHERE KyuushaId IS NOT NULL AND KyuushaMei <> ''
UNION ALL SELECT 'C', KyuushaId, 1, TanshukuKyuushaMei FROM old.Kyousouba WHERE KyuushaId IS NOT NULL AND TanshukuKyuushaMei <> ''
UNION ALL SELECT 'C', KishuShozokuKyuushaId, 0, KishuShozokuKyuushaMei FROM old.Kishu WHERE KishuShozokuKyuushaId IS NOT NULL AND KishuShozokuKyuushaMei <> ''
UNION ALL SELECT 'C', KishuShozokuKyuushaId, 1, TanshukuKyuushaMei FROM old.Kishu WHERE KishuShozokuKyuushaId IS NOT NULL AND TanshukuKyuushaMei <> ''
UNION ALL SELECT 'X', NULL, 1, Kijousha FROM old.ChoukyouRireki WHERE Kijousha <> ''
UNION ALL SELECT 'X', NULL, 1, CourseRecordTanshukuKishuMei FROM old.Race WHERE CourseRecordTanshukuKishuMei <> ''
UNION ALL SELECT 'X', NULL, 1, KyoriRecordTanshukuKishuMei FROM old.Race WHERE KyoriRecordTanshukuKishuMei <> ''
UNION ALL SELECT 'X', NULL, 1, RaceRecordTanshukuKishuMei FROM old.Race WHERE RaceRecordTanshukuKishuMei <> '';

-- 短縮名が4文字以上なら、先頭3文字の名前も追加する(Importer の KishuDao と同じ)
INSERT INTO mig_name (Owner, OwnerCode, Kubun, Meishou)
SELECT Owner, OwnerCode, 1, SUBSTR(Meishou, 1, 3)
FROM mig_name
WHERE Owner IN ('K', 'C') AND Kubun = 1 AND SUBSTR(Meishou, 4, 1) <> '';

-- ---------------------------------------------------------------
-- Jinmei (Meishou は一意。同じ名前が複数の区分にある場合は小さい区分を採用)
-- ---------------------------------------------------------------
INSERT INTO Jinmei (Kubun, Meishou)
SELECT MIN(n.Kubun), n.Meishou
FROM mig_name n
WHERE NOT EXISTS (SELECT 1 FROM Jinmei j WHERE j.Meishou = n.Meishou)
GROUP BY n.Meishou;

-- ---------------------------------------------------------------
-- Kishu / KishuMei
-- ---------------------------------------------------------------
-- Shozoku は 1:関東 2:関西 3:他。旧 KishuTouzaiBetsu は 1:西 2:東 3:招待 なので入れ替える。
INSERT INTO Kishu (Id, KolKishuCode, Seinengappi, MenkyoKoufuNengappi, Shozoku, ShozokuChoukyoushiId, MinaraiKubun)
SELECT k.Id, k.Id, c.Ymd, k.HatsuMenkyoNen
  ,CASE k.KishuTouzaiBetsu WHEN 1 THEN 2 WHEN 2 THEN 1 WHEN 3 THEN 3 END
  ,k.KishuShozokuKyuushaId
  ,k.MinaraiKubun
FROM old.Kishu k
LEFT JOIN mig_calendar c ON c.D = k.Seinengappi;

-- 旧 Kishu に無いが、出走馬に出てくる騎手
INSERT INTO Kishu (Id, KolKishuCode)
SELECT s.KishuId, s.KishuId
FROM (SELECT DISTINCT KishuId FROM old.Shussouba) s
WHERE NOT EXISTS (SELECT 1 FROM Kishu n WHERE n.KolKishuCode = s.KishuId);

INSERT INTO KishuMei (KishuId, JinmeiId)
SELECT DISTINCT n.Id, j.Id
FROM mig_name m
INNER JOIN Kishu n ON n.KolKishuCode = m.OwnerCode
INNER JOIN Jinmei j ON j.Meishou = m.Meishou
WHERE m.Owner = 'K';

-- ---------------------------------------------------------------
-- Choukyoushi / ChoukyoushiMei
-- ---------------------------------------------------------------
INSERT INTO Choukyoushi (Id, KolKyuushaCode, Seinengappi, HatsuMenkyoNen, TouzaiBetsu, ShozokuBasho, RitsuHokuNanBetsu)
SELECT k.Id, k.Id, c.Ymd, k.HatsuMenkyoNen, k.KyuushaTouzaiBetsu, k.KyuushaShozokuBasho, k.KyuushaRitsuHokuNanBetsu
FROM old.Kyuusha k
LEFT JOIN mig_calendar c ON c.D = k.Seinengappi;

-- 旧 Kyuusha に無いが、他のテーブルに出てくる調教師
INSERT INTO Choukyoushi (Id, KolKyuushaCode, ShozokuBasho, RitsuHokuNanBetsu)
SELECT u.Id, u.Id, MAX(u.Basho), MAX(u.Ritsu)
FROM (
  SELECT KyuushaId AS Id, KyuushaShozokuBasho AS Basho, KyuushaRitsuHokuNanBetsu AS Ritsu FROM old.Shussouba WHERE KyuushaId IS NOT NULL
  UNION ALL SELECT KyuushaId, KyuushaShozokuBasho, KyuushaRitsuHokuNanBetsu FROM old.Kyousouba WHERE KyuushaId IS NOT NULL
  UNION ALL SELECT KishuShozokuKyuushaId, KyuushaShozokuBasho, KyuushaRitsuHokuNanBetsu FROM old.Kishu WHERE KishuShozokuKyuushaId IS NOT NULL
  UNION ALL SELECT KishuShozokuKyuushaId, NULL, NULL FROM old.Shussouba WHERE KishuShozokuKyuushaId IS NOT NULL
) u
WHERE NOT EXISTS (SELECT 1 FROM Choukyoushi n WHERE n.KolKyuushaCode = u.Id)
GROUP BY u.Id;

INSERT INTO ChoukyoushiMei (ChoukyoushiId, JinmeiId)
SELECT DISTINCT n.Id, j.Id
FROM mig_name m
INNER JOIN Choukyoushi n ON n.KolKyuushaCode = m.OwnerCode
INNER JOIN Jinmei j ON j.Meishou = m.Meishou
WHERE m.Owner = 'C';

-- ---------------------------------------------------------------
-- Uma (KolUmaCode = 旧 KyousoubaId)
-- ---------------------------------------------------------------
-- 旧 Kyousouba。Seibetsu は Importer の UmaDao と同じく、セン(2)を牡(0)にする。
INSERT INTO Uma (Id, KolUmaCode, KanaBamei, KyuuBamei, Seinen, Seinengappi, Keiro, Kesshu, Sanchi, Seibetsu,
  ChichiUmaId, HahaUmaId, MasshouFlag, MasshouNengappi, Jiyuu, Ikisaki)
SELECT
  CAST(k.Id AS DECIMAL(18, 0))
  ,CAST(k.Id AS DECIMAL(18, 0))
  ,k.KanaBamei
  ,k.KyuuBamei
  ,cs.Y
  ,cs.Ymd
  ,k.Keiro
  ,k.Kesshu
  ,k.Sanchi
  ,CASE WHEN k.Seibetsu = 2 THEN 0 ELSE k.Seibetsu END
  ,NULLIF(CAST(NULLIF(k.ChichiUmaId, '') AS DECIMAL(18, 0)), 0)
  ,NULLIF(CAST(NULLIF(k.HahaUmaId, '') AS DECIMAL(18, 0)), 0)
  ,k.MasshouFlag
  ,cm.Ymd
  ,k.Jiyuu
  ,k.Ikisaki
FROM old.Kyousouba k
LEFT JOIN mig_calendar cs ON cs.D = k.Seinengappi
LEFT JOIN mig_calendar cm ON cm.D = k.MasshouNengappi;

-- 祖先馬(父・母・母父・母母)。Seibetsu は 父=牡(0), 母=牝(1) とする。
INSERT INTO Uma (Id, KolUmaCode, KanaBamei, Seibetsu)
SELECT a.Code, a.Code, MAX(a.Mei), MAX(a.Seibetsu)
FROM (
  SELECT NULLIF(CAST(NULLIF(ChichiUmaId, '') AS DECIMAL(18, 0)), 0) AS Code, ChichiUmaMei AS Mei, 0 AS Seibetsu FROM old.Kyousouba
  UNION ALL SELECT NULLIF(CAST(NULLIF(HahaUmaId, '') AS DECIMAL(18, 0)), 0), HahaUmaMei, 1 FROM old.Kyousouba
  UNION ALL SELECT NULLIF(CAST(NULLIF(HahaChichiUmaId, '') AS DECIMAL(18, 0)), 0), HahaChichiUmaMei, 0 FROM old.Kyousouba
  UNION ALL SELECT NULLIF(CAST(NULLIF(HahaHahaUmaId, '') AS DECIMAL(18, 0)), 0), HahaHahaUmaMei, 1 FROM old.Kyousouba
) a
WHERE a.Code IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM Uma u WHERE u.Id = a.Code)
GROUP BY a.Code;

-- 母の父・母の母
UPDATE Uma SET ChichiUmaId = (
  SELECT MAX(NULLIF(CAST(NULLIF(k.HahaChichiUmaId, '') AS DECIMAL(18, 0)), 0))
  FROM old.Kyousouba k
  WHERE NULLIF(CAST(NULLIF(k.HahaUmaId, '') AS DECIMAL(18, 0)), 0) = Uma.Id
)
WHERE ChichiUmaId IS NULL
  AND Id IN (SELECT NULLIF(CAST(NULLIF(HahaUmaId, '') AS DECIMAL(18, 0)), 0) FROM old.Kyousouba);

UPDATE Uma SET HahaUmaId = (
  SELECT MAX(NULLIF(CAST(NULLIF(k.HahaHahaUmaId, '') AS DECIMAL(18, 0)), 0))
  FROM old.Kyousouba k
  WHERE NULLIF(CAST(NULLIF(k.HahaUmaId, '') AS DECIMAL(18, 0)), 0) = Uma.Id
)
WHERE HahaUmaId IS NULL
  AND Id IN (SELECT NULLIF(CAST(NULLIF(HahaUmaId, '') AS DECIMAL(18, 0)), 0) FROM old.Kyousouba);

-- 父の距離適性(旧 Kyousouba.ChichiKyoriTekisei)は、父馬の Uma.KyoriTekisei に入れる
UPDATE Uma SET KyoriTekisei = (
  SELECT MAX(k.ChichiKyoriTekisei)
  FROM old.Kyousouba k
  WHERE NULLIF(CAST(NULLIF(k.ChichiUmaId, '') AS DECIMAL(18, 0)), 0) = Uma.Id
)
WHERE KyoriTekisei IS NULL
  AND Id IN (SELECT NULLIF(CAST(NULLIF(ChichiUmaId, '') AS DECIMAL(18, 0)), 0) FROM old.Kyousouba WHERE ChichiKyoriTekisei IS NOT NULL);

-- 旧 Kyousouba に無いが、出走馬に出てくる馬
INSERT INTO Uma (Id, KolUmaCode, KanaBamei, Seinen, Seibetsu)
SELECT
  CAST(s.KyousoubaId AS DECIMAL(18, 0))
  ,CAST(s.KyousoubaId AS DECIMAL(18, 0))
  ,MAX(s.KanaBamei)
  ,MAX(s.Seinen)
  ,MAX(CASE WHEN s.Seibetsu = 2 THEN 0 ELSE s.Seibetsu END)
FROM old.Shussouba s
WHERE s.KyousoubaId IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM Uma u WHERE u.Id = CAST(s.KyousoubaId AS DECIMAL(18, 0)))
GROUP BY s.KyousoubaId;

-- 旧 Kyousouba・出走馬に無いが、調教に出てくる馬
INSERT INTO Uma (Id, KolUmaCode)
SELECT DISTINCT CAST(c.KyousoubaId AS DECIMAL(18, 0)), CAST(c.KyousoubaId AS DECIMAL(18, 0))
FROM old.Choukyou c
WHERE NOT EXISTS (SELECT 1 FROM Uma u WHERE u.Id = CAST(c.KyousoubaId AS DECIMAL(18, 0)));
