-- 20_race.sql: 開催・レース・記録・ラップ・経過・発走状況・オッズ/払戻を移行する。
--
-- 旧テーブル                          -> 新テーブル
--   Race                                -> Kaisai, Race, RaceSeiseki, TokubetsuMei, RaceMei, Record
--   RaceLapTime                         -> RaceLapTime
--   RaceKeika                           -> RaceKeika
--   RaceHassouJoukyou                   -> RaceHassouJoukyou
--   RaceHaitou / OddsKubun + Odds       -> OddsHaitou
--
-- ID は Importer と同じ規則で作る。
--   KaisaiId = 1970-01-01からの経過日数 * 128 + 場所
--   RaceId   = KaisaiId * 64 + レース番号

-- ---------------------------------------------------------------
-- 旧レースID -> 新レースID の対応表
-- ---------------------------------------------------------------
CREATE TABLE mig_race (
  OldId BIGINT NOT NULL PRIMARY KEY
  ,NewId BIGINT NOT NULL
  ,KaisaiId BIGINT NOT NULL
  ,Ymd INT NOT NULL
);

INSERT INTO mig_race (OldId, NewId, KaisaiId, Ymd)
SELECT
  r.Id
  ,(c.Days * 128 + r.KaisaiBasho) * 64 + r.RaceBangou
  ,c.Days * 128 + r.KaisaiBasho
  ,c.Ymd
FROM old.Race r
INNER JOIN mig_calendar c ON c.D = r.Nengappi;

-- ---------------------------------------------------------------
-- Kaisai (旧 Race を 場所 + 日付 でまとめる)
--   Key = (年 - 1970) * 2^17 + 回次 * 2^12 + 日次 * 2^7
-- ---------------------------------------------------------------
INSERT INTO Kaisai ("key", Id, Basho, Nen, Gatsu, Nichi, Kaiji, Nichiji, Youbi, Kyuujitsu, ChuuouChihouGaikoku)
SELECT
  (x.Nen - 1970) * 131072 + COALESCE(x.Kaiji, 0) * 4096 + COALESCE(x.Nichiji, 0) * 128
  ,x.KaisaiId, x.Basho, x.Nen, x.Gatsu, x.Nichi, x.Kaiji, x.Nichiji, x.Youbi, x.Kyuujitsu, x.ChuuouChihouGaikoku
FROM (
  SELECT
    m.KaisaiId AS KaisaiId
    ,r.KaisaiBasho AS Basho
    ,c.Y AS Nen
    ,c.M AS Gatsu
    ,c.DD AS Nichi
    ,MAX(r.KaisaiKaiji) AS Kaiji
    ,MAX(r.KaisaiNichiji) AS Nichiji
    ,MAX(r.Youbi) AS Youbi
    ,MAX(r.Kyuujitsu) AS Kyuujitsu
    ,MAX(r.ChuuouChihouGaikoku) AS ChuuouChihouGaikoku
  FROM old.Race r
  INNER JOIN mig_race m ON m.OldId = r.Id
  INNER JOIN mig_calendar c ON c.D = r.Nengappi
  GROUP BY m.KaisaiId, r.KaisaiBasho, c.Y, c.M, c.DD
) x;

