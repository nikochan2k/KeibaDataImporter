-- 30_shussouba.sql: 競走馬・出走馬と、その子テーブルを移行する。
--
-- 旧テーブル                  -> 新テーブル
--   Shussouba                   -> Kyousouba, Shussouba, ShussoubaSeiseki, Shoyuu, Banushi
--   Kyousouba(馬主・生産者)     -> Shoyuu, Seisansha
--   ShussoubaTsuukaJuni         -> ShussoubaTsuukaJuni
--   ShussoubaHassouJoukyou      -> ShussoubaHassouJoukyou
--   ShussoubaKeika              -> (移行しない。新 ShussoubaKeika は RaceKeika.Keika を
--                                   Importer が解析して作る値(縦・横の件数)で、旧テーブルの
--                                   文字列(Tate/Yoko)とは形式が異なる)
--
-- 出走馬ID = 新レースID * 64 + 馬番 (Importer と同じ)

CREATE TABLE mig_shussouba (
  OldId BIGINT NOT NULL PRIMARY KEY
  ,NewId BIGINT NOT NULL
  ,RaceId BIGINT NOT NULL
  ,UmaId BIGINT
  ,Seibetsu INT
  ,UmaKigou INT
  ,ChoukyoushiId INT
  ,KyousoubaId BIGINT
);

INSERT INTO mig_shussouba (OldId, NewId, RaceId, UmaId, Seibetsu, UmaKigou, ChoukyoushiId, KyousoubaId)
SELECT
  s.Id
  ,m.NewId * 64 + s.Umaban
  ,m.NewId
  ,CAST(s.KyousoubaId AS DECIMAL(18, 0))
  ,s.Seibetsu
  ,s.UmaKigou
  ,s.KyuushaId
  ,NULL
FROM old.Shussouba s
INNER JOIN mig_race m ON m.OldId = s.RaceId;

-- ---------------------------------------------------------------
-- Kyousouba (馬 x 性別 x 馬記号 x 調教師 の組み合わせ)
--   旧 Kyousouba.KoueiGaikokuKyuushaMei は移行しない。
-- ---------------------------------------------------------------
INSERT INTO Kyousouba (UmaId, Seibetsu, UmaKigou, ChoukyoushiId)
SELECT DISTINCT UmaId, Seibetsu, UmaKigou, ChoukyoushiId
FROM mig_shussouba
WHERE UmaId IS NOT NULL;

UPDATE mig_shussouba SET KyousoubaId = (
  SELECT MIN(k.Id)
  FROM Kyousouba k
  WHERE k.UmaId = mig_shussouba.UmaId
    AND COALESCE(k.Seibetsu, -1) = COALESCE(mig_shussouba.Seibetsu, -1)
    AND COALESCE(k.UmaKigou, -1) = COALESCE(mig_shussouba.UmaKigou, -1)
    AND COALESCE(k.ChoukyoushiId, -1) = COALESCE(mig_shussouba.ChoukyoushiId, -1)
)
WHERE UmaId IS NOT NULL;

-- ---------------------------------------------------------------
-- Shussouba (出馬表の内容)
--   旧 Blinker (1:ブリンカー) は 新 Blinker の 3 にする。ShussoubaJoutai(Kubun=Bagu, Code=Blinker) は
--   Importer と同じ Id (出走馬Id * 2^14 + Kubun * 2^10 + Code) で作る。
--   旧 Shussouba の Gate / Bataijuu / Zougen / YosouShirushi / Ninki / Odds などは
--   新 Shussouba に列が無い。成績に関わるものは ShussoubaSeiseki に入れる。
-- ---------------------------------------------------------------
INSERT INTO Shussouba (
  Id, RaceId, Wakuban, Umaban, KyousoubaId, Nenrei, Kinryou
  ,KishuId, KishuTouzaiBetsu, KishuShozokuBasho, KishuShozokuChoukyoushiId, MinaraiKubun, Norikawari
  ,Blinker, TorikeshiShubetsu, KolNengappi
)
SELECT
  ms.NewId, ms.RaceId, s.Wakuban, s.Umaban, ms.KyousoubaId, s.Nenrei, s.Kinryou
  ,s.KishuId, s.KishuTouzaiBetsu, s.KishuShozokuBasho, s.KishuShozokuKyuushaId, s.MinaraiKubun, s.Norikawari
  ,CASE WHEN s.Blinker = 1 THEN 3 END, s.TorikeshiShubetsu, cs.Ymd
FROM old.Shussouba s
INNER JOIN mig_shussouba ms ON ms.OldId = s.Id
LEFT JOIN mig_calendar cs ON cs.D = s.ShutsubahyouSakuseiNengappi;

INSERT INTO ShussoubaJoutai (Id, ShussoubaId, Kubun, Code)
SELECT ms.NewId * 16384 + 3 * 1024 + 1, ms.NewId, 3, 1
FROM old.Shussouba s
INNER JOIN mig_shussouba ms ON ms.OldId = s.Id
WHERE s.Blinker = 1;

