CREATE VIEW Race_ AS
SELECT
	R.Id
	,K.Basho AS KaisaiBasho
	,K.Nen AS KaisaiNen
	,K.Kaiji AS KaisaiKaiji
	,K.Nichiji AS KaisaiNichiji
	,RaceBangou
	,Nen || '-' || PRINTF('%02d', Gatsu) || '-' || PRINTF('%02d', Nichi) AS Nengappi
	,Kyuujitsu
	,Youbi
	,JoukenKouryuu AS KouryuuFlag
	,ChuuouChihouGaikoku
	,IppanTokubetsu
	,HeichiShougai
	,JuushouKaisuu
	,(SELECT Meishou FROM TokubetsuMei TM INNER JOIN RaceMei RM ON TM.Id = RM.TokubetsuMeiId WHERE R.Id = RM.RaceId ORDER BY LENGTH(Meishou) DESC LIMIT 1) AS TokubetsuMei
	,(SELECT Meishou FROM TokubetsuMei TM INNER JOIN RaceMei RM ON TM.Id = RM.TokubetsuMeiId WHERE R.Id = RM.RaceId ORDER BY LENGTH(Meishou) LIMIT 1) AS TanshukuTokubetsuMei
	,Grade
	,JpnFlag
	,BetteiBareiHandi
	,BetteiBareiHandiReigai AS BetteiBareiHandiShousai
	,NULL AS JoukenFuka1
	,NULL AS JoukenFuka2
	,NULL AS JoukenKei
	,JoukenNenreiSeigen
	,Jouken1
	,Kumi1
	,IjouIkaMiman
	,Jouken2
	,Kumi2
	,DirtShiba
	,MigiHidari
	,UchiSoto
	,Course
	,Kyori
	,NULL AS CourseRecordFlag
	,RC.Nengappi AS CourseRecordNengappi
	,RC.Time AS CourseRecordTime
	,RCU.KanaBamei AS CourseRecordBamei
	,RC.Kinryou AS CourseRecordKinryou
	,RCJ.Meishou AS CourseRecordTanshukuKishuMei
	,RK.Nengappi AS KyoriRecordNengappi
	,RK.Time AS KyoriRecordTime
	,RKU.KanaBamei AS KyoriRecordBamei
	,RK.Kinryou AS KyoriRecordKinryou
	,RKJ.Meishou AS KyoriRecordTanshukuKishuMei
	,RK.Basho AS KyoriRecordBasho
	,RR.Nengappi AS RaceRecordNengappi
	,RR.Time AS RaceRecordTime
	,RRU.KanaBamei AS RaceRecordBamei
	,RR.Kinryou AS RaceRecordKinryou
	,RRJ.Meishou AS RaceRecordTanshukuKishuMei
	,RR.Basho AS RaceRecordBasho
	,COALESCE(RS.Shoukin1Chaku, R.Shoukin1Chaku) AS Shoukin1Chaku
	,COALESCE(RS.Shoukin2Chaku, R.Shoukin2Chaku) AS Shoukin2Chaku
	,COALESCE(RS.Shoukin3Chaku, R.Shoukin3Chaku) AS Shoukin3Chaku
	,COALESCE(RS.Shoukin4Chaku, R.Shoukin4Chaku) AS Shoukin4Chaku
	,COALESCE(RS.Shoukin5Chaku, R.Shoukin5Chaku) AS Shoukin5Chaku
	,Shoukin5ChakuDouchaku AS Shoukin5ChakuDouchaku1
	,Shoukin5ChakuDouchaku2
	,FukaShou
	,MaeuriFlag
	,YoteiHassouJikan
	,Tousuu
	,COALESCE(RS.TorikeshiTousuu, R.TorikeshiTousuu) AS TorikeshiTousuu
	,SuiteiTimeRyou
	,SuiteiTimeOmoFuryou
	,YosouPace
	,Pace
	,Tenki
	,Baba
	,JoukenSeed AS Seed
	,ShougaiHeikin1F
	,R.KolNengappi AS ShutsubahyouSakuseiNengappi
	,RS.KolNengappi AS SeisekiSakuseiNengappi
FROM
  Race R
  INNER JOIN Kaisai K ON K.Id = R.KaisaiId
  LEFT JOIN RaceSeiseki RS ON R.Id = RS.Id
  LEFT JOIN Record RC ON RC.Id = R.CourseRecordId
  LEFT JOIN Uma RCU ON RCU.Id = RC.UmaId
  LEFT JOIN Jinmei RCJ ON RCJ.Id = RC.TanshukuKishuMeiId
  LEFT JOIN Record RK ON RC.Id = R.KyoriRecordId
  LEFT JOIN Uma RKU ON RKU.Id = RK.UmaId
  LEFT JOIN Jinmei RKJ ON RKJ.Id = RK.TanshukuKishuMeiId
  LEFT JOIN Record RR ON RC.Id = R.RaceRecordId
  LEFT JOIN Uma RRU ON RRU.Id = RR.UmaId
  LEFT JOIN Jinmei RRJ ON RRJ.Id = RK.TanshukuKishuMeiId