-- ---------------------------------------------------------------
-- Race
--   旧 JoukenKei / JoukenFuka1 / JoukenFuka2 は、新しい条件フラグ(JoukenSarakei など)に
--   一対一で対応しないため移行しない。
-- ---------------------------------------------------------------
INSERT INTO Race (
  Id, KaisaiId, RaceBangou, IppanTokubetsu, HeichiShougai, Grade, JpnFlag, JuushouKaisuu
  ,JoukenKouryuu, BetteiBareiHandi, BetteiBareiHandiReigai, JoukenNenreiSeigen
  ,Jouken1, Kumi1, IjouIkaMiman, Jouken2, Kumi2
  ,DirtShiba, MigiHidari, UchiSoto, Course, Kyori, MaeuriFlag, YoteiHassouJikan, Tousuu, TorikeshiTousuu
  ,Shoukin1Chaku, Shoukin2Chaku, Shoukin3Chaku, Shoukin4Chaku, Shoukin5Chaku, FukaShou
  ,SuiteiTimeRyou, SuiteiTimeOmoFuryou, YosouPace, JoukenSeed, KolNengappi
)
SELECT
  m.NewId, m.KaisaiId, r.RaceBangou, r.IppanTokubetsu, r.HeichiShougai, r.Grade, r.JpnFlag, r.JuushouKaisuu
  ,r.KouryuuFlag, r.BetteiBareiHandi, r.BetteiBareiHandiShousai, r.JoukenNenreiSeigen
  ,r.Jouken1, r.Kumi1, r.IjouIkaMiman, r.Jouken2, r.Kumi2
  ,r.DirtShiba, r.MigiHidari, r.UchiSoto, r.Course, r.Kyori, r.MaeuriFlag, r.YoteiHassouJikan, r.Tousuu, r.TorikeshiTousuu
  ,r.Shoukin1Chaku, r.Shoukin2Chaku, r.Shoukin3Chaku, r.Shoukin4Chaku, r.Shoukin5Chaku, r.FukaShou
  ,r.SuiteiTimeRyou, r.SuiteiTimeOmoFuryou, r.YosouPace, r.Seed, cs.Ymd
FROM old.Race r
INNER JOIN mig_race m ON m.OldId = r.Id
LEFT JOIN mig_calendar cs ON cs.D = r.ShutsubahyouSakuseiNengappi;

-- 成績が入っているレースだけ RaceSeiseki を作る(Id は Race.Id と同じ)
INSERT INTO RaceSeiseki (
  Id, TorikeshiTousuu, Pace, Tenki, Baba, ShougaiHeikin1F
  ,Shoukin1Chaku, Shoukin2Chaku, Shoukin3Chaku, Shoukin4Chaku, Shoukin5Chaku
  ,Shoukin5ChakuDouchaku, Shoukin5ChakuDouchaku2, KolNengappi
)
SELECT
  m.NewId, r.TorikeshiTousuu, r.Pace, r.Tenki, r.Baba, r.ShougaiHeikin1F
  ,r.Shoukin1Chaku, r.Shoukin2Chaku, r.Shoukin3Chaku, r.Shoukin4Chaku, r.Shoukin5Chaku
  ,r.Shoukin5ChakuDouchaku1, r.Shoukin5ChakuDouchaku2, cs.Ymd
FROM old.Race r
INNER JOIN mig_race m ON m.OldId = r.Id
INNER JOIN mig_calendar cs ON cs.D = r.SeisekiSakuseiNengappi;

-- ---------------------------------------------------------------
-- TokubetsuMei / RaceMei (正式名と短縮名の両方を登録)
-- ---------------------------------------------------------------
CREATE TABLE mig_race_mei (
  RaceId BIGINT NOT NULL
  ,Meishou VARCHAR(255) NOT NULL
);

INSERT INTO mig_race_mei (RaceId, Meishou)
SELECT m.NewId, r.TokubetsuMei
FROM old.Race r INNER JOIN mig_race m ON m.OldId = r.Id
WHERE r.TokubetsuMei <> ''
UNION
SELECT m.NewId, r.TanshukuTokubetsuMei
FROM old.Race r INNER JOIN mig_race m ON m.OldId = r.Id
WHERE r.TanshukuTokubetsuMei <> '';

INSERT INTO TokubetsuMei (Meishou)
SELECT DISTINCT x.Meishou
FROM mig_race_mei x
WHERE NOT EXISTS (SELECT 1 FROM TokubetsuMei t WHERE t.Meishou = x.Meishou);

INSERT INTO RaceMei (RaceId, TokubetsuMeiId)
SELECT x.RaceId, t.Id
FROM mig_race_mei x
INNER JOIN TokubetsuMei t ON t.Meishou = x.Meishou;