-- ---------------------------------------------------------------
-- ShussoubaSeiseki (成績が入っている出走馬だけ。Id は Shussouba.Id と同じ)
--   旧 Zenhan3F -> Ten3F, 旧 Kouhan3F -> Agari3F
-- ---------------------------------------------------------------
INSERT INTO ShussoubaSeiseki (
  Id, Gate, Kinryou, Bataijuu, Zougen
  ,KishuId, KishuTouzaiBetsu, KishuShozokuBasho, KishuShozokuChoukyoushiId, MinaraiKubun, Norikawari
  ,KakuteiChakujun, ChakujunFuka, NyuusenChakujun, TorikeshiShubetsu, RecordNinshiki
  ,Time, Chakusa1, Chakusa2, TimeSa, Ten3F, Agari3F, YonCornerIchiDori, KolNengappi
)
SELECT
  ms.NewId, s.Gate, s.Kinryou, s.Bataijuu, s.Zougen
  ,s.KishuId, s.KishuTouzaiBetsu, s.KishuShozokuBasho, s.KishuShozokuKyuushaId, s.MinaraiKubun, s.Norikawari
  ,s.KakuteiChakujun, s.ChakujunFuka, s.NyuusenChakujun, s.TorikeshiShubetsu, s.RecordNinshiki
  ,s.Time, s.Chakusa1, s.Chakusa2, s.TimeSa, s.Zenhan3F, s.Kouhan3F, s.YonCornerIchiDori, cs.Ymd
FROM old.Shussouba s
INNER JOIN mig_shussouba ms ON ms.OldId = s.Id
INNER JOIN mig_calendar cs ON cs.D = s.SeisekiSakuseiNengappi;

-- ---------------------------------------------------------------
-- ShussoubaTsuukaJuni (Id = 新出走馬ID * 32 + 旧 Bangou)
-- ---------------------------------------------------------------
INSERT INTO ShussoubaTsuukaJuni (Id, ShussoubaId, Bangou, Juni, Joukyou)
SELECT ms.NewId * 32 + t.Bangou, ms.NewId, t.Bangou, t.Juni, t.Joukyou
FROM old.ShussoubaTsuukaJuni t
INNER JOIN mig_shussouba ms ON ms.OldId = t.ShussoubaId;

-- ---------------------------------------------------------------
-- ShussoubaHassouJoukyou (Id = 新出走馬ID * 16 + 発走状況の番号)
--   発走状況の番号 = 旧 RaceHassouJoukyou.Id の下1桁 (= 新 RaceHassouJoukyou.Id の下4bit)
-- ---------------------------------------------------------------
INSERT INTO ShussoubaHassouJoukyou (Id, RaceHassouJoukyouId, ShussoubaId)
SELECT
  ms.NewId * 16 + (rh.Id - rh.RaceId * 10)
  ,mr.NewId * 16 + (rh.Id - rh.RaceId * 10)
  ,ms.NewId
FROM old.ShussoubaHassouJoukyou h
INNER JOIN old.RaceHassouJoukyou rh ON rh.Id = h.RaceHassouJoukyouId
INNER JOIN mig_race mr ON mr.OldId = rh.RaceId
INNER JOIN mig_shussouba ms ON ms.OldId = h.ShussoubaId;

-- ---------------------------------------------------------------
-- Shoyuu (馬主・生産者の名前) / Banushi / Seisansha
--   Kubun: 0=正式名, 1=短縮名
-- ---------------------------------------------------------------
CREATE TABLE mig_shoyuu (
  Kubun INT NOT NULL
  ,Meishou VARCHAR(255) NOT NULL
);

INSERT INTO mig_shoyuu (Kubun, Meishou)
SELECT 0, BanushiMei FROM old.Shussouba WHERE BanushiMei <> ''
UNION ALL SELECT 1, TanshukuBanushiMei FROM old.Shussouba WHERE TanshukuBanushiMei <> ''
UNION ALL SELECT 0, BanushiMei FROM old.Kyousouba WHERE BanushiMei <> ''
UNION ALL SELECT 1, TanshukuBanushiMei FROM old.Kyousouba WHERE TanshukuBanushiMei <> ''
UNION ALL SELECT 0, SeisanshaMei FROM old.Kyousouba WHERE SeisanshaMei <> ''
UNION ALL SELECT 1, TanshukuSeisanshaMei FROM old.Kyousouba WHERE TanshukuSeisanshaMei <> '';

INSERT INTO Shoyuu (Kubun, Meishou)
SELECT MIN(x.Kubun), x.Meishou
FROM mig_shoyuu x
WHERE NOT EXISTS (SELECT 1 FROM Shoyuu s WHERE s.Meishou = x.Meishou)
GROUP BY x.Meishou;

INSERT INTO Banushi (ShussoubaId, MeishouId)
SELECT DISTINCT ms.NewId, sh.Id
FROM old.Shussouba s
INNER JOIN mig_shussouba ms ON ms.OldId = s.Id
INNER JOIN Shoyuu sh ON sh.Meishou = s.BanushiMei OR sh.Meishou = s.TanshukuBanushiMei;

INSERT INTO Seisansha (UmaId, ShoyuuId)
SELECT DISTINCT u.Id, sh.Id
FROM old.Kyousouba k
INNER JOIN Uma u ON u.Id = CAST(k.Id AS DECIMAL(18, 0))
INNER JOIN Shoyuu sh ON sh.Meishou = k.SeisanshaMei OR sh.Meishou = k.TanshukuSeisanshaMei;
