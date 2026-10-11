-- 90_verify.sql: 移行元と移行先の件数を比べる。
-- 「旧」と「新」が一致しない行は、重複の統合や対象外のデータがあることを示す。
--   Race / Shussouba / ShussoubaSeiseki / RaceLapTime / RaceKeika / RaceHassouJoukyou /
--   ShussoubaTsuukaJuni / ShussoubaHassouJoukyou は、原則として一致するはず。

SELECT 'Race' AS Tbl, (SELECT COUNT(*) FROM old.Race) AS Old, (SELECT COUNT(*) FROM Race) AS New
UNION ALL SELECT 'Race(日付なしで除外)', (SELECT COUNT(*) FROM old.Race r WHERE NOT EXISTS (SELECT 1 FROM mig_race m WHERE m.OldId = r.Id)), 0
UNION ALL SELECT 'RaceSeiseki', (SELECT COUNT(*) FROM old.Race WHERE SeisekiSakuseiNengappi IS NOT NULL), (SELECT COUNT(*) FROM RaceSeiseki)
UNION ALL SELECT 'Shussouba', (SELECT COUNT(*) FROM old.Shussouba), (SELECT COUNT(*) FROM Shussouba)
UNION ALL SELECT 'ShussoubaSeiseki', (SELECT COUNT(*) FROM old.Shussouba WHERE SeisekiSakuseiNengappi IS NOT NULL), (SELECT COUNT(*) FROM ShussoubaSeiseki)
UNION ALL SELECT 'RaceLapTime', (SELECT COUNT(*) FROM old.RaceLapTime), (SELECT COUNT(*) FROM RaceLapTime)
UNION ALL SELECT 'RaceKeika', (SELECT COUNT(*) FROM old.RaceKeika), (SELECT COUNT(*) FROM RaceKeika)
UNION ALL SELECT 'RaceHassouJoukyou', (SELECT COUNT(*) FROM old.RaceHassouJoukyou), (SELECT COUNT(*) FROM RaceHassouJoukyou)
UNION ALL SELECT 'ShussoubaTsuukaJuni', (SELECT COUNT(*) FROM old.ShussoubaTsuukaJuni), (SELECT COUNT(*) FROM ShussoubaTsuukaJuni)
UNION ALL SELECT 'ShussoubaHassouJoukyou', (SELECT COUNT(*) FROM old.ShussoubaHassouJoukyou), (SELECT COUNT(*) FROM ShussoubaHassouJoukyou)
UNION ALL SELECT 'Kishu', (SELECT COUNT(*) FROM old.Kishu), (SELECT COUNT(*) FROM Kishu)
UNION ALL SELECT 'Choukyoushi', (SELECT COUNT(*) FROM old.Kyuusha), (SELECT COUNT(*) FROM Choukyoushi)
UNION ALL SELECT 'Uma', (SELECT COUNT(*) FROM old.Kyousouba), (SELECT COUNT(*) FROM Uma)
UNION ALL SELECT 'Choukyou(重複統合あり)', (SELECT COUNT(*) FROM old.ChoukyouRireki), (SELECT COUNT(*) FROM Choukyou)
UNION ALL SELECT 'ChoukyouTime(重複統合あり)', (SELECT COUNT(*) FROM old.ChoukyouTime), (SELECT COUNT(*) FROM ChoukyouTime)
UNION ALL SELECT 'ShussoubaChoukyou', (SELECT COUNT(*) FROM old.ChoukyouRireki), (SELECT COUNT(*) FROM ShussoubaChoukyou)
UNION ALL SELECT 'Kaisai', 0, (SELECT COUNT(*) FROM Kaisai)
UNION ALL SELECT 'OddsHaitou', 0, (SELECT COUNT(*) FROM OddsHaitou);