-- ---------------------------------------------------------------
-- Record (コースレコード / 距離レコード / レース(条件)レコード)
--   Kind: C=コース, K=距離, R=レース
--   馬は馬名(KanaBamei)で探し、無ければ Uma を追加する。
-- ---------------------------------------------------------------
CREATE TABLE mig_record (
  Kind VARCHAR(1) NOT NULL
  ,RaceId BIGINT NOT NULL
  ,Ymd INT NOT NULL
  ,Time REAL NOT NULL
  ,Bamei VARCHAR(255) NOT NULL
  ,Kinryou REAL NOT NULL
  ,Mei VARCHAR(255) NOT NULL
  ,Basho INT NOT NULL
);

INSERT INTO mig_record (Kind, RaceId, Ymd, Time, Bamei, Kinryou, Mei, Basho)
SELECT 'C', m.NewId, c.Ymd, r.CourseRecordTime, r.CourseRecordBamei, r.CourseRecordKinryou, r.CourseRecordTanshukuKishuMei, r.KaisaiBasho
FROM old.Race r
INNER JOIN mig_race m ON m.OldId = r.Id
INNER JOIN mig_calendar c ON c.D = r.CourseRecordNengappi
WHERE r.CourseRecordTime IS NOT NULL AND r.CourseRecordBamei IS NOT NULL AND r.CourseRecordKinryou IS NOT NULL
  AND r.CourseRecordTanshukuKishuMei IS NOT NULL
UNION ALL
SELECT 'K', m.NewId, c.Ymd, r.KyoriRecordTime, r.KyoriRecordBamei, r.KyoriRecordKinryou, r.KyoriRecordTanshukuKishuMei, r.KyoriRecordBasho
FROM old.Race r
INNER JOIN mig_race m ON m.OldId = r.Id
INNER JOIN mig_calendar c ON c.D = r.KyoriRecordNengappi
WHERE r.KyoriRecordTime IS NOT NULL AND r.KyoriRecordBamei IS NOT NULL AND r.KyoriRecordKinryou IS NOT NULL
  AND r.KyoriRecordTanshukuKishuMei IS NOT NULL AND r.KyoriRecordBasho IS NOT NULL
UNION ALL
SELECT 'R', m.NewId, c.Ymd, r.RaceRecordTime, r.RaceRecordBamei, r.RaceRecordKinryou, r.RaceRecordTanshukuKishuMei, r.RaceRecordBasho
FROM old.Race r
INNER JOIN mig_race m ON m.OldId = r.Id
INNER JOIN mig_calendar c ON c.D = r.RaceRecordNengappi
WHERE r.RaceRecordTime IS NOT NULL AND r.RaceRecordBamei IS NOT NULL AND r.RaceRecordKinryou IS NOT NULL
  AND r.RaceRecordTanshukuKishuMei IS NOT NULL AND r.RaceRecordBasho IS NOT NULL;

-- 新しい馬の Id は、現在の最大 Id の次から振る
CREATE TABLE mig_const (UmaIdBase BIGINT NOT NULL);
INSERT INTO mig_const (UmaIdBase) SELECT COALESCE(MAX(Id), 0) FROM Uma;

INSERT INTO Uma (Id, KanaBamei)
SELECT (SELECT UmaIdBase FROM mig_const) + ROW_NUMBER() OVER (ORDER BY b.Bamei), b.Bamei
FROM (SELECT DISTINCT Bamei FROM mig_record) b
WHERE NOT EXISTS (SELECT 1 FROM Uma u WHERE u.KanaBamei = b.Bamei);

-- 馬名 -> Uma.Id (同名が複数ある場合は最小の Id)
CREATE TABLE mig_uma_name (
  KanaBamei VARCHAR(255) NOT NULL PRIMARY KEY
  ,UmaId BIGINT NOT NULL
);
INSERT INTO mig_uma_name (KanaBamei, UmaId)
SELECT u.KanaBamei, MIN(u.Id)
FROM Uma u
WHERE u.KanaBamei IN (SELECT Bamei FROM mig_record)
GROUP BY u.KanaBamei;

INSERT INTO Record (Nengappi, Time, UmaId, Kinryou, TanshukuKishuMeiId, Basho)
SELECT m.Ymd, MIN(m.Time), n.UmaId, MIN(m.Kinryou), MIN(j.Id), MIN(m.Basho)
FROM mig_record m
INNER JOIN mig_uma_name n ON n.KanaBamei = m.Bamei
INNER JOIN Jinmei j ON j.Meishou = m.Mei
GROUP BY m.Ymd, n.UmaId;

UPDATE Race SET CourseRecordId = (
  SELECT MIN(rc.Id)
  FROM mig_record m
  INNER JOIN mig_uma_name n ON n.KanaBamei = m.Bamei
  INNER JOIN Record rc ON rc.Nengappi = m.Ymd AND rc.UmaId = n.UmaId
  WHERE m.Kind = 'C' AND m.RaceId = Race.Id
)
WHERE Id IN (SELECT RaceId FROM mig_record WHERE Kind = 'C');

UPDATE Race SET KyoriRecordId = (
  SELECT MIN(rc.Id)
  FROM mig_record m
  INNER JOIN mig_uma_name n ON n.KanaBamei = m.Bamei
  INNER JOIN Record rc ON rc.Nengappi = m.Ymd AND rc.UmaId = n.UmaId
  WHERE m.Kind = 'K' AND m.RaceId = Race.Id
)
WHERE Id IN (SELECT RaceId FROM mig_record WHERE Kind = 'K');

UPDATE Race SET RaceRecordId = (
  SELECT MIN(rc.Id)
  FROM mig_record m
  INNER JOIN mig_uma_name n ON n.KanaBamei = m.Bamei
  INNER JOIN Record rc ON rc.Nengappi = m.Ymd AND rc.UmaId = n.UmaId
  WHERE m.Kind = 'R' AND m.RaceId = Race.Id
)
WHERE Id IN (SELECT RaceId FROM mig_record WHERE Kind = 'R');

-- ---------------------------------------------------------------
-- RaceLapTime (Id = 新レースID * 128 + 旧 Bangou)
-- ---------------------------------------------------------------
INSERT INTO RaceLapTime (Id, RaceId, KaishiKyori, ShuuryouKyori, LapTime)
SELECT m.NewId * 128 + l.Bangou, m.NewId, l.KaishiKyori, l.ShuuryouKyori, l.LapTime
FROM old.RaceLapTime l
INNER JOIN mig_race m ON m.OldId = l.RaceId;

-- ---------------------------------------------------------------
-- RaceKeika (Id = 新レースID * 16 + 旧 Bangou)
-- ---------------------------------------------------------------
INSERT INTO RaceKeika (Id, RaceId, Keika, Midashi1, Midashi2)
SELECT m.NewId * 16 + k.Bangou, m.NewId, k.Keika, k.Midashi1, k.Midashi2
FROM old.RaceKeika k
INNER JOIN mig_race m ON m.OldId = k.RaceId;

-- ---------------------------------------------------------------
-- RaceHassouJoukyou (Id = 新レースID * 16 + 旧Idの下1桁)
--   旧 FuriByousuu は新 FuriByou に入れる。旧 UmabanGun は移行しない。
-- ---------------------------------------------------------------
INSERT INTO RaceHassouJoukyou (Id, RaceId, HassouJoukyou, Ichi, Joukyou, FuriByou)
SELECT m.NewId * 16 + (h.Id - h.RaceId * 10), m.NewId, h.HassouJoukyou, h.Ichi, h.Joukyou, h.FuriByousuu
FROM old.RaceHassouJoukyou h
INNER JOIN mig_race m ON m.OldId = h.RaceId;

-- ---------------------------------------------------------------
-- OddsHaitou (確定オッズ・予想オッズ・払戻を1行にまとめる)
--   Kakutei: 旧 YosouKakutei 1(予想) -> 0, 2(確定) -> 4。払戻は 4(確定)。
--   Baken  : 旧 BakenShubetsu 1:単勝 2:枠連 3:馬連 4:複勝 5:ワイド 6:馬単 7:三連複 8:三連単
--            -> 新 0:単勝 1:複勝 2:枠連 3:馬連 4:ワイド 5:馬単 6:三連複 7:三連単
--   Id     : レースID * 2^22 + 確定 * 2^19 + 馬券 * 2^15 + 馬番1 * 2^10 + 馬番2 * 2^5 + 馬番3
--            (Importer は確定に 2bit しか割り当てておらず、確定(=4)が次レースの予想(=0)と
--             衝突し得るため、確定に 3bit を割り当てている)
-- ---------------------------------------------------------------
CREATE TABLE mig_odds (
  RaceId BIGINT NOT NULL
  ,Kakutei INT NOT NULL
  ,Baken INT NOT NULL
  ,Bangou1 INT NOT NULL
  ,Bangou2 INT
  ,Bangou3 INT
  ,Odds1 REAL
  ,Odds2 REAL
  ,Haitoukin INT
  ,Ninki INT
);

INSERT INTO mig_odds (RaceId, Kakutei, Baken, Bangou1, Bangou2, Bangou3, Odds1, Odds2, Haitoukin, Ninki)
SELECT
  m.NewId
  ,CASE k.YosouKakutei WHEN 1 THEN 0 ELSE 4 END
  ,CASE k.BakenShubetsu WHEN 1 THEN 0 WHEN 4 THEN 1 WHEN 2 THEN 2 WHEN 3 THEN 3 WHEN 5 THEN 4 WHEN 6 THEN 5 WHEN 7 THEN 6 ELSE 7 END
  ,o.Bangou1, o.Bangou2, o.Bangou3, o.Odds1, o.Odds2, NULL, NULL
FROM old.Odds o
INNER JOIN old.OddsKubun k ON k.Id = o.OddsKubunId
INNER JOIN mig_race m ON m.OldId = k.RaceId;

INSERT INTO mig_odds (RaceId, Kakutei, Baken, Bangou1, Bangou2, Bangou3, Odds1, Odds2, Haitoukin, Ninki)
SELECT m.NewId, 4, h.Baken, h.Bangou1, h.Bangou2, h.Bangou3, NULL, NULL, h.Haitoukin, h.Ninki
FROM (
SELECT Id AS RaceId, 0 AS Baken, TanUmaban1 AS Bangou1, NULL AS Bangou2, NULL AS Bangou3, TanshouHaitoukin1 AS Haitoukin, NULL AS Ninki FROM old.RaceHaitou WHERE TanUmaban1 IS NOT NULL
UNION ALL SELECT Id, 0, TanUmaban2, NULL, NULL, TanshouHaitoukin2, NULL FROM old.RaceHaitou WHERE TanUmaban2 IS NOT NULL
UNION ALL SELECT Id, 0, TanUmaban3, NULL, NULL, TanshouHaitoukin3, NULL FROM old.RaceHaitou WHERE TanUmaban3 IS NOT NULL
UNION ALL SELECT Id, 1, FukuUmaban1, NULL, NULL, FukushouHaitoukin1, NULL FROM old.RaceHaitou WHERE FukuUmaban1 IS NOT NULL
UNION ALL SELECT Id, 1, FukuUmaban2, NULL, NULL, FukushouHaitoukin2, NULL FROM old.RaceHaitou WHERE FukuUmaban2 IS NOT NULL
UNION ALL SELECT Id, 1, FukuUmaban3, NULL, NULL, FukushouHaitoukin3, NULL FROM old.RaceHaitou WHERE FukuUmaban3 IS NOT NULL
UNION ALL SELECT Id, 1, FukuUmaban4, NULL, NULL, FukushouHaitoukin4, NULL FROM old.RaceHaitou WHERE FukuUmaban4 IS NOT NULL
UNION ALL SELECT Id, 1, FukuUmaban5, NULL, NULL, FukushouHaitoukin5, NULL FROM old.RaceHaitou WHERE FukuUmaban5 IS NOT NULL
UNION ALL SELECT Id, 2, Wakuren11, Wakuren12, NULL, WakurenHaitoukin1, WakurenNinki1 FROM old.RaceHaitou WHERE Wakuren11 IS NOT NULL
UNION ALL SELECT Id, 2, Wakuren21, Wakuren22, NULL, WakurenHaitoukin2, WakurenNinki2 FROM old.RaceHaitou WHERE Wakuren21 IS NOT NULL
UNION ALL SELECT Id, 2, Wakuren31, Wakuren32, NULL, WakurenHaitoukin3, WakurenNinki3 FROM old.RaceHaitou WHERE Wakuren31 IS NOT NULL
UNION ALL SELECT Id, 3, Umaren11, Umaren12, NULL, UmarenHaitoukin1, UmarenNinki1 FROM old.RaceHaitou WHERE Umaren11 IS NOT NULL
UNION ALL SELECT Id, 3, Umaren21, Umaren22, NULL, UmarenHaitoukin2, UmarenNinki2 FROM old.RaceHaitou WHERE Umaren21 IS NOT NULL
UNION ALL SELECT Id, 3, Umaren31, Umaren32, NULL, UmarenHaitoukin3, UmarenNinki3 FROM old.RaceHaitou WHERE Umaren31 IS NOT NULL
UNION ALL SELECT Id, 4, WideUmaren11, WideUmaren12, NULL, WideUmarenHaitoukin1, WideUmarenNinki1 FROM old.RaceHaitou WHERE WideUmaren11 IS NOT NULL
UNION ALL SELECT Id, 4, WideUmaren21, WideUmaren22, NULL, WideUmarenHaitoukin2, WideUmarenNinki2 FROM old.RaceHaitou WHERE WideUmaren21 IS NOT NULL
UNION ALL SELECT Id, 4, WideUmaren31, WideUmaren32, NULL, WideUmarenHaitoukin3, WideUmarenNinki3 FROM old.RaceHaitou WHERE WideUmaren31 IS NOT NULL
UNION ALL SELECT Id, 4, WideUmaren41, WideUmaren42, NULL, WideUmarenHaitoukin4, WideUmarenNinki4 FROM old.RaceHaitou WHERE WideUmaren41 IS NOT NULL
UNION ALL SELECT Id, 4, WideUmaren51, WideUmaren52, NULL, WideUmarenHaitoukin5, WideUmarenNinki5 FROM old.RaceHaitou WHERE WideUmaren51 IS NOT NULL
UNION ALL SELECT Id, 4, WideUmaren61, WideUmaren62, NULL, WideUmarenHaitoukin6, WideUmarenNinki6 FROM old.RaceHaitou WHERE WideUmaren61 IS NOT NULL
UNION ALL SELECT Id, 4, WideUmaren71, WideUmaren72, NULL, WideUmarenHaitoukin7, WideUmarenNinki7 FROM old.RaceHaitou WHERE WideUmaren71 IS NOT NULL
UNION ALL SELECT Id, 5, Umatan11, Umatan12, NULL, UmatanHaitoukin1, UmatanNinki1 FROM old.RaceHaitou WHERE Umatan11 IS NOT NULL
UNION ALL SELECT Id, 5, Umatan21, Umatan22, NULL, UmatanHaitoukin2, UmatanNinki2 FROM old.RaceHaitou WHERE Umatan21 IS NOT NULL
UNION ALL SELECT Id, 5, Umatan31, Umatan32, NULL, UmatanHaitoukin3, UmatanNinki3 FROM old.RaceHaitou WHERE Umatan31 IS NOT NULL
UNION ALL SELECT Id, 5, Umatan41, Umatan42, NULL, UmatanHaitoukin4, UmatanNinki4 FROM old.RaceHaitou WHERE Umatan41 IS NOT NULL
UNION ALL SELECT Id, 5, Umatan51, Umatan52, NULL, UmatanHaitoukin5, UmatanNinki5 FROM old.RaceHaitou WHERE Umatan51 IS NOT NULL
UNION ALL SELECT Id, 5, Umatan61, Umatan62, NULL, UmatanHaitoukin6, UmatanNinki6 FROM old.RaceHaitou WHERE Umatan61 IS NOT NULL
UNION ALL SELECT Id, 6, Sanrenpuku11, Sanrenpuku12, Sanrenpuku13, SanrenpukuHaitoukin1, SanrenpukuNinki1 FROM old.RaceHaitou WHERE Sanrenpuku11 IS NOT NULL
UNION ALL SELECT Id, 6, Sanrenpuku21, Sanrenpuku22, Sanrenpuku23, SanrenpukuHaitoukin2, SanrenpukuNinki2 FROM old.RaceHaitou WHERE Sanrenpuku21 IS NOT NULL
UNION ALL SELECT Id, 6, Sanrenpuku31, Sanrenpuku32, Sanrenpuku33, SanrenpukuHaitoukin3, SanrenpukuNinki3 FROM old.RaceHaitou WHERE Sanrenpuku31 IS NOT NULL
UNION ALL SELECT Id, 7, Sanrentan11, Sanrentan12, Sanrentan13, SanrentanHaitoukin1, SanrentanNinki1 FROM old.RaceHaitou WHERE Sanrentan11 IS NOT NULL
UNION ALL SELECT Id, 7, Sanrentan21, Sanrentan22, Sanrentan23, SanrentanHaitoukin2, SanrentanNinki2 FROM old.RaceHaitou WHERE Sanrentan21 IS NOT NULL
UNION ALL SELECT Id, 7, Sanrentan31, Sanrentan32, Sanrentan33, SanrentanHaitoukin3, SanrentanNinki3 FROM old.RaceHaitou WHERE Sanrentan31 IS NOT NULL
UNION ALL SELECT Id, 7, Sanrentan41, Sanrentan42, Sanrentan43, SanrentanHaitoukin4, SanrentanNinki4 FROM old.RaceHaitou WHERE Sanrentan41 IS NOT NULL
UNION ALL SELECT Id, 7, Sanrentan51, Sanrentan52, Sanrentan53, SanrentanHaitoukin5, SanrentanNinki5 FROM old.RaceHaitou WHERE Sanrentan51 IS NOT NULL
UNION ALL SELECT Id, 7, Sanrentan61, Sanrentan62, Sanrentan63, SanrentanHaitoukin6, SanrentanNinki6 FROM old.RaceHaitou WHERE Sanrentan61 IS NOT NULL
) h
INNER JOIN mig_race m ON m.OldId = h.RaceId;

INSERT INTO OddsHaitou (Id, RaceId, Baken, Kakutei, Bangou1, Bangou2, Bangou3, Odds1, Odds2, Haitoukin, Ninki)
SELECT
  x.RaceId * 4194304 + x.Kakutei * 524288 + x.Baken * 32768 + x.Bangou1 * 1024 + COALESCE(x.Bangou2, 0) * 32 + COALESCE(x.Bangou3, 0)
  ,x.RaceId, x.Baken, x.Kakutei, x.Bangou1, x.Bangou2, x.Bangou3, x.Odds1, x.Odds2, x.Haitoukin, x.Ninki
FROM (
  SELECT
    RaceId, Kakutei, Baken, Bangou1, Bangou2, Bangou3
    ,MAX(Odds1) AS Odds1, MAX(Odds2) AS Odds2, MAX(Haitoukin) AS Haitoukin, MAX(Ninki) AS Ninki
  FROM mig_odds
  GROUP BY RaceId, Kakutei, Baken, Bangou1, Bangou2, Bangou3
) x;
