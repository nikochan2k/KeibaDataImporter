PRAGMA foreign_keys = true;
PRAGMA synchronous = OFF;
PRAGMA journal_mode = MEMORY;
PRAGMA temp_store = MEMORY;

CREATE TABLE Race(
	Id BIGINT NOT NULL PRIMARY KEY
	,KaisaiBasho INT NOT NULL
	,KaisaiNen INT NOT NULL
	,KaisaiKaiji INT NOT NULL
	,KaisaiNichiji INT NOT NULL
	,RaceBangou INT NOT NULL
	,Nengappi DATE NOT NULL
	,Kyuujitsu INT NOT NULL
	,Youbi INT NOT NULL
	,KouryuuFlag INT
	,ChuuouChihouGaikoku INT NOT NULL
	,IppanTokubetsu INT NOT NULL
	,HeichiShougai INT NOT NULL
	,JuushouKaisuu INT
	,TokubetsuMei TEXT
	,TanshukuTokubetsuMei TEXT
	,Grade INT
	,JpnFlag INT
	,BetteiBareiHandi INT
	,BetteiBareiHandiShousai TEXT
	,JoukenFuka1 INT
	,JoukenFuka2 INT
	,JoukenKei INT NOT NULL
	,JoukenNenreiSeigen INT NOT NULL
	,Jouken1 INT
	,Kumi1 INT
	,IjouIkaMiman INT
	,Jouken2 INT
	,Kumi2 INT
	,DirtShiba INT NOT NULL
	,MigiHidari INT NOT NULL
	,UchiSoto INT
	,Course INT
	,Kyori INT NOT NULL
	,CourseRecordFlag INT
	,CourseRecordNengappi DATE
	,CourseRecordTime REAL
	,CourseRecordBamei TEXT
	,CourseRecordKinryou REAL
	,CourseRecordTanshukuKishuMei TEXT
	,KyoriRecordNengappi DATE
	,KyoriRecordTime REAL
	,KyoriRecordBamei TEXT
	,KyoriRecordKinryou REAL
	,KyoriRecordTanshukuKishuMei TEXT
	,KyoriRecordBasho INT
	,RaceRecordNengappi DATE
	,RaceRecordTime REAL
	,RaceRecordBamei TEXT
	,RaceRecordKinryou REAL
	,RaceRecordTanshukuKishuMei TEXT
	,RaceRecordBasho INT
	,Shoukin1Chaku INT
	,Shoukin2Chaku INT
	,Shoukin3Chaku INT
	,Shoukin4Chaku INT
	,Shoukin5Chaku INT
	,Shoukin5ChakuDouchaku1 INT
	,Shoukin5ChakuDouchaku2 INT
	,FukaShou INT
	,MaeuriFlag INT
	,YoteiHassouJikan TEXT
	,Tousuu INT NOT NULL
	,TorikeshiTousuu INT NOT NULL
	,SuiteiTimeRyou REAL
	,SuiteiTimeOmoFuryou REAL
	,YosouPace INT
	,Pace INT
	,Tenki INT
	,Baba INT
	,Seed INT
	,ShougaiHeikin1F REAL
	,ShutsubahyouSakuseiNengappi DATE
	,SeisekiSakuseiNengappi DATE
);
CREATE INDEX UQ_Race ON Race(Nengappi, KaisaiBasho, RaceBangou);

CREATE TABLE RaceLapTime(
	Id BIGINT NOT NULL PRIMARY KEY
	,RaceId BIGINT NOT NULL REFERENCES Race(Id) ON DELETE CASCADE
	,Bangou INT NOT NULL
	,KaishiKyori INT NOT NULL
	,ShuuryouKyori INT NOT NULL
	,LapTime REAL NOT NULL
);
CREATE UNIQUE INDEX UQ_RaceLapTime ON RaceLapTime(RaceId, Bangou);

CREATE TABLE RaceHaitou(
	Id BIGINT NOT NULL PRIMARY KEY REFERENCES Race(Id) ON DELETE CASCADE
	,TanUmaban1 INT
	,TanshouHaitoukin1 INT
	,TanUmaban2 INT
	,TanshouHaitoukin2 INT
	,TanUmaban3 INT
	,TanshouHaitoukin3 INT
	,FukuUmaban1 INT
	,FukushouHaitoukin1 INT
	,FukuUmaban2 INT
	,FukushouHaitoukin2 INT
	,FukuUmaban3 INT
	,FukushouHaitoukin3 INT
	,FukuUmaban4 INT
	,FukushouHaitoukin4 INT
	,FukuUmaban5 INT
	,FukushouHaitoukin5 INT
	,Wakuren11 INT
	,Wakuren12 INT
	,WakurenHaitoukin1 INT
	,WakurenNinki1 INT
	,Wakuren21 INT
	,Wakuren22 INT
	,WakurenHaitoukin2 INT
	,WakurenNinki2 INT
	,Wakuren31 INT
	,Wakuren32 INT
	,WakurenHaitoukin3 INT
	,WakurenNinki3 INT
	,Umaren11 INT
	,Umaren12 INT
	,UmarenHaitoukin1 INT
	,UmarenNinki1 INT
	,Umaren21 INT
	,Umaren22 INT
	,UmarenHaitoukin2 INT
	,UmarenNinki2 INT
	,Umaren31 INT
	,Umaren32 INT
	,UmarenHaitoukin3 INT
	,UmarenNinki3 INT
	,WideUmaren11 INT
	,WideUmaren12 INT
	,WideUmarenHaitoukin1 INT
	,WideUmarenNinki1 INT
	,WideUmaren21 INT
	,WideUmaren22 INT
	,WideUmarenHaitoukin2 INT
	,WideUmarenNinki2 INT
	,WideUmaren31 INT
	,WideUmaren32 INT
	,WideUmarenHaitoukin3 INT
	,WideUmarenNinki3 INT
	,WideUmaren41 INT
	,WideUmaren42 INT
	,WideUmarenHaitoukin4 INT
	,WideUmarenNinki4 INT
	,WideUmaren51 INT
	,WideUmaren52 INT
	,WideUmarenHaitoukin5 INT
	,WideUmarenNinki5 INT
	,WideUmaren61 INT
	,WideUmaren62 INT
	,WideUmarenHaitoukin6 INT
	,WideUmarenNinki6 INT
	,WideUmaren71 INT
	,WideUmaren72 INT
	,WideUmarenHaitoukin7 INT
	,WideUmarenNinki7 INT
	,Umatan11 INT
	,Umatan12 INT
	,UmatanHaitoukin1 INT
	,UmatanNinki1 INT
	,Umatan21 INT
	,Umatan22 INT
	,UmatanHaitoukin2 INT
	,UmatanNinki2 INT
	,Umatan31 INT
	,Umatan32 INT
	,UmatanHaitoukin3 INT
	,UmatanNinki3 INT
	,Umatan41 INT
	,Umatan42 INT
	,UmatanHaitoukin4 INT
	,UmatanNinki4 INT
	,Umatan51 INT
	,Umatan52 INT
	,UmatanHaitoukin5 INT
	,UmatanNinki5 INT
	,Umatan61 INT
	,Umatan62 INT
	,UmatanHaitoukin6 INT
	,UmatanNinki6 INT
	,Sanrenpuku11 INT
	,Sanrenpuku12 INT
	,Sanrenpuku13 INT
	,SanrenpukuHaitoukin1 INT
	,SanrenpukuNinki1 INT
	,Sanrenpuku21 INT
	,Sanrenpuku22 INT
	,Sanrenpuku23 INT
	,SanrenpukuHaitoukin2 INT
	,SanrenpukuNinki2 INT
	,Sanrenpuku31 INT
	,Sanrenpuku32 INT
	,Sanrenpuku33 INT
	,SanrenpukuHaitoukin3 INT
	,SanrenpukuNinki3 INT
	,Sanrentan11 INT
	,Sanrentan12 INT
	,Sanrentan13 INT
	,SanrentanHaitoukin1 INT
	,SanrentanNinki1 INT
	,Sanrentan21 INT
	,Sanrentan22 INT
	,Sanrentan23 INT
	,SanrentanHaitoukin2 INT
	,SanrentanNinki2 INT
	,Sanrentan31 INT
	,Sanrentan32 INT
	,Sanrentan33 INT
	,SanrentanHaitoukin3 INT
	,SanrentanNinki3 INT
	,Sanrentan41 INT
	,Sanrentan42 INT
	,Sanrentan43 INT
	,SanrentanHaitoukin4 INT
	,SanrentanNinki4 INT
	,Sanrentan51 INT
	,Sanrentan52 INT
	,Sanrentan53 INT
	,SanrentanHaitoukin5 INT
	,SanrentanNinki5 INT
	,Sanrentan61 INT
	,Sanrentan62 INT
	,Sanrentan63 INT
	,SanrentanHaitoukin6 INT
	,SanrentanNinki6 INT
);

CREATE TABLE OddsKubun(
	Id BIGINT NOT NULL PRIMARY KEY
	,RaceId BIGINT NOT NULL REFERENCES Race(Id) ON DELETE CASCADE
	,YosouKakutei INT NOT NULL /* 1:予想オッズ 2:確定オッズ */
	,BakenShubetsu INT NOT NULL /* 1:単勝 2:枠連 3:馬連 4:複勝 5:ワイド 6:馬単 7:三連複 8:三連単 */
	,DataSakuseiNengappi DATE NOT NULL
);
CREATE UNIQUE INDEX UQ_OddsKubun ON OddsKubun(RaceId, YosouKakutei, BakenShubetsu);
CREATE INDEX IX_OddsKubun ON OddsKubun(RaceId);

CREATE TABLE Odds(
	OddsKubunId BIGINT NOT NULL REFERENCES OddsKubun(Id) ON DELETE CASCADE
	,Bangou1 INT NOT NULL
	,Bangou2 INT
	,Bangou3 INT
	,Odds1 REAL
	,Odds2 REAL
);
CREATE UNIQUE INDEX UQ_Odds ON Odds(OddsKubunId, Bangou1, Bangou2, Bangou3);
CREATE INDEX IX_Odds ON Odds(OddsKubunId);

CREATE TABLE Shussouba(
	Id BIGINT NOT NULL PRIMARY KEY
	,RaceId BIGINT NOT NULL REFERENCES Race(Id) ON DELETE CASCADE
	,Wakuban INT NOT NULL
	,Umaban INT NOT NULL
	,Gate INT NOT NULL
	,KyousoubaId TEXT
	,KanaBamei TEXT NOT NULL
	,UmaKigou INT
	,Seibetsu INT NOT NULL
	,Nenrei INT NOT NULL
	,BanushiMei TEXT
	,TanshukuBanushiMei TEXT
	,Blinker INT
	,Kinryou REAL
	,Bataijuu INT
	,Zougen INT
	,RecordShisuu INT
	,KishuId INT NOT NULL
	,KishuMei TEXT NOT NULL
	,TanshukuKishuMei TEXT
	,KishuTouzaiBetsu INT
	,KishuShozokuBasho INT
	,KishuShozokuKyuushaId INT
	,MinaraiKubun INT
	,Norikawari INT
	,KyuushaId INT
	,KyuushaMei TEXT
	,TanshukuKyuushaMei TEXT
	,KyuushaShozokuBasho INT
	,KyuushaRitsuHokuNanBetsu INT
	,YosouShirushi INT
	,YosouShirushiHonshi INT
	,Ninki INT
	,Odds REAL
	,KakuteiChakujun INT
	,ChakujunFuka INT
	,NyuusenChakujun INT
	,TorikeshiShubetsu INT
	,RecordNinshiki INT
	,Time REAL
	,Chakusa1 INT
	,Chakusa2 INT
	,TimeSa REAL
	,Zenhan3F REAL
	,Kouhan3F REAL
	,YonCornerIchiDori INT
	,Seinen INT NOT NULL
	,ShutsubahyouSakuseiNengappi DATE
	,SeisekiSakuseiNengappi DATE
);
CREATE UNIQUE INDEX UQ_Shussouba ON Shussouba(RaceId, Umaban);
CREATE INDEX IX_Shussouba01 ON Shussouba(Time);
CREATE INDEX IX_Shussouba02 ON Shussouba(Zenhan3F);
CREATE INDEX IX_Shussouba03 ON Shussouba(Kouhan3F);
CREATE INDEX IX_Shussouba04 ON Shussouba(KyousoubaId);
CREATE INDEX IX_Shussouba05 ON Shussouba(KanaBamei);
CREATE INDEX IX_Shussouba06 ON Shussouba(KishuId);
CREATE INDEX IX_Shussouba07 ON Shussouba(KyuushaId);

CREATE TABLE Kishu(
	Id INT NOT NULL PRIMARY KEY
	,KishuMei TEXT NOT NULL
	,TanshukuKishuMei TEXT
	,Furigana TEXT
	,Seinengappi DATE
	,HatsuMenkyoNen INT
	,KishuTouzaiBetsu INT
	,KishuShozokuBasho INT
	,KishuShikakuKubun INT
	,MinaraiKubun INT
	,KishuShozokuKyuushaId INT
	,KishuShozokuKyuushaMei TEXT
	,TanshukuKyuushaMei TEXT
	,KyuushaShozokuBasho INT
	,KyuushaRitsuHokuNanBetsu INT
	,TourokuMasshouFlag INT
	,DataSakuseiNengappi DATE
);
CREATE UNIQUE INDEX UQ_Kishu ON Kishu(TanshukuKishuMei);

CREATE TABLE Kyuusha(
	Id INT NOT NULL PRIMARY KEY
	,KyuushaMei TEXT NOT NULL
	,TanshukuKyuushaMei TEXT
	,Furigana TEXT
	,Seinengappi DATE
	,HatsuMenkyoNen INT
	,KyuushaTouzaiBetsu INT
	,KyuushaShozokuBasho INT
	,KyuushaRitsuHokuNanBetsu INT
	,TourokuMasshouFlag INT
	,DataSakuseiNengappi DATE
);
CREATE UNIQUE INDEX UQ_Kyuusha ON Kyuusha(TanshukuKyuushaMei);
INSERT INTO Kyuusha
(
  Id
  ,KyuushaMei
  ,TanshukuKyuushaMei
)
VALUES
(
  0
  ,'フリー'
  ,'フリー'
);

CREATE TABLE Choukyou(
	Id BIGINT NOT NULL PRIMARY KEY REFERENCES Shussouba(Id) ON DELETE CASCADE
	,KyousoubaId TEXT NOT NULL
	,Tanpyou TEXT
	,HonsuuCourse INT
	,HonsuuHanro INT
	,HonsuuPool INT
	,Rating REAL
  ,KyuuyouRiyuu TEXT
);
CREATE INDEX IX_Choukyou ON Choukyou(KyousoubaId);

CREATE TABLE ChoukyouRireki(
	Id BIGINT NOT NULL PRIMARY KEY
	,ChoukyouId BIGINT NOT NULL REFERENCES Choukyou(Id) ON DELETE CASCADE
	,Oikiri INT
	,Kijousha TEXT
	,Nengappi DATE
	,Basho TEXT
	,ChoukyouCourse TEXT
	,ChoukyouBaba TEXT
	,Kaisuu INT
	,IchiDori INT
	,Ashiiro TEXT
	,Yajirushi INT
	,Reigai TEXT
	,Awase TEXT
);
CREATE INDEX IX_ChoukyouRireki ON ChoukyouRireki(ChoukyouId);

CREATE TABLE ChoukyouTime(
	Id BIGINT NOT NULL PRIMARY KEY
	,ChoukyouRirekiId BIGINT NOT NULL REFERENCES ChoukyouRireki(Id) ON DELETE CASCADE
	,F INT NOT NULL
	,Time REAL
	,Comment TEXT
);
CREATE INDEX UQ_ChoukyouTime ON ChoukyouTime(ChoukyouRirekiId, F);

CREATE TABLE ShussoubaTsuukaJuni(
	Id BIGINT NOT NULL PRIMARY KEY
	,ShussoubaId BIGINT NOT NULL REFERENCES Shussouba(Id) ON DELETE CASCADE
	,Bangou INT NOT NULL
	,Juni INT
	,Joukyou INT
);
CREATE INDEX UQ_ShussoubaTsuukaJuni ON ShussoubaTsuukaJuni(ShussoubaId, Bangou);

CREATE TABLE RaceHassouJoukyou(
	Id BIGINT NOT NULL PRIMARY KEY
	,RaceId BIGINT NOT NULL REFERENCES Race(Id) ON DELETE CASCADE
	,UmabanGun TEXT NOT NULL
	,HassouJoukyou TEXT NOT NULL
	,Ichi INT NOT NULL
	,Joukyou INT NOT NULL
	,FuriByousuu REAL
);
CREATE INDEX IX_RaceHassouJoukyou ON RaceHassouJoukyou(RaceId);

CREATE TABLE ShussoubaHassouJoukyou(
	Id BIGINT NOT NULL PRIMARY KEY
	,RaceHassouJoukyouId BIGINT NOT NULL REFERENCES RaceHassouJoukyou(Id) ON DELETE CASCADE
	,ShussoubaId BIGINT NOT NULL REFERENCES Shussouba(Id) ON DELETE CASCADE
);
CREATE INDEX IX_ShussoubaHassouJoukyou01 ON ShussoubaHassouJoukyou(RaceHassouJoukyouId);
CREATE INDEX IX_ShussoubaHassouJoukyou02 ON ShussoubaHassouJoukyou(ShussoubaId);

CREATE TABLE RaceKeika(
	Id BIGINT NOT NULL PRIMARY KEY
	,RaceId BIGINT NOT NULL REFERENCES Race(Id) ON DELETE CASCADE
	,Bangou INT NOT NULL
	,Keika TEXT NOT NULL
	,Midashi1 INT
	,Midashi2 INT
);
CREATE UNIQUE INDEX UQ_RaceKeika ON RaceKeika(RaceId, Bangou);

CREATE TABLE ShussoubaKeika(
	Id BIGINT NOT NULL PRIMARY KEY
	,RaceKeikaId BIGINT NOT NULL REFERENCES RaceKeika(Id) ON DELETE CASCADE
	,ShussoubaId BIGINT NOT NULL REFERENCES Shussouba(Id) ON DELETE CASCADE
	,Tate TEXT
	,Yoko TEXT
);
CREATE INDEX IX_ShussoubaKeika01 ON ShussoubaKeika(RaceKeikaId);
CREATE INDEX IX_ShussoubaKeika02 ON ShussoubaKeika(ShussoubaId);

CREATE TABLE Kyousouba(
	Id TEXT NOT NULL PRIMARY KEY
	,KanaBamei TEXT NOT NULL
	,KyuuBamei TEXT
	,Seinengappi DATE
	,Keiro INT
	,Kesshu INT
	,Sanchi INT
	,UmaKigou INT
	,Seibetsu INT
	,ChichiUmaId TEXT
	,ChichiUmaMei TEXT
	,HahaUmaId TEXT
	,HahaUmaMei TEXT
	,HahaChichiUmaId TEXT
	,HahaChichiUmaMei TEXT
	,HahaHahaUmaId TEXT
	,HahaHahaUmaMei TEXT
	,BanushiMei TEXT
	,TanshukuBanushiMei TEXT
	,SeisanshaMei TEXT
	,TanshukuSeisanshaMei TEXT
	,KyuushaId INT
	,KyuushaMei TEXT
	,TanshukuKyuushaMei TEXT
	,KyuushaShozokuBasho INT
	,KyuushaRitsuHokuNanBetsu INT
	,KoueiGaikokuKyuushaMei TEXT
	,MasshouFlag INT
	,MasshouNengappi DATE
	,Jiyuu TEXT
	,Ikisaki TEXT
	,ChichiKyoriTekisei INT
	,HirabaOmoKousetsu INT
	,HirabaDirtKousetsu INT
	,ShougaiOmoKousetsu INT
	,ShougaiDirtKousetsu INT
	,DataSakuseiNengappi DATE NOT NULL
);

CREATE TABLE ImportFile(
	Id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL
	,ImportDateTime DATETIME NOT NULL
	,FileName TEXT NOT NULL
	,FileSize BIGINT NOT NULL
	,MD5 TEXT NOT NULL
	,Status INT NOT NULL
);

CREATE TABLE ImportLog(
	Id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL
	,ImportFileId BIGINT NOT NULL REFERENCES ImportFile(Id) ON DELETE CASCADE
	,UncompressedFileName TEXT
	,TextIndex INT
	,TextSize INT
	,Message TEXT NOT NULL
	,DetailedMessage TEXT
);
CREATE INDEX IX_ImportLog ON ImportLog(ImportFileId);

CREATE TABLE Code(
	Domain TEXT NOT NULL
	,Key INT NOT NULL
	,Val TEXT NOT NULL
	,PRIMARY KEY(Domain, Key)
);
INSERT INTO "Code" VALUES('Basho',0,'京都');
INSERT INTO "Code" VALUES('Basho',1,'阪神');
INSERT INTO "Code" VALUES('Basho',2,'中京');
INSERT INTO "Code" VALUES('Basho',3,'小倉');
INSERT INTO "Code" VALUES('Basho',4,'東京');
INSERT INTO "Code" VALUES('Basho',5,'中山');
INSERT INTO "Code" VALUES('Basho',6,'福島');
INSERT INTO "Code" VALUES('Basho',7,'新潟');
INSERT INTO "Code" VALUES('Basho',8,'札幌');
INSERT INTO "Code" VALUES('Basho',9,'函館');
INSERT INTO "Code" VALUES('Basho',10,'大井');
INSERT INTO "Code" VALUES('Basho',11,'川崎');
INSERT INTO "Code" VALUES('Basho',12,'船橋');
INSERT INTO "Code" VALUES('Basho',13,'浦和');
INSERT INTO "Code" VALUES('Basho',14,'岩見');
INSERT INTO "Code" VALUES('Basho',15,'旭川');
INSERT INTO "Code" VALUES('Basho',16,'帯広');
INSERT INTO "Code" VALUES('Basho',17,'野田');
INSERT INTO "Code" VALUES('Basho',18,'北見');
INSERT INTO "Code" VALUES('Basho',19,'笠松');
INSERT INTO "Code" VALUES('Basho',20,'金沢');
INSERT INTO "Code" VALUES('Basho',21,'荒尾');
INSERT INTO "Code" VALUES('Basho',22,'宇都');
INSERT INTO "Code" VALUES('Basho',23,'佐賀');
INSERT INTO "Code" VALUES('Basho',24,'中津');
INSERT INTO "Code" VALUES('Basho',25,'高崎');
INSERT INTO "Code" VALUES('Basho',26,'高知');
INSERT INTO "Code" VALUES('Basho',27,'足利');
INSERT INTO "Code" VALUES('Basho',28,'上山');
INSERT INTO "Code" VALUES('Basho',29,'水沢');
INSERT INTO "Code" VALUES('Basho',30,'三条');
INSERT INTO "Code" VALUES('Basho',31,'紀井');
INSERT INTO "Code" VALUES('Basho',32,'益田');
INSERT INTO "Code" VALUES('Basho',33,'盛岡');
INSERT INTO "Code" VALUES('Basho',34,'名古');
INSERT INTO "Code" VALUES('Basho',35,'札幌');
INSERT INTO "Code" VALUES('Basho',36,'函館');
INSERT INTO "Code" VALUES('Basho',37,'園田');
INSERT INTO "Code" VALUES('Basho',38,'福山');
INSERT INTO "Code" VALUES('Basho',39,'姫路');
INSERT INTO "Code" VALUES('Basho',40,'中京');
INSERT INTO "Code" VALUES('Basho',41,'新潟');
INSERT INTO "Code" VALUES('Basho',42,'門別');
INSERT INTO "Code" VALUES('Basho',43,'弥富');
INSERT INTO "Code" VALUES('Basho',44,'小林');
INSERT INTO "Code" VALUES('Basho',45,'西脇');
INSERT INTO "Code" VALUES('Basho',46,'境町');
INSERT INTO "Code" VALUES('Basho',47,'小向');
INSERT INTO "Code" VALUES('Basho',50,'栗東');
INSERT INTO "Code" VALUES('Basho',51,'美浦南');
INSERT INTO "Code" VALUES('Basho',52,'美浦北');
INSERT INTO "Code" VALUES('Basho',53,'白井');
INSERT INTO "Code" VALUES('Basho',54,'道営');
INSERT INTO "Code" VALUES('Basho',55,'岩手');
INSERT INTO "Code" VALUES('Basho',56,'岩見');
INSERT INTO "Code" VALUES('Basho',57,'旭川');
INSERT INTO "Code" VALUES('Basho',58,'帯広');
INSERT INTO "Code" VALUES('Basho',59,'北見');
INSERT INTO "Code" VALUES('Basho',60,'香港');
INSERT INTO "Code" VALUES('Basho',61,'米国');
INSERT INTO "Code" VALUES('Basho',62,'英国');
INSERT INTO "Code" VALUES('Basho',63,'仏国');
INSERT INTO "Code" VALUES('Basho',64,'愛国');
INSERT INTO "Code" VALUES('Basho',65,'UAE');
INSERT INTO "Code" VALUES('Basho',66,'加国');
INSERT INTO "Code" VALUES('Basho',67,'伊国');
INSERT INTO "Code" VALUES('Basho',68,'独国');
INSERT INTO "Code" VALUES('Basho',69,'豪州');
INSERT INTO "Code" VALUES('Basho',70,'西独');
INSERT INTO "Code" VALUES('Basho',71,'新国');
INSERT INTO "Code" VALUES('Basho',72,'チリ');
INSERT INTO "Code" VALUES('Basho',73,'亜国');
INSERT INTO "Code" VALUES('Basho',74,'伯国');
INSERT INTO "Code" VALUES('Basho',75,'新嘉坡');
INSERT INTO "Code" VALUES('Basho',76,'瑞典');
INSERT INTO "Code" VALUES('Basho',77,'西班牙');
INSERT INTO "Code" VALUES('Basho',78,'瑞西');
INSERT INTO "Code" VALUES('Basho',79,'白耳義');
INSERT INTO "Code" VALUES('Basho',80,'マカオ');
INSERT INTO "Code" VALUES('Basho',81,'墺国');
INSERT INTO "Code" VALUES('Basho',90,'兵庫');
INSERT INTO "Code" VALUES('Basho',91,'栃木');
INSERT INTO "Code" VALUES('Basho',99,'北海');
INSERT INTO "Code" VALUES('Kyuujitsu',0,'平日');
INSERT INTO "Code" VALUES('Kyuujitsu',1,'祝日');
INSERT INTO "Code" VALUES('Kyuujitsu',2,'振替休日');
INSERT INTO "Code" VALUES('Kyuujitsu',3,'国民の休日');
INSERT INTO "Code" VALUES('Youbi',1,'土');
INSERT INTO "Code" VALUES('Youbi',2,'日');
INSERT INTO "Code" VALUES('Youbi',3,'月');
INSERT INTO "Code" VALUES('Youbi',4,'火');
INSERT INTO "Code" VALUES('Youbi',5,'水');
INSERT INTO "Code" VALUES('Youbi',6,'木');
INSERT INTO "Code" VALUES('Youbi',7,'金');
INSERT INTO "Code" VALUES('KouryuuFlag',1,'交流');
INSERT INTO "Code" VALUES('ChuuouChihouGaikoku',0,'中央');
INSERT INTO "Code" VALUES('ChuuouChihouGaikoku',1,'南関東');
INSERT INTO "Code" VALUES('ChuuouChihouGaikoku',2,'公営');
INSERT INTO "Code" VALUES('ChuuouChihouGaikoku',3,'道営');
INSERT INTO "Code" VALUES('ChuuouChihouGaikoku',4,'外国');
INSERT INTO "Code" VALUES('IppanTokubetsu',0,'一般');
INSERT INTO "Code" VALUES('IppanTokubetsu',1,'特別');
INSERT INTO "Code" VALUES('IppanTokubetsu',2,'準重賞');
INSERT INTO "Code" VALUES('IppanTokubetsu',3,'重賞');
INSERT INTO "Code" VALUES('HeichiShougai',0,'平地');
INSERT INTO "Code" VALUES('HeichiShougai',1,'障害');
INSERT INTO "Code" VALUES('Grade',0,'G1');
INSERT INTO "Code" VALUES('Grade',1,'G2');
INSERT INTO "Code" VALUES('Grade',2,'G3');
INSERT INTO "Code" VALUES('Grade',3,'JG1');
INSERT INTO "Code" VALUES('Grade',4,'JG2');
INSERT INTO "Code" VALUES('Grade',5,'JG3');
INSERT INTO "Code" VALUES('BetteiBareiHandi',0,'別定');
INSERT INTO "Code" VALUES('BetteiBareiHandi',1,'馬齢');
INSERT INTO "Code" VALUES('BetteiBareiHandi',2,'ハンデ');
INSERT INTO "Code" VALUES('BetteiBareiHandi',3,'定量');
INSERT INTO "Code" VALUES('BetteiBareiHandi',90,'規定');
INSERT INTO "Code" VALUES('JoukenFuka1',0,'勝入');
INSERT INTO "Code" VALUES('JoukenFuka1',1,'九州産馬');
INSERT INTO "Code" VALUES('JoukenFuka1',2,'内国');
INSERT INTO "Code" VALUES('JoukenFuka1',3,'牝');
INSERT INTO "Code" VALUES('JoukenFuka1',4,'○混');
INSERT INTO "Code" VALUES('JoukenFuka1',5,'○父');
INSERT INTO "Code" VALUES('JoukenFuka1',6,'○抽');
INSERT INTO "Code" VALUES('JoukenFuka1',7,'○市○抽');
INSERT INTO "Code" VALUES('JoukenFuka1',8,'○混勝入');
INSERT INTO "Code" VALUES('JoukenFuka1',9,'□抽');
INSERT INTO "Code" VALUES('JoukenFuka1',10,'○混牝');
INSERT INTO "Code" VALUES('JoukenFuka1',11,'○市');
INSERT INTO "Code" VALUES('JoukenFuka1',12,'○招');
INSERT INTO "Code" VALUES('JoukenFuka1',13,'○混○指');
INSERT INTO "Code" VALUES('JoukenFuka1',14,'○抽勝入');
INSERT INTO "Code" VALUES('JoukenFuka1',15,'○抽関西配布馬');
INSERT INTO "Code" VALUES('JoukenFuka1',16,'○抽関東配布馬');
INSERT INTO "Code" VALUES('JoukenFuka1',17,'□抽関西配布馬');
INSERT INTO "Code" VALUES('JoukenFuka1',18,'□抽関東配布馬');
INSERT INTO "Code" VALUES('JoukenFuka1',19,'○市○抽関西配布馬');
INSERT INTO "Code" VALUES('JoukenFuka1',20,'○市○抽関東配布馬');
INSERT INTO "Code" VALUES('JoukenFuka1',21,'○指');
INSERT INTO "Code" VALUES('JoukenFuka1',22,'芦毛');
INSERT INTO "Code" VALUES('JoukenFuka1',23,'栗毛');
INSERT INTO "Code" VALUES('JoukenFuka1',24,'牡');
INSERT INTO "Code" VALUES('JoukenFuka1',25,'交流');
INSERT INTO "Code" VALUES('JoukenFuka1',26,'千葉産');
INSERT INTO "Code" VALUES('JoukenFuka1',27,'○混牡せん馬');
INSERT INTO "Code" VALUES('JoukenFuka1',28,'牡せん馬');
INSERT INTO "Code" VALUES('JoukenFuka1',29,'国際');
INSERT INTO "Code" VALUES('JoukenFuka1',30,'○指定');
INSERT INTO "Code" VALUES('JoukenFuka1',31,'○特指');
INSERT INTO "Code" VALUES('JoukenFuka1',32,'□指定');
INSERT INTO "Code" VALUES('JoukenFuka1',33,'牡・牝');
INSERT INTO "Code" VALUES('JoukenFuka1',34,'JRA認定');
INSERT INTO "Code" VALUES('JoukenFuka1',35,'牝馬○国際');
INSERT INTO "Code" VALUES('JoukenFuka1',36,'芦・白');
INSERT INTO "Code" VALUES('JoukenFuka1',37,'黒鹿毛');
INSERT INTO "Code" VALUES('JoukenFuka1',38,'○混牡・牝');
INSERT INTO "Code" VALUES('JoukenFuka1',39,'JRA指定');
INSERT INTO "Code" VALUES('JoukenFuka1',40,'○国際牡・牝');
INSERT INTO "Code" VALUES('JoukenFuka2',1,'○指定');
INSERT INTO "Code" VALUES('JoukenFuka2',2,'○特指');
INSERT INTO "Code" VALUES('JoukenFuka2',3,'□指定');
INSERT INTO "Code" VALUES('JoukenFuka2',4,'○指');
INSERT INTO "Code" VALUES('JoukenKei',0,'サラ系');
INSERT INTO "Code" VALUES('JoukenKei',1,'アラブ系');
INSERT INTO "Code" VALUES('JoukenNenreiSeigen',0,'2歳');
INSERT INTO "Code" VALUES('JoukenNenreiSeigen',1,'3歳');
INSERT INTO "Code" VALUES('JoukenNenreiSeigen',2,'4歳');
INSERT INTO "Code" VALUES('JoukenNenreiSeigen',3,'3,4,5歳');
INSERT INTO "Code" VALUES('JoukenNenreiSeigen',4,'4,5,6歳');
INSERT INTO "Code" VALUES('JoukenNenreiSeigen',5,'3歳以上');
INSERT INTO "Code" VALUES('JoukenNenreiSeigen',6,'4歳以上');
INSERT INTO "Code" VALUES('JoukenNenreiSeigen',7,'3,4歳');
INSERT INTO "Code" VALUES('JoukenNenreiSeigen',8,'4,5歳');
INSERT INTO "Code" VALUES('JoukenNenreiSeigen',9,'なし');
INSERT INTO "Code" VALUES('Jouken',0,'未受');
INSERT INTO "Code" VALUES('Jouken',1,'新馬');
INSERT INTO "Code" VALUES('Jouken',2,'未出走');
INSERT INTO "Code" VALUES('Jouken',3,'未勝利');
INSERT INTO "Code" VALUES('Jouken',4,'オープン');
INSERT INTO "Code" VALUES('Jouken',5,'オープン,牝馬');
INSERT INTO "Code" VALUES('Jouken',6,'指定馬');
INSERT INTO "Code" VALUES('Jouken',7,'勝入オープン');
INSERT INTO "Code" VALUES('Jouken',8,'牝馬');
INSERT INTO "Code" VALUES('Jouken',9,'オーブン,牝馬,アラブ混合');
INSERT INTO "Code" VALUES('Jouken',10,'A');
INSERT INTO "Code" VALUES('Jouken',11,'A1');
INSERT INTO "Code" VALUES('Jouken',12,'A2');
INSERT INTO "Code" VALUES('Jouken',13,'A3');
INSERT INTO "Code" VALUES('Jouken',14,'A4');
INSERT INTO "Code" VALUES('Jouken',20,'B');
INSERT INTO "Code" VALUES('Jouken',21,'B1');
INSERT INTO "Code" VALUES('Jouken',22,'B2');
INSERT INTO "Code" VALUES('Jouken',23,'B3');
INSERT INTO "Code" VALUES('Jouken',24,'B4');
INSERT INTO "Code" VALUES('Jouken',30,'C');
INSERT INTO "Code" VALUES('Jouken',31,'C1');
INSERT INTO "Code" VALUES('Jouken',32,'C2');
INSERT INTO "Code" VALUES('Jouken',33,'C3');
INSERT INTO "Code" VALUES('Jouken',34,'C4');
INSERT INTO "Code" VALUES('Jouken',40,'D');
INSERT INTO "Code" VALUES('Jouken',41,'D1');
INSERT INTO "Code" VALUES('Jouken',42,'D2');
INSERT INTO "Code" VALUES('Jouken',43,'D3');
INSERT INTO "Code" VALUES('Jouken',44,'D4');
INSERT INTO "Code" VALUES('Jouken',93,'調教試験');
INSERT INTO "Code" VALUES('Jouken',94,'能力試験');
INSERT INTO "Code" VALUES('Jouken',5000,'500万');
INSERT INTO "Code" VALUES('Jouken',9000,'900万');
INSERT INTO "Code" VALUES('Jouken',10000,'1000万');
INSERT INTO "Code" VALUES('Jouken',15000,'1500万');
INSERT INTO "Code" VALUES('Jouken',16000,'1600万');
INSERT INTO "Code" VALUES('Jouken',-13,'未出');
INSERT INTO "Code" VALUES('Jouken',-14,'未勝');
INSERT INTO "Code" VALUES('Jouken',-15,'新馬');
INSERT INTO "Code" VALUES('Jouken',-16,'オープン');
INSERT INTO "Code" VALUES('Jouken',-42,'3才');
INSERT INTO "Code" VALUES('Jouken',-43,'4才');
INSERT INTO "Code" VALUES('Jouken',-44,'能検');
INSERT INTO "Code" VALUES('Jouken',-50,'未受');
INSERT INTO "Code" VALUES('Jouken',-51,'GⅠ');
INSERT INTO "Code" VALUES('Jouken',-52,'GⅡ');
INSERT INTO "Code" VALUES('Jouken',-53,'GⅢ');
INSERT INTO "Code" VALUES('Jouken',-54,'GⅣ');
INSERT INTO "Code" VALUES('Jouken',-55,'GⅤ');
INSERT INTO "Code" VALUES('Jouken',-56,'5才');
INSERT INTO "Code" VALUES('Jouken',-57,'C5');
INSERT INTO "Code" VALUES('Jouken',-58,'C6');
INSERT INTO "Code" VALUES('Jouken',-59,'2才');
INSERT INTO "Code" VALUES('Jouken',-60,'認初出');
INSERT INTO "Code" VALUES('Jouken',-61,'認未勝');
INSERT INTO "Code" VALUES('Jouken',-62,'認定');
INSERT INTO "Code" VALUES('Jouken',-63,'サラ');
INSERT INTO "Code" VALUES('Jouken',-64,'E');
INSERT INTO "Code" VALUES('Jouken',-65,'F');
INSERT INTO "Code" VALUES('IjouIkaMiman',0,'以上');
INSERT INTO "Code" VALUES('IjouIkaMiman',1,'以下');
INSERT INTO "Code" VALUES('IjouIkaMiman',2,'〜');
INSERT INTO "Code" VALUES('IjouIkaMiman',3,'未満');
INSERT INTO "Code" VALUES('IjouIkaMiman',4,'・');
INSERT INTO "Code" VALUES('IjouIkaMiman',5,'以上');
INSERT INTO "Code" VALUES('IjouIkaMiman',6,'以下');
INSERT INTO "Code" VALUES('IjouIkaMiman',7,'未満');
INSERT INTO "Code" VALUES('DirtShiba',0,'ダート');
INSERT INTO "Code" VALUES('DirtShiba',1,'芝');
INSERT INTO "Code" VALUES('MigiHidari',0,'右');
INSERT INTO "Code" VALUES('MigiHidari',1,'左');
INSERT INTO "Code" VALUES('MigiHidari',2,'直線');
INSERT INTO "Code" VALUES('UchiSoto',0,'内');
INSERT INTO "Code" VALUES('UchiSoto',1,'外');
INSERT INTO "Code" VALUES('UchiSoto',2,'外→内');
INSERT INTO "Code" VALUES('UchiSoto',3,'タヌキ');
INSERT INTO "Code" VALUES('UchiSoto',4,'大障害');
INSERT INTO "Code" VALUES('UchiSoto',5,'内2周');
INSERT INTO "Code" VALUES('UchiSoto',6,'内→外');
INSERT INTO "Code" VALUES('Course',0,'A');
INSERT INTO "Code" VALUES('Course',1,'B');
INSERT INTO "Code" VALUES('Course',2,'C');
INSERT INTO "Code" VALUES('Course',3,'D');
INSERT INTO "Code" VALUES('Course',4,'A1');
INSERT INTO "Code" VALUES('Course',5,'A2');
INSERT INTO "Code" VALUES('RecordFlag',0,'基準');
INSERT INTO "Code" VALUES('RecordFlag',1,'レコード');
INSERT INTO "Code" VALUES('RecordFlag',2,'参考');
INSERT INTO "Code" VALUES('MaeuriFlag',1,'前売り');
INSERT INTO "Code" VALUES('Pace',0,'H');
INSERT INTO "Code" VALUES('Pace',1,'M');
INSERT INTO "Code" VALUES('Pace',2,'S');
INSERT INTO "Code" VALUES('Tenki',0,'晴');
INSERT INTO "Code" VALUES('Tenki',1,'曇');
INSERT INTO "Code" VALUES('Tenki',2,'雨');
INSERT INTO "Code" VALUES('Tenki',3,'小雨');
INSERT INTO "Code" VALUES('Tenki',4,'雪');
INSERT INTO "Code" VALUES('Tenki',5,'風');
INSERT INTO "Code" VALUES('Tenki',6,'小雪');
INSERT INTO "Code" VALUES('Baba',0,'良');
INSERT INTO "Code" VALUES('Baba',1,'稍重');
INSERT INTO "Code" VALUES('Baba',2,'重');
INSERT INTO "Code" VALUES('Baba',3,'不良');
INSERT INTO "Code" VALUES('Seed',1,'シード');
INSERT INTO "Code" VALUES('Midashi1',1,'逆');
INSERT INTO "Code" VALUES('Midashi1',2,'1周');
INSERT INTO "Code" VALUES('Midashi1',3,'逆1周');
INSERT INTO "Code" VALUES('Midashi1',4,'2周');
INSERT INTO "Code" VALUES('Midashi2',0,'スタンド前');
INSERT INTO "Code" VALUES('Midashi2',1,'向正面');
INSERT INTO "Code" VALUES('Midashi2',2,'2角');
INSERT INTO "Code" VALUES('Midashi2',3,'3角');
INSERT INTO "Code" VALUES('Midashi2',4,'4角 ');
INSERT INTO "Code" VALUES('Midashi2',5,'タヌキ');
INSERT INTO "Code" VALUES('Midashi2',6,'バンケット');
INSERT INTO "Code" VALUES('Midashi2',7,'水濠');
INSERT INTO "Code" VALUES('Midashi2',8,'大竹柵');
INSERT INTO "Code" VALUES('Midashi2',9,'大土塁');
INSERT INTO "Code" VALUES('Midashi2',10,'赤レンガ');
INSERT INTO "Code" VALUES('Midashi2',11,'発馬');
INSERT INTO "Code" VALUES('Midashi2',12,'1角');
INSERT INTO "Code" VALUES('Midashi2',13,'大いけ垣');
INSERT INTO "Code" VALUES('Midashi2',14,'3F');
INSERT INTO "Code" VALUES('UmaKigou',1,'○抽');
INSERT INTO "Code" VALUES('UmaKigou',2,'□抽');
INSERT INTO "Code" VALUES('UmaKigou',3,'○父');
INSERT INTO "Code" VALUES('UmaKigou',4,'○市');
INSERT INTO "Code" VALUES('UmaKigou',5,'○地');
INSERT INTO "Code" VALUES('UmaKigou',6,'○外');
INSERT INTO "Code" VALUES('UmaKigou',7,'○父○抽');
INSERT INTO "Code" VALUES('UmaKigou',8,'○父○市');
INSERT INTO "Code" VALUES('UmaKigou',9,'○父○地');
INSERT INTO "Code" VALUES('UmaKigou',10,'○市○地');
INSERT INTO "Code" VALUES('UmaKigou',11,'○外○地');
INSERT INTO "Code" VALUES('UmaKigou',12,'○父○市○地');
INSERT INTO "Code" VALUES('UmaKigou',15,'○招');
INSERT INTO "Code" VALUES('UmaKigou',16,'○招○外');
INSERT INTO "Code" VALUES('UmaKigou',17,'○招○父');
INSERT INTO "Code" VALUES('UmaKigou',18,'○招○市');
INSERT INTO "Code" VALUES('UmaKigou',19,'○招○父○市');
INSERT INTO "Code" VALUES('UmaKigou',20,'○父○外');
INSERT INTO "Code" VALUES('UmaKigou',21,'□地');
INSERT INTO "Code" VALUES('UmaKigou',22,'○外□地');
INSERT INTO "Code" VALUES('UmaKigou',23,'○父□地');
INSERT INTO "Code" VALUES('UmaKigou',24,'○市□地');
INSERT INTO "Code" VALUES('UmaKigou',25,'○父○市□地');
INSERT INTO "Code" VALUES('UmaKigou',26,'□外');
INSERT INTO "Code" VALUES('UmaKigou',27,'○父□外');
INSERT INTO "Code" VALUES('UmaKigou',40,'○父○外○地');
INSERT INTO "Code" VALUES('UmaKigou',41,'○父○外□地');
INSERT INTO "Code" VALUES('Seibetsu',0,'牡');
INSERT INTO "Code" VALUES('Seibetsu',1,'牝');
INSERT INTO "Code" VALUES('Seibetsu',2,'せん');
INSERT INTO "Code" VALUES('Blinker',1,'ブリンカー');
INSERT INTO "Code" VALUES('KishuTouzaiBetsu',1,'西');
INSERT INTO "Code" VALUES('KishuTouzaiBetsu',2,'東');
INSERT INTO "Code" VALUES('KishuTouzaiBetsu',3,'招待');
INSERT INTO "Code" VALUES('KyuushaTouzaiBetsu',1,'西');
INSERT INTO "Code" VALUES('KyuushaTouzaiBetsu',2,'東');
INSERT INTO "Code" VALUES('MinaraiKubun',1,'1kg減');
INSERT INTO "Code" VALUES('MinaraiKubun',2,'2kg減');
INSERT INTO "Code" VALUES('MinaraiKubun',3,'3kg減');
INSERT INTO "Code" VALUES('Norikawari',1,'乗り替り');
INSERT INTO "Code" VALUES('KyuushaRitsuHokuNanBetsu',1,'栗東');
INSERT INTO "Code" VALUES('KyuushaRitsuHokuNanBetsu',2,'美浦南');
INSERT INTO "Code" VALUES('KyuushaRitsuHokuNanBetsu',3,'美浦北');
INSERT INTO "Code" VALUES('Yosou',0,'◎');
INSERT INTO "Code" VALUES('Yosou',1,'○');
INSERT INTO "Code" VALUES('Yosou',2,'▲');
INSERT INTO "Code" VALUES('Yosou',3,'△');
INSERT INTO "Code" VALUES('Yosou',4,'×');
INSERT INTO "Code" VALUES('ChakujunFuka',31,'落馬');
INSERT INTO "Code" VALUES('ChakujunFuka',32,'失格');
INSERT INTO "Code" VALUES('ChakujunFuka',33,'中止');
INSERT INTO "Code" VALUES('ChakujunFuka',34,'取消');
INSERT INTO "Code" VALUES('ChakujunFuka',35,'除外');
INSERT INTO "Code" VALUES('ChakujunFuka',36,'降着');
INSERT INTO "Code" VALUES('ChakujunFuka',37,'繰上');
INSERT INTO "Code" VALUES('ChakujunFuka',40,'不利');
INSERT INTO "Code" VALUES('TorikeshiShubetsu',1,'出走取消');
INSERT INTO "Code" VALUES('TorikeshiShubetsu',2,'出走除外');
INSERT INTO "Code" VALUES('TorikeshiShubetsu',3,'競走除外');
INSERT INTO "Code" VALUES('TorikeshiShubetsu',4,'競走中止');
INSERT INTO "Code" VALUES('TorikeshiShubetsu',5,'放馬');
INSERT INTO "Code" VALUES('TorikeshiShubetsu',6,'発走除外');
INSERT INTO "Code" VALUES('Chakusa2',0,'ハナ');
INSERT INTO "Code" VALUES('Chakusa2',1,'アタマ');
INSERT INTO "Code" VALUES('Chakusa2',2,'クビ');
INSERT INTO "Code" VALUES('Chakusa2',3,'1/2');
INSERT INTO "Code" VALUES('Chakusa2',4,'1/4');
INSERT INTO "Code" VALUES('Chakusa2',5,'3/4');
INSERT INTO "Code" VALUES('Chakusa2',7,'大差');
INSERT INTO "Code" VALUES('Chakusa2',8,'同着');
INSERT INTO "Code" VALUES('YonCornerIchiDori',0,'最内');
INSERT INTO "Code" VALUES('YonCornerIchiDori',1,'内');
INSERT INTO "Code" VALUES('YonCornerIchiDori',2,'中');
INSERT INTO "Code" VALUES('YonCornerIchiDori',3,'外');
INSERT INTO "Code" VALUES('YonCornerIchiDori',4,'大外');
INSERT INTO "Code" VALUES('Oikiri',0,'前回');
INSERT INTO "Code" VALUES('Oikiri',1,'追切り');
INSERT INTO "Code" VALUES('AwaseFlag',1,'調教1の併せ');
INSERT INTO "Code" VALUES('AwaseFlag',2,'調教2の併せ');
INSERT INTO "Code" VALUES('AwaseFlag',3,'調教3の併せ');
INSERT INTO "Code" VALUES('Yajirushi',1,'一変');
INSERT INTO "Code" VALUES('Yajirushi',2,'平行');
INSERT INTO "Code" VALUES('Yajirushi',3,'下降');
INSERT INTO "Code" VALUES('Yajirushi',4,'良化');
INSERT INTO "Code" VALUES('Yajirushi',5,'下降気味');
INSERT INTO "Code" VALUES('Ichi',1,'スタート');
INSERT INTO "Code" VALUES('Ichi',2,'直線');
INSERT INTO "Code" VALUES('Ichi',3,'コーナ');
INSERT INTO "Code" VALUES('Ichi',4,'障害');
INSERT INTO "Code" VALUES('Ichi',5,'道中');
INSERT INTO "Code" VALUES('Joukyou',31,'落馬');
INSERT INTO "Code" VALUES('Joukyou',33,'中止');
INSERT INTO "Code" VALUES('Joukyou',40,'不利');
INSERT INTO "Code" VALUES('Joukyou',41,'出遅れ');
INSERT INTO "Code" VALUES('Joukyou',42,'外枠発走');
INSERT INTO "Code" VALUES('Joukyou',43,'斜行');
INSERT INTO "Code" VALUES('Joukyou',50,'好発');
INSERT INTO "Code" VALUES('Keiro',1,'栗');
INSERT INTO "Code" VALUES('Keiro',2,'栃栗');
INSERT INTO "Code" VALUES('Keiro',3,'鹿');
INSERT INTO "Code" VALUES('Keiro',4,'黒鹿');
INSERT INTO "Code" VALUES('Keiro',5,'青鹿');
INSERT INTO "Code" VALUES('Keiro',6,'青');
INSERT INTO "Code" VALUES('Keiro',7,'芦');
INSERT INTO "Code" VALUES('Keiro',8,'栗粕');
INSERT INTO "Code" VALUES('Keiro',9,'鹿粕');
INSERT INTO "Code" VALUES('Keiro',10,'青粕');
INSERT INTO "Code" VALUES('Keiro',11,'白');
INSERT INTO "Code" VALUES('Keiro',12,'芦鹿');
INSERT INTO "Code" VALUES('Keiro',13,'粕');
INSERT INTO "Code" VALUES('Keiro',20,'黒鹿');
INSERT INTO "Code" VALUES('Keiro',21,'芦');
INSERT INTO "Code" VALUES('Keiro',22,'芦');
INSERT INTO "Code" VALUES('Keiro',23,'鹿');
INSERT INTO "Code" VALUES('Keiro',24,'黒鹿');
INSERT INTO "Code" VALUES('Keiro',25,'芦');
INSERT INTO "Code" VALUES('Keiro',26,'芦');
INSERT INTO "Code" VALUES('Keiro',27,'芦');
INSERT INTO "Code" VALUES('Keiro',28,'鹿');
INSERT INTO "Code" VALUES('Keiro',29,'芦');
INSERT INTO "Code" VALUES('Keiro',30,'鹿');
INSERT INTO "Code" VALUES('Keiro',31,'黒鹿');
INSERT INTO "Code" VALUES('Keiro',32,'黒鹿');
INSERT INTO "Code" VALUES('Keiro',33,'黒鹿');
INSERT INTO "Code" VALUES('Keiro',34,'黒鹿');
INSERT INTO "Code" VALUES('Keiro',35,'黒鹿');
INSERT INTO "Code" VALUES('Kesshu',1,'サラ');
INSERT INTO "Code" VALUES('Kesshu',2,'アラ');
INSERT INTO "Code" VALUES('Kesshu',3,'アア');
INSERT INTO "Code" VALUES('Kesshu',4,'サラ系');
INSERT INTO "Code" VALUES('Kesshu',5,'アラ系');
INSERT INTO "Code" VALUES('Kesshu',7,'軽半');
INSERT INTO "Code" VALUES('Kesshu',8,'中半');
INSERT INTO "Code" VALUES('Kesshu',10,'重半');
INSERT INTO "Code" VALUES('Kesshu',11,'アノ');
INSERT INTO "Code" VALUES('Kesshu',12,'アノ系');
INSERT INTO "Code" VALUES('Kesshu',13,'クリ');
INSERT INTO "Code" VALUES('Kesshu',14,'クリ系');
INSERT INTO "Code" VALUES('Kesshu',15,'トロ');
INSERT INTO "Code" VALUES('Kesshu',16,'トロ系');
INSERT INTO "Code" VALUES('Kesshu',17,'ノニ');
INSERT INTO "Code" VALUES('Kesshu',18,'ノニ系');
INSERT INTO "Code" VALUES('Kesshu',19,'ハク');
INSERT INTO "Code" VALUES('Kesshu',20,'ハク系');
INSERT INTO "Code" VALUES('Kesshu',50,'サラ系');
INSERT INTO "Code" VALUES('Sanchi',0,'北檜山');
INSERT INTO "Code" VALUES('Sanchi',1,'えりも');
INSERT INTO "Code" VALUES('Sanchi',2,'様似');
INSERT INTO "Code" VALUES('Sanchi',3,'浦河');
INSERT INTO "Code" VALUES('Sanchi',4,'三石');
INSERT INTO "Code" VALUES('Sanchi',5,'静内');
INSERT INTO "Code" VALUES('Sanchi',6,'新冠');
INSERT INTO "Code" VALUES('Sanchi',7,'門別');
INSERT INTO "Code" VALUES('Sanchi',8,'平取');
INSERT INTO "Code" VALUES('Sanchi',9,'鵡川');
INSERT INTO "Code" VALUES('Sanchi',10,'早来');
INSERT INTO "Code" VALUES('Sanchi',11,'白老');
INSERT INTO "Code" VALUES('Sanchi',12,'室蘭');
INSERT INTO "Code" VALUES('Sanchi',13,'伊達');
INSERT INTO "Code" VALUES('Sanchi',14,'虻田');
INSERT INTO "Code" VALUES('Sanchi',15,'幕別');
INSERT INTO "Code" VALUES('Sanchi',16,'厚真');
INSERT INTO "Code" VALUES('Sanchi',17,'網走');
INSERT INTO "Code" VALUES('Sanchi',18,'池田');
INSERT INTO "Code" VALUES('Sanchi',19,'有珠');
INSERT INTO "Code" VALUES('Sanchi',20,'浦幌');
INSERT INTO "Code" VALUES('Sanchi',21,'恵庭');
INSERT INTO "Code" VALUES('Sanchi',22,'江別');
INSERT INTO "Code" VALUES('Sanchi',23,'追別');
INSERT INTO "Code" VALUES('Sanchi',24,'長万部');
INSERT INTO "Code" VALUES('Sanchi',25,'音更');
INSERT INTO "Code" VALUES('Sanchi',26,'音別');
INSERT INTO "Code" VALUES('Sanchi',27,'帯広');
INSERT INTO "Code" VALUES('Sanchi',28,'河西');
INSERT INTO "Code" VALUES('Sanchi',29,'釧路');
INSERT INTO "Code" VALUES('Sanchi',30,'栗山');
INSERT INTO "Code" VALUES('Sanchi',31,'小清水');
INSERT INTO "Code" VALUES('Sanchi',32,'札幌');
INSERT INTO "Code" VALUES('Sanchi',33,'鹿追');
INSERT INTO "Code" VALUES('Sanchi',34,'清水');
INSERT INTO "Code" VALUES('Sanchi',35,'標茶');
INSERT INTO "Code" VALUES('Sanchi',36,'白糠');
INSERT INTO "Code" VALUES('Sanchi',37,'新得');
INSERT INTO "Code" VALUES('Sanchi',38,'大樹');
INSERT INTO "Code" VALUES('Sanchi',39,'鷹栖');
INSERT INTO "Code" VALUES('Sanchi',40,'千歳');
INSERT INTO "Code" VALUES('Sanchi',41,'忠類');
INSERT INTO "Code" VALUES('Sanchi',42,'士幌');
INSERT INTO "Code" VALUES('Sanchi',43,'弟子屈');
INSERT INTO "Code" VALUES('Sanchi',44,'苫小牧');
INSERT INTO "Code" VALUES('Sanchi',45,'豊浦');
INSERT INTO "Code" VALUES('Sanchi',46,'豊頃');
INSERT INTO "Code" VALUES('Sanchi',47,'根室');
INSERT INTO "Code" VALUES('Sanchi',48,'登別');
INSERT INTO "Code" VALUES('Sanchi',49,'函館');
INSERT INTO "Code" VALUES('Sanchi',50,'浜中');
INSERT INTO "Code" VALUES('Sanchi',51,'広尾');
INSERT INTO "Code" VALUES('Sanchi',52,'深川');
INSERT INTO "Code" VALUES('Sanchi',53,'穂別');
INSERT INTO "Code" VALUES('Sanchi',54,'本別');
INSERT INTO "Code" VALUES('Sanchi',55,'森');
INSERT INTO "Code" VALUES('Sanchi',56,'八雲');
INSERT INTO "Code" VALUES('Sanchi',57,'青森');
INSERT INTO "Code" VALUES('Sanchi',58,'岩手');
INSERT INTO "Code" VALUES('Sanchi',59,'宮城');
INSERT INTO "Code" VALUES('Sanchi',60,'山形');
INSERT INTO "Code" VALUES('Sanchi',61,'福島');
INSERT INTO "Code" VALUES('Sanchi',62,'栃木');
INSERT INTO "Code" VALUES('Sanchi',63,'群馬');
INSERT INTO "Code" VALUES('Sanchi',64,'埼玉');
INSERT INTO "Code" VALUES('Sanchi',65,'茨城');
INSERT INTO "Code" VALUES('Sanchi',66,'千葉');
INSERT INTO "Code" VALUES('Sanchi',67,'長野');
INSERT INTO "Code" VALUES('Sanchi',68,'京都');
INSERT INTO "Code" VALUES('Sanchi',69,'高知');
INSERT INTO "Code" VALUES('Sanchi',70,'宮崎');
INSERT INTO "Code" VALUES('Sanchi',71,'鹿児島');
INSERT INTO "Code" VALUES('Sanchi',72,'熊本');
INSERT INTO "Code" VALUES('Sanchi',73,'米国');
INSERT INTO "Code" VALUES('Sanchi',74,'英国');
INSERT INTO "Code" VALUES('Sanchi',75,'愛国');
INSERT INTO "Code" VALUES('Sanchi',76,'仏国');
INSERT INTO "Code" VALUES('Sanchi',77,'伊国');
INSERT INTO "Code" VALUES('Sanchi',78,'独国');
INSERT INTO "Code" VALUES('Sanchi',79,'カナダ');
INSERT INTO "Code" VALUES('Sanchi',80,'新国');
INSERT INTO "Code" VALUES('Sanchi',81,'豪州');
INSERT INTO "Code" VALUES('Sanchi',82,'洞爺');
INSERT INTO "Code" VALUES('Sanchi',83,'七飯');
INSERT INTO "Code" VALUES('Sanchi',84,'上ノ国');
INSERT INTO "Code" VALUES('Sanchi',85,'亜国');
INSERT INTO "Code" VALUES('Sanchi',86,'白国');
INSERT INTO "Code" VALUES('Sanchi',87,'瑞国');
INSERT INTO "Code" VALUES('Sanchi',88,'壮瞥');
INSERT INTO "Code" VALUES('Sanchi',89,'砂原');
INSERT INTO "Code" VALUES('Sanchi',90,'足寄');
INSERT INTO "Code" VALUES('Sanchi',91,'別海');
INSERT INTO "Code" VALUES('Sanchi',92,'東京');
INSERT INTO "Code" VALUES('Sanchi',93,'神奈川');
INSERT INTO "Code" VALUES('Sanchi',94,'兵庫');
INSERT INTO "Code" VALUES('Sanchi',95,'佐賀');
INSERT INTO "Code" VALUES('Sanchi',96,'日高');
INSERT INTO "Code" VALUES('Sanchi',97,'南郷');
INSERT INTO "Code" VALUES('Sanchi',98,'更別');
INSERT INTO "Code" VALUES('Sanchi',99,'チリ');
INSERT INTO "Code" VALUES('Sanchi',100,'遠別');
INSERT INTO "Code" VALUES('Sanchi',101,'芽室');
INSERT INTO "Code" VALUES('Sanchi',102,'中標津');
INSERT INTO "Code" VALUES('Sanchi',103,'山梨');
INSERT INTO "Code" VALUES('Sanchi',104,'伯国');
INSERT INTO "Code" VALUES('Sanchi',105,'今金');
INSERT INTO "Code" VALUES('Sanchi',106,'厚岸');
INSERT INTO "Code" VALUES('Sanchi',107,'東久留');
INSERT INTO "Code" VALUES('Sanchi',108,'標津');
INSERT INTO "Code" VALUES('Sanchi',109,'大分');
INSERT INTO "Code" VALUES('Sanchi',110,'静岡');
INSERT INTO "Code" VALUES('Sanchi',111,'由仁');
INSERT INTO "Code" VALUES('Sanchi',112,'木古内');
INSERT INTO "Code" VALUES('Sanchi',113,'幌泉');
INSERT INTO "Code" VALUES('Sanchi',114,'比国');
INSERT INTO "Code" VALUES('Sanchi',115,'星国');
INSERT INTO "Code" VALUES('Sanchi',116,'ＵＡＥ');
INSERT INTO "Code" VALUES('Sanchi',117,'広島');
INSERT INTO "Code" VALUES('Sanchi',118,'南ア国');
INSERT INTO "Code" VALUES('Sanchi',119,'むかわ');
INSERT INTO "Code" VALUES('Sanchi',120,'安平');
INSERT INTO "Code" VALUES('Sanchi',121,'新ひだか');
INSERT INTO "Code" VALUES('Sanchi',122,'洞爺湖');
INSERT INTO "Code" VALUES('Sanchi',123,'露国');
INSERT INTO "Code" VALUES('Sanchi',124,'秋田');
INSERT INTO "Code" VALUES('Sanchi',200,'アルジ');
INSERT INTO "Code" VALUES('Sanchi',201,'墺国');
INSERT INTO "Code" VALUES('Sanchi',202,'バルバ');
INSERT INTO "Code" VALUES('Sanchi',203,'ブルガ');
INSERT INTO "Code" VALUES('Sanchi',204,'コロン');
INSERT INTO "Code" VALUES('Sanchi',205,'キュー');
INSERT INTO "Code" VALUES('Sanchi',206,'キプロ');
INSERT INTO "Code" VALUES('Sanchi',207,'チェコ');
INSERT INTO "Code" VALUES('Sanchi',208,'丁国');
INSERT INTO "Code" VALUES('Sanchi',209,'東独国');
INSERT INTO "Code" VALUES('Sanchi',210,'エクア');
INSERT INTO "Code" VALUES('Sanchi',211,'埃国');
INSERT INTO "Code" VALUES('Sanchi',212,'希国');
INSERT INTO "Code" VALUES('Sanchi',213,'蘭国');
INSERT INTO "Code" VALUES('Sanchi',214,'香港');
INSERT INTO "Code" VALUES('Sanchi',215,'洪国');
INSERT INTO "Code" VALUES('Sanchi',216,'印度');
INSERT INTO "Code" VALUES('Sanchi',217,'インド');
INSERT INTO "Code" VALUES('Sanchi',218,'イラン');
INSERT INTO "Code" VALUES('Sanchi',219,'イスラ');
INSERT INTO "Code" VALUES('Sanchi',220,'ジャマ');
INSERT INTO "Code" VALUES('Sanchi',221,'日本');
INSERT INTO "Code" VALUES('Sanchi',222,'ケニア');
INSERT INTO "Code" VALUES('Sanchi',223,'レバノ');
INSERT INTO "Code" VALUES('Sanchi',224,'リベア');
INSERT INTO "Code" VALUES('Sanchi',225,'ルクセ');
INSERT INTO "Code" VALUES('Sanchi',226,'マレー');
INSERT INTO "Code" VALUES('Sanchi',227,'マルタ');
INSERT INTO "Code" VALUES('Sanchi',229,'モーリ');
INSERT INTO "Code" VALUES('Sanchi',230,'メキシ');
INSERT INTO "Code" VALUES('Sanchi',231,'モロコ');
INSERT INTO "Code" VALUES('Sanchi',232,'ノルウ');
INSERT INTO "Code" VALUES('Sanchi',233,'パキス');
INSERT INTO "Code" VALUES('Sanchi',234,'パナマ');
INSERT INTO "Code" VALUES('Sanchi',235,'秘国');
INSERT INTO "Code" VALUES('Sanchi',236,'比国');
INSERT INTO "Code" VALUES('Sanchi',237,'波国');
INSERT INTO "Code" VALUES('Sanchi',238,'葡国');
INSERT INTO "Code" VALUES('Sanchi',239,'プエル');
INSERT INTO "Code" VALUES('Sanchi',240,'羅国');
INSERT INTO "Code" VALUES('Sanchi',241,'シンガ');
INSERT INTO "Code" VALUES('Sanchi',242,'南阿国');
INSERT INTO "Code" VALUES('Sanchi',243,'ソ連');
INSERT INTO "Code" VALUES('Sanchi',244,'西国');
INSERT INTO "Code" VALUES('Sanchi',245,'スリラ');
INSERT INTO "Code" VALUES('Sanchi',246,'スーダ');
INSERT INTO "Code" VALUES('Sanchi',247,'スイス');
INSERT INTO "Code" VALUES('Sanchi',248,'トリニ');
INSERT INTO "Code" VALUES('Sanchi',249,'チュニ');
INSERT INTO "Code" VALUES('Sanchi',250,'土国');
INSERT INTO "Code" VALUES('Sanchi',251,'ウルグ');
INSERT INTO "Code" VALUES('Sanchi',252,'ペネズ');
INSERT INTO "Code" VALUES('Sanchi',253,'ユーゴ');
INSERT INTO "Code" VALUES('Sanchi',254,'ジンバ');
INSERT INTO "Code" VALUES('Sanchi',255,'ロシア');
INSERT INTO "Code" VALUES('Sanchi',256,'シリア');
INSERT INTO "Code" VALUES('Sanchi',257,'沙国');
INSERT INTO "Code" VALUES('Sanchi',258,'韓国');
INSERT INTO "Code" VALUES('Sanchi',259,'中国');
INSERT INTO "Code" VALUES('MasshouFlag',1,'抹消');
INSERT INTO "Code" VALUES('KishuShikakuKubun',0,'資格なし');
INSERT INTO "Code" VALUES('KishuShikakuKubun',1,'平地・障害');
INSERT INTO "Code" VALUES('KishuShikakuKubun',2,'平地');
INSERT INTO "Code" VALUES('KishuShikakuKubun',3,'障害');
INSERT INTO "Code" VALUES('TourokuMasshouFlag',0,'現役');
INSERT INTO "Code" VALUES('TourokuMasshouFlag',1,'抹消');
INSERT INTO "Code" VALUES('TourokuMasshouFlag',2,'引退');
INSERT INTO "Code" VALUES('KyoriTekisei',1,'短');
INSERT INTO "Code" VALUES('KyoriTekisei',2,'中');
INSERT INTO "Code" VALUES('KyoriTekisei',3,'長');
INSERT INTO "Code" VALUES('Kousetsu',1,'◎');
INSERT INTO "Code" VALUES('Kousetsu',2,'○');
INSERT INTO "Code" VALUES('Kousetsu',3,'△');


CREATE TABLE Japanize(
	Id TEXT PRIMARY KEY NOT NULL
	,Name TEXT NOT NULL
	,Domain TEXT
);
INSERT INTO "Japanize" VALUES('KaisaiBasho','開催場所','Basho');
INSERT INTO "Japanize" VALUES('KaisaiNen','開催年',NULL);
INSERT INTO "Japanize" VALUES('KaisaiKaiji','開催回次',NULL);
INSERT INTO "Japanize" VALUES('KaisaiNichiji','開催日次',NULL);
INSERT INTO "Japanize" VALUES('RaceBangou','レース番号',NULL);
INSERT INTO "Japanize" VALUES('Nengappi','年月日',NULL);
INSERT INTO "Japanize" VALUES('Kyuujitsu','休日','Kyuujitsu');
INSERT INTO "Japanize" VALUES('Youbi','曜日','Youbi');
INSERT INTO "Japanize" VALUES('KouryuuFlag','交流フラグ','KouryuuFlag');
INSERT INTO "Japanize" VALUES('ChuuouChihouGaikoku','中央・地方・外国','ChuuouChihouGaikoku');
INSERT INTO "Japanize" VALUES('IppanTokubetsu','一・特','IppanTokubetsu');
INSERT INTO "Japanize" VALUES('HeichiShougai','平・障','HeichiShougai');
INSERT INTO "Japanize" VALUES('JuushouKaisuu','重賞回数',NULL);
INSERT INTO "Japanize" VALUES('TokubetsuMei','特別名',NULL);
INSERT INTO "Japanize" VALUES('TanshukuTokubetsuMei','短縮特別名',NULL);
INSERT INTO "Japanize" VALUES('Grade','グレード','Grade');
INSERT INTO "Japanize" VALUES('JpnFlag','Jpnフラグ',NULL);
INSERT INTO "Japanize" VALUES('BetteiBareiHandi','別定馬齢ハンデ概要','BetteiBareiHandi');
INSERT INTO "Japanize" VALUES('BetteiBareiHandiShousai','別定馬齢ハンデ詳細',NULL);
INSERT INTO "Japanize" VALUES('JoukenFuka1','条件付加1','JoukenFuka1');
INSERT INTO "Japanize" VALUES('JoukenFuka2','条件付加2','JoukenFuka2');
INSERT INTO "Japanize" VALUES('JoukenKei','条件系','JoukenKei');
INSERT INTO "Japanize" VALUES('JoukenNenreiSeigen','条件年齢制限','JoukenNenreiSeigen');
INSERT INTO "Japanize" VALUES('Jouken1','条件1 公営(クラス)','Jouken');
INSERT INTO "Japanize" VALUES('Kumi1','組1',NULL);
INSERT INTO "Japanize" VALUES('IjouIkaMiman','以上・以下・〜・未満','IjouIkaMiman');
INSERT INTO "Japanize" VALUES('Jouken2','条件2 公営(クラス)','Jouken');
INSERT INTO "Japanize" VALUES('Kumi2','組2',NULL);
INSERT INTO "Japanize" VALUES('DirtShiba','ダ・芝','DirtShiba');
INSERT INTO "Japanize" VALUES('MigiHidari','右・左','MigiHidari');
INSERT INTO "Japanize" VALUES('UchiSoto','内・外','UchiSoto');
INSERT INTO "Japanize" VALUES('Course','コース','Course');
INSERT INTO "Japanize" VALUES('Kyori','距離',NULL);
INSERT INTO "Japanize" VALUES('CourseRecordFlag','コースレコードフラグ','RecordFlag');
INSERT INTO "Japanize" VALUES('CourseRecordNengappi','コースレコード日付',NULL);
INSERT INTO "Japanize" VALUES('CourseRecordTime','コースレコードタイム',NULL);
INSERT INTO "Japanize" VALUES('CourseRecordBamei','コースレコード馬名',NULL);
INSERT INTO "Japanize" VALUES('CourseRecordKinryou','コースレコード斤量',NULL);
INSERT INTO "Japanize" VALUES('CourseRecordTanshukuKishuMei','コースレコード短縮騎手名',NULL);
INSERT INTO "Japanize" VALUES('KyoriRecordNengappi','距離レコード日付',NULL);
INSERT INTO "Japanize" VALUES('KyoriRecordTime','距離レコードタイム',NULL);
INSERT INTO "Japanize" VALUES('KyoriRecordBamei','距離レコード馬名',NULL);
INSERT INTO "Japanize" VALUES('KyoriRecordKinryou','距離レコード斤量',NULL);
INSERT INTO "Japanize" VALUES('KyoriRecordTanshukuKishuMei','距離レコード短縮騎手名',NULL);
INSERT INTO "Japanize" VALUES('KyoriRecordBasho','距離レコード場所','Basho');
INSERT INTO "Japanize" VALUES('RaceRecordNengappi','レースレコード日付',NULL);
INSERT INTO "Japanize" VALUES('RaceRecordTime','レースレコードタイム',NULL);
INSERT INTO "Japanize" VALUES('RaceRecordBamei','レースレコード馬名',NULL);
INSERT INTO "Japanize" VALUES('RaceRecordKinryou','レースレコード斤量',NULL);
INSERT INTO "Japanize" VALUES('RaceRecordKishuMei','レースレコード短縮騎手名',NULL);
INSERT INTO "Japanize" VALUES('RaceRecordBasho','レースレコード場所','Basho');
INSERT INTO "Japanize" VALUES('Shoukin1Chaku','賞金1着',NULL);
INSERT INTO "Japanize" VALUES('Shoukin2Chaku','賞金2着',NULL);
INSERT INTO "Japanize" VALUES('Shoukin3Chaku','賞金3着',NULL);
INSERT INTO "Japanize" VALUES('Shoukin4Chaku','賞金4着',NULL);
INSERT INTO "Japanize" VALUES('Shoukin5Chaku','賞金5着',NULL);
INSERT INTO "Japanize" VALUES('Shoukin5ChakuDouchaku1','賞金5着同着',NULL);
INSERT INTO "Japanize" VALUES('Shoukin5ChakuDouchaku2','賞金5着同着2',NULL);
INSERT INTO "Japanize" VALUES('FukaShou','附加賞',NULL);
INSERT INTO "Japanize" VALUES('MaeuriFlag','前売りフラグ','MaeuriFlag');
INSERT INTO "Japanize" VALUES('YoteiHassouJikan','予定発走時間',NULL);
INSERT INTO "Japanize" VALUES('Tousuu','頭数',NULL);
INSERT INTO "Japanize" VALUES('TorikeshiTousuu','取消頭数',NULL);
INSERT INTO "Japanize" VALUES('SuiteiTimeRyou','推定タイム 良',NULL);
INSERT INTO "Japanize" VALUES('SuiteiTimeOmoFuryou','推定タイム 重・不良',NULL);
INSERT INTO "Japanize" VALUES('YosouPace','予想ペース','Pace');
INSERT INTO "Japanize" VALUES('Pace','ペース','Pace');
INSERT INTO "Japanize" VALUES('Tenki','天気','Tenki');
INSERT INTO "Japanize" VALUES('Baba','馬場','Baba');
INSERT INTO "Japanize" VALUES('Seed','シード','Seed');
INSERT INTO "Japanize" VALUES('ShougaiHeikin1F','障害平均1F',NULL);
INSERT INTO "Japanize" VALUES('Midashi1','見出し1','Midashi1');
INSERT INTO "Japanize" VALUES('Midashi2','見出し2','Midashi2');
INSERT INTO "Japanize" VALUES('Keika','経過',NULL);
INSERT INTO "Japanize" VALUES('HassouJoukyou','発走状況',NULL);
INSERT INTO "Japanize" VALUES('KaishiKyori','開始距離',NULL);
INSERT INTO "Japanize" VALUES('ShuuryouKyori','終了距離',NULL);
INSERT INTO "Japanize" VALUES('LapTime','ラップタイム',NULL);
INSERT INTO "Japanize" VALUES('TanUmaban1','単馬番1',NULL);
INSERT INTO "Japanize" VALUES('TanshouHaitoukin1','単勝配当金1',NULL);
INSERT INTO "Japanize" VALUES('TanUmaban2','単馬番2',NULL);
INSERT INTO "Japanize" VALUES('TanshouHaitoukin2','単勝配当金2',NULL);
INSERT INTO "Japanize" VALUES('TanUmaban3','単馬番3',NULL);
INSERT INTO "Japanize" VALUES('TanshouHaitoukin3','単勝配当金3',NULL);
INSERT INTO "Japanize" VALUES('FukuUmaban1','複馬番1',NULL);
INSERT INTO "Japanize" VALUES('FukushouHaitoukin1','複勝配当金1',NULL);
INSERT INTO "Japanize" VALUES('FukuUmaban2','複馬番2',NULL);
INSERT INTO "Japanize" VALUES('FukushouHaitoukin2','複勝配当金2',NULL);
INSERT INTO "Japanize" VALUES('FukuUmaban3','複馬番3',NULL);
INSERT INTO "Japanize" VALUES('FukushouHaitoukin3','複勝配当金3',NULL);
INSERT INTO "Japanize" VALUES('FukuUmaban4','複馬番4',NULL);
INSERT INTO "Japanize" VALUES('FukushouHaitoukin4','複勝配当金4',NULL);
INSERT INTO "Japanize" VALUES('FukuUmaban5','複馬番5',NULL);
INSERT INTO "Japanize" VALUES('FukushouHaitoukin5','複勝配当金5',NULL);
INSERT INTO "Japanize" VALUES('Wakuren11','枠連1-1',NULL);
INSERT INTO "Japanize" VALUES('Wakuren12','枠連1-2',NULL);
INSERT INTO "Japanize" VALUES('WakurenHaitoukin1','枠連配当金1',NULL);
INSERT INTO "Japanize" VALUES('WakurenNinki1','枠連人気1',NULL);
INSERT INTO "Japanize" VALUES('Wakuren21','枠連2-1',NULL);
INSERT INTO "Japanize" VALUES('Wakuren22','枠連2-2',NULL);
INSERT INTO "Japanize" VALUES('WakurenHaitoukin2','枠連配当金2',NULL);
INSERT INTO "Japanize" VALUES('WakurenNinki2','枠連人気2',NULL);
INSERT INTO "Japanize" VALUES('Wakuren31','枠連3-1',NULL);
INSERT INTO "Japanize" VALUES('Wakuren32','枠連3-2',NULL);
INSERT INTO "Japanize" VALUES('WakurenHaitoukin3','枠連配当金3',NULL);
INSERT INTO "Japanize" VALUES('WakurenNinki3','枠連人気3',NULL);
INSERT INTO "Japanize" VALUES('Umaren11','馬連1-1',NULL);
INSERT INTO "Japanize" VALUES('Umaren12','馬連1-2',NULL);
INSERT INTO "Japanize" VALUES('UmarenHaitoukin1','馬連配当金1',NULL);
INSERT INTO "Japanize" VALUES('UmarenNinki1','馬連人気1',NULL);
INSERT INTO "Japanize" VALUES('Umaren21','馬連2-1',NULL);
INSERT INTO "Japanize" VALUES('Umaren22','馬連2-2',NULL);
INSERT INTO "Japanize" VALUES('UmarenHaitoukin2','馬連配当金2',NULL);
INSERT INTO "Japanize" VALUES('UmarenNinki2','馬連人気2',NULL);
INSERT INTO "Japanize" VALUES('Umaren31','馬連3-1',NULL);
INSERT INTO "Japanize" VALUES('Umaren32','馬連3-2',NULL);
INSERT INTO "Japanize" VALUES('UmarenHaitoukin3','馬連配当金3',NULL);
INSERT INTO "Japanize" VALUES('UmarenNinki3','馬連人気3',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren11','ワイド馬連1-1',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren12','ワイド馬連1-2',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenHaitoukin1','ワイド馬連配当金1',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenNinki1','ワイド馬連人気1',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren21','ワイド馬連2-1',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren22','ワイド馬連2-2',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenHaitoukin2','ワイド馬連配当金2',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenNinki2','ワイド馬連人気2',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren31','ワイド馬連3-1',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren32','ワイド馬連3-2',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenHaitoukin3','ワイド馬連配当金3',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenNinki3','ワイド馬連人気3',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren41','ワイド馬連4-1',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren42','ワイド馬連4-2',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenHaitoukin4','ワイド馬連配当金4',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenNinki4','ワイド馬連人気4',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren51','ワイド馬連5-1',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren52','ワイド馬連5-2',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenHaitoukin5','ワイド馬連配当金5',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenNinki5','ワイド馬連人気5',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren61','ワイド馬連6-1',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren62','ワイド馬連6-2',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenHaitoukin6','ワイド馬連配当金6',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenNinki6','ワイド馬連人気6',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren71','ワイド馬連7-1',NULL);
INSERT INTO "Japanize" VALUES('WideUmaren72','ワイド馬連7-2',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenHaitoukin7','ワイド馬連配当金7',NULL);
INSERT INTO "Japanize" VALUES('WideUmarenNinki7','ワイド馬連人気7',NULL);
INSERT INTO "Japanize" VALUES('Umatan11','馬単1-1',NULL);
INSERT INTO "Japanize" VALUES('Umatan12','馬単1-2',NULL);
INSERT INTO "Japanize" VALUES('UmatanHaitoukin1','馬単配当金1',NULL);
INSERT INTO "Japanize" VALUES('UmatanNinki1','馬単人気1',NULL);
INSERT INTO "Japanize" VALUES('Umatan21','馬単2-1',NULL);
INSERT INTO "Japanize" VALUES('Umatan22','馬単2-2',NULL);
INSERT INTO "Japanize" VALUES('UmatanHaitoukin2','馬単配当金2',NULL);
INSERT INTO "Japanize" VALUES('UmatanNinki2','馬単人気2',NULL);
INSERT INTO "Japanize" VALUES('Umatan31','馬単3-1',NULL);
INSERT INTO "Japanize" VALUES('Umatan32','馬単3-2',NULL);
INSERT INTO "Japanize" VALUES('UmatanHaitoukin3','馬単配当金3',NULL);
INSERT INTO "Japanize" VALUES('UmatanNinki3','馬単人気3',NULL);
INSERT INTO "Japanize" VALUES('Umatan41','馬単4-1',NULL);
INSERT INTO "Japanize" VALUES('Umatan42','馬単4-2',NULL);
INSERT INTO "Japanize" VALUES('UmatanHaitoukin4','馬単配当金4',NULL);
INSERT INTO "Japanize" VALUES('UmatanNinki4','馬単人気4',NULL);
INSERT INTO "Japanize" VALUES('Umatan51','馬単5-1',NULL);
INSERT INTO "Japanize" VALUES('Umatan52','馬単5-2',NULL);
INSERT INTO "Japanize" VALUES('UmatanHaitoukin5','馬単配当金5',NULL);
INSERT INTO "Japanize" VALUES('UmatanNinki5','馬単人気5',NULL);
INSERT INTO "Japanize" VALUES('Umatan61','馬単6-1',NULL);
INSERT INTO "Japanize" VALUES('Umatan62','馬単6-2',NULL);
INSERT INTO "Japanize" VALUES('UmatanHaitoukin6','馬単配当金6',NULL);
INSERT INTO "Japanize" VALUES('UmatanNinki6','馬単人気6',NULL);
INSERT INTO "Japanize" VALUES('Sanrenpuku11','3連複1-1',NULL);
INSERT INTO "Japanize" VALUES('Sanrenpuku12','3連複1-2',NULL);
INSERT INTO "Japanize" VALUES('Sanrenpuku13','3連複1-3',NULL);
INSERT INTO "Japanize" VALUES('SanrenpukuHaitoukin1','3連複配当金1',NULL);
INSERT INTO "Japanize" VALUES('SanrenpukuNinki1','3連複人気1',NULL);
INSERT INTO "Japanize" VALUES('Sanrenpuku21','3連複2-1',NULL);
INSERT INTO "Japanize" VALUES('Sanrenpuku22','3連複2-2',NULL);
INSERT INTO "Japanize" VALUES('Sanrenpuku23','3連複2-3',NULL);
INSERT INTO "Japanize" VALUES('SanrenpukuHaitoukin2','3連複配当金2',NULL);
INSERT INTO "Japanize" VALUES('SanrenpukuNinki2','3連複人気2',NULL);
INSERT INTO "Japanize" VALUES('Sanrenpuku31','3連複3-1',NULL);
INSERT INTO "Japanize" VALUES('Sanrenpuku32','3連複3-2',NULL);
INSERT INTO "Japanize" VALUES('Sanrenpuku33','3連複3-3',NULL);
INSERT INTO "Japanize" VALUES('SanrenpukuHaitoukin3','3連複配当金3',NULL);
INSERT INTO "Japanize" VALUES('SanrenpukuNinki3','3連複人気3',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan11','3連単1-1',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan12','3連単1-2',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan13','3連単1-3',NULL);
INSERT INTO "Japanize" VALUES('SanrentanHaitoukin1','3連単配当金1',NULL);
INSERT INTO "Japanize" VALUES('SanrentanNinki1','3連単人気1',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan21','3連単2-1',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan22','3連単2-2',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan23','3連単2-3',NULL);
INSERT INTO "Japanize" VALUES('SanrentanHaitoukin2','3連単配当金2',NULL);
INSERT INTO "Japanize" VALUES('SanrentanNinki2','3連単人気2',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan31','3連単3-1',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan32','3連単3-2',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan33','3連単3-3',NULL);
INSERT INTO "Japanize" VALUES('SanrentanHaitoukin3','3連単配当金3',NULL);
INSERT INTO "Japanize" VALUES('SanrentanNinki3','3連単人気3',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan41','3連単4-1',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan42','3連単4-2',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan43','3連単4-3',NULL);
INSERT INTO "Japanize" VALUES('SanrentanHaitoukin4','3連単配当金4',NULL);
INSERT INTO "Japanize" VALUES('SanrentanNinki4','3連単人気4',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan51','3連単5-1',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan52','3連単5-2',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan53','3連単5-3',NULL);
INSERT INTO "Japanize" VALUES('SanrentanHaitoukin5','3連単配当金5',NULL);
INSERT INTO "Japanize" VALUES('SanrentanNinki5','3連単人気5',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan61','3連単6-1',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan62','3連単6-2',NULL);
INSERT INTO "Japanize" VALUES('Sanrentan63','3連単6-3',NULL);
INSERT INTO "Japanize" VALUES('SanrentanHaitoukin6','3連単配当金6',NULL);
INSERT INTO "Japanize" VALUES('SanrentanNinki6','3連単人気6',NULL);
INSERT INTO "Japanize" VALUES('Wakuban','枠番',NULL);
INSERT INTO "Japanize" VALUES('Umaban','馬番',NULL);
INSERT INTO "Japanize" VALUES('Gate','ゲート',NULL);
INSERT INTO "Japanize" VALUES('KyousoubaId','競走馬ID',NULL);
INSERT INTO "Japanize" VALUES('KanaBamei','カナ馬名',NULL);
INSERT INTO "Japanize" VALUES('UmaKigou','馬記号','UmaKigou');
INSERT INTO "Japanize" VALUES('Seibetsu','性別','Seibetsu');
INSERT INTO "Japanize" VALUES('Nenrei','年齢',NULL);
INSERT INTO "Japanize" VALUES('BanushiMei','馬主名',NULL);
INSERT INTO "Japanize" VALUES('TanshukuBanushiMei','短縮馬主名',NULL);
INSERT INTO "Japanize" VALUES('Blinker','ブリンカー','Blinker');
INSERT INTO "Japanize" VALUES('Kinryou','斤量',NULL);
INSERT INTO "Japanize" VALUES('Bataijuu','馬体重',NULL);
INSERT INTO "Japanize" VALUES('Zougen','増減',NULL);
INSERT INTO "Japanize" VALUES('RecordShisuu','レコード指数',NULL);
INSERT INTO "Japanize" VALUES('KishuId','騎手ID',NULL);
INSERT INTO "Japanize" VALUES('KishuMei','騎手名',NULL);
INSERT INTO "Japanize" VALUES('TanshukuKishuMei','短縮騎手名',NULL);
INSERT INTO "Japanize" VALUES('KishuTouzaiBetsu','騎手東西別',NULL);
INSERT INTO "Japanize" VALUES('KishuShozokuBasho','騎手所属場所','Basho');
INSERT INTO "Japanize" VALUES('KishuShozokuKyuushaId','騎手所属厩舎ID',NULL);
INSERT INTO "Japanize" VALUES('MinaraiKubun','見習い区分','MinaraiKubun');
INSERT INTO "Japanize" VALUES('Norikawari','乗り替り','Norikawari');
INSERT INTO "Japanize" VALUES('KyuushaId','厩舎ID',NULL);
INSERT INTO "Japanize" VALUES('KyuushaMei','厩舎名',NULL);
INSERT INTO "Japanize" VALUES('TanshukuKyuushaMei','短縮厩舎名',NULL);
INSERT INTO "Japanize" VALUES('KyuushaShozokuBasho','厩舎所属場所','Basho');
INSERT INTO "Japanize" VALUES('KyuushaRitsuHokuNanBetsu','厩舎栗北南別','KyuushaRitsuHokuNanBetsu');
INSERT INTO "Japanize" VALUES('YosouShirushi','出馬表の予想印','Yosou');
INSERT INTO "Japanize" VALUES('YosouShirushiHonshi','予想(本紙)','Yosou');
INSERT INTO "Japanize" VALUES('Ninki','人気',NULL);
INSERT INTO "Japanize" VALUES('Odds','オッズ',NULL);
INSERT INTO "Japanize" VALUES('KakuteiChakujun','確定着順',NULL);
INSERT INTO "Japanize" VALUES('ChakujunFuka','着順附加','ChakujunFuka');
INSERT INTO "Japanize" VALUES('NyuusenChakujun','入線着順',NULL);
INSERT INTO "Japanize" VALUES('TorikeshiShubetsu','取消種別','TorikeshiShubetsu');
INSERT INTO "Japanize" VALUES('RecordNinshiki','レコード認識','RecordFlag');
INSERT INTO "Japanize" VALUES('Time','タイム',NULL);
INSERT INTO "Japanize" VALUES('Chakusa1','着差1',NULL);
INSERT INTO "Japanize" VALUES('Chakusa2','着差2','Chakusa2');
INSERT INTO "Japanize" VALUES('TimeSa','タイム差',NULL);
INSERT INTO "Japanize" VALUES('Zenhan3F','前半3F',NULL);
INSERT INTO "Japanize" VALUES('Kouhan3F','後半3F',NULL);
INSERT INTO "Japanize" VALUES('Juni','順位',NULL);
INSERT INTO "Japanize" VALUES('YonCornerIchiDori','4角位置取り','YonCornerIchiDori');
INSERT INTO "Japanize" VALUES('ChoukyouFlag','調教フラグ','ChoukyouFlag');
INSERT INTO "Japanize" VALUES('AwaseFlag','併せフラグ','AwaseFlag');
INSERT INTO "Japanize" VALUES('Awase','併せ',NULL);
INSERT INTO "Japanize" VALUES('Tanpyou','短評',NULL);
INSERT INTO "Japanize" VALUES('HonsuuCourse','本数コース',NULL);
INSERT INTO "Japanize" VALUES('HonsuuHanro','本数坂路',NULL);
INSERT INTO "Japanize" VALUES('HonsuuPool','本数プール',NULL);
INSERT INTO "Japanize" VALUES('Rating','レイティング',NULL);
INSERT INTO "Japanize" VALUES('KyuuyouRiyuu','休養理由',NULL);
INSERT INTO "Japanize" VALUES('Kijousha','騎乗者',NULL);
INSERT INTO "Japanize" VALUES('Basho','場所',NULL);
INSERT INTO "Japanize" VALUES('ChoukyouCourse','コース',NULL);
INSERT INTO "Japanize" VALUES('ChoukyouBaba','馬場',NULL);
INSERT INTO "Japanize" VALUES('Kaisuu','回数',NULL);
INSERT INTO "Japanize" VALUES('IchiDori','位置取り',NULL);
INSERT INTO "Japanize" VALUES('Ashiiro','脚色',NULL);
INSERT INTO "Japanize" VALUES('Yajirushi','調教矢印','Yajirushi');
INSERT INTO "Japanize" VALUES('Reigai','例外',NULL);
INSERT INTO "Japanize" VALUES('Seinen','生年',NULL);
INSERT INTO "Japanize" VALUES('F','ハロン',NULL);
INSERT INTO "Japanize" VALUES('Comment','コメント',NULL);
INSERT INTO "Japanize" VALUES('Ichi','位置','Ichi');
INSERT INTO "Japanize" VALUES('Joukyou','状況','Joukyou');
INSERT INTO "Japanize" VALUES('FuriByousuu','不利秒数',NULL);
INSERT INTO "Japanize" VALUES('Shisuu','指数',NULL);
INSERT INTO "Japanize" VALUES('Tate','縦',NULL);
INSERT INTO "Japanize" VALUES('Yoko','横',NULL);
INSERT INTO "Japanize" VALUES('Keiro','毛色','Keiro');
INSERT INTO "Japanize" VALUES('Kesshu','血種','Kesshu');
INSERT INTO "Japanize" VALUES('Sanchi','産地','Sanchi');
INSERT INTO "Japanize" VALUES('ChichiUmaId','父馬ID',NULL);
INSERT INTO "Japanize" VALUES('ChichiUmaMei','父馬名',NULL);
INSERT INTO "Japanize" VALUES('HahaUmaId','母馬ID',NULL);
INSERT INTO "Japanize" VALUES('HahaUmaMei','母馬名',NULL);
INSERT INTO "Japanize" VALUES('HahaChichiUmaId','母父馬ID',NULL);
INSERT INTO "Japanize" VALUES('HahaChichiUmaMei','母父馬',NULL);
INSERT INTO "Japanize" VALUES('HahaHahaUmaId','母母馬ID',NULL);
INSERT INTO "Japanize" VALUES('HahaHahaUmaMei','母母馬名',NULL);
INSERT INTO "Japanize" VALUES('SeisanshaMei','生産者名',NULL);
INSERT INTO "Japanize" VALUES('TanshukuSeisanshaMei','短縮生産者名',NULL);
INSERT INTO "Japanize" VALUES('KoueiGaikokuKyuushaMei','公営外国厩舎名',NULL);
INSERT INTO "Japanize" VALUES('MasshouFlag','抹消フラグ','MasshouFlag');
INSERT INTO "Japanize" VALUES('MasshouNengappi','抹消年月日',NULL);
INSERT INTO "Japanize" VALUES('Jiyuu','事由',NULL);
INSERT INTO "Japanize" VALUES('Ikisaki','行先',NULL);
INSERT INTO "Japanize" VALUES('Furigana','フリガナ',NULL);
INSERT INTO "Japanize" VALUES('Seinengappi','生年月日',NULL);
INSERT INTO "Japanize" VALUES('HatsuMenkyoNen','初免許年',NULL);
INSERT INTO "Japanize" VALUES('KishuShikakuKubun','騎乗資格区分',NULL);
INSERT INTO "Japanize" VALUES('TourokuMasshouFlag','登録抹消フラグ',NULL);
INSERT INTO "Japanize" VALUES('ShutsubahyouSakuseiNengappi','出馬表作成年月日',NULL);
INSERT INTO "Japanize" VALUES('SeisekiSakuseiNengappi','成績作成年月日',NULL);
INSERT INTO "Japanize" VALUES('DataSakuseiNengappi','データ作成年月日',NULL);
INSERT INTO "Japanize" VALUES('ChichiKyoriTekisei','父距離適性','KyoriTekisei');
INSERT INTO "Japanize" VALUES('HirabaOmoKousetsu','平場重巧拙','Kousetsu');
INSERT INTO "Japanize" VALUES('HirabaDirtKousetsu','平場ダート巧拙','Kousetsu');
INSERT INTO "Japanize" VALUES('ShougaiOmoKousetsu','障害重巧拙','Kousetsu');
INSERT INTO "Japanize" VALUES('ShougaiDirtKousetsu','障害ダート巧拙','Kousetsu');
INSERT INTO "Japanize" VALUES('Oikiri','追切り','Oikiri');
INSERT INTO "Japanize" VALUES('KyuushaTouzaiBetsu','厩舎東西別','KyuushaTouzaiBetsu');
INSERT INTO "Japanize" VALUES('Bangou','番号',NULL);
INSERT INTO "Japanize" VALUES('KyuuBamei','旧馬名',NULL);

CREATE TABLE UserSQL(
	Domain TEXT NOT NULL
	,Name TEXT NOT NULL
	,SQL TEXT NOT NULL
	,DetailColNames TEXT
	,ParamColNames TEXT
	,ListColNames TEXT
	,Editable INT NOT NULL DEFAULT 1
	,PRIMARY KEY(Domain, Name)
);
INSERT INTO "UserSQL" VALUES(
'Race',
'レース結果(標準)',
'SELECT
    *
FROM
    Shussouba
WHERE
    RaceId = /* Id */0
ORDER BY
    KakuteiChakujun,
    Umaban
',
'Nengappi,RaceBangou,TokubetsuMei,Grade,JoukenNenreiSeigen,Jouken1,BetteiBareiHandi,JoukenFuka1,JoukenFuka2,DirtShiba,Kyori',
'Id',
'KakuteiChakujun,Wakuban,Umaban,KanaBamei,Seibetsu,Nenrei,Kinryou,TanshukuKishuMei,Time,Chakusa1,Chakusa2,Zenhan3F,Kouhan3F,Odds,Ninki,Bataijuu,Zougen,TanshukuKyuushaMei'
,0);
INSERT INTO "UserSQL" VALUES(
'Shussouba',
'調教',
'SELECT
	Oikiri,
	Kijousha,
	Nengappi,
	Basho,
	ChoukyouCourse,
	ChoukyouBaba,
	Kaisuu,
	IchiDori,
	Ashiiro,
	Yajirushi,
	Reigai,
	Awase,
	F,
	Time
FROM
	Choukyou c
	INNER JOIN ChoukyouRireki r ON c.Id = r.ChoukyouId
	INNER JOIN ChoukyouTime t ON r.Id = t.ChoukyouRirekiId
WHERE
	c.Id = /* Id */0
AND
	Time IS NOT NULL
ORDER BY
	Nengappi,
	F
',
'',
'Id',
'Oikiri,Kijousha,Nengappi,Basho,ChoukyouCourse,ChoukyouBaba,Kaisuu,IchiDori,Ashiiro,Yajirushi,Reigai,Awase,F,Time',
0);
INSERT INTO "UserSQL" VALUES(
'Shussouba',
'発走状況',
'SELECT
	r.HassouJoukyou,
	r.Ichi,
	r.Joukyou,
	r.FuriByousuu,
	k.ShussoubaId / 100 AS Umaban
FROM
	RaceHassouJoukyou r
	INNER JOIN ShussoubaHassouJoukyou k ON r.Id = k.RaceHassouJoukyouId
WHERE
	k.ShussoubaId = /* Id */0
ORDER BY
	r.Ichi,
	k.ShussoubaId
',
'',
'Id',
'Ichi,Joukyou,FuriByousuu',
0);
INSERT INTO "UserSQL" VALUES(
'Shussouba',
'経過',
'SELECT
	r.Midashi1,
	r.Midashi2,
	k.Tate,
	k.Yoko
FROM
	RaceKeika r
	INNER JOIN ShussoubaKeika k ON r.Id = k.RaceKeikaId
WHERE
	k.ShussoubaId = /* Id */0
ORDER BY
	r.Id
',
'',
'Id',
'Tate,Yoko',
0);
INSERT INTO "UserSQL" VALUES(
'TekichuuRace',
'全レース',
'SELECT
	Id
FROM
	Race
',
'',
'',
'Id',
0);
INSERT INTO "UserSQL" VALUES(
'TekichuuShussouba',
'人気順',
'SELECT
	Umaban,
	Wakuban
FROM
	Shussouba
WHERE
    RaceId = /* Id */0
ORDER BY
    Ninki
',
'',
'Id',
'Umaban',
0);
INSERT INTO 'UserSQL' VALUES('PreImport','UQ_Race','DROP INDEX IF EXISTS UQ_Race',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','UQ_RaceLapTime','DROP INDEX IF EXISTS UQ_RaceLapTime',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','UQ_RaceKeika','DROP INDEX IF EXISTS UQ_RaceKeika',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_RaceHassouJoukyou','DROP INDEX IF EXISTS IX_RaceHassouJoukyou',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','UQ_Shussouba','DROP INDEX IF EXISTS UQ_Shussouba',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_Shussouba01','DROP INDEX IF EXISTS IX_Shussouba01',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_Shussouba02','DROP INDEX IF EXISTS IX_Shussouba02',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_Shussouba03','DROP INDEX IF EXISTS IX_Shussouba03',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_Shussouba04','DROP INDEX IF EXISTS IX_Shussouba04',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_Shussouba05','DROP INDEX IF EXISTS IX_Shussouba05',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_Shussouba06','DROP INDEX IF EXISTS IX_Shussouba06',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_Shussouba07','DROP INDEX IF EXISTS IX_Shussouba07',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_Choukyou','DROP INDEX IF EXISTS IX_Choukyou',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_ChoukyouRireki','DROP INDEX IF EXISTS IX_ChoukyouRireki',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','UQ_ChoukyouTime','DROP INDEX IF EXISTS UQ_ChoukyouTime',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','UQ_ShussoubaTsuukaJuni','DROP INDEX IF EXISTS UQ_ShussoubaTsuukaJuni',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_ShussoubaKeika01','DROP INDEX IF EXISTS IX_ShussoubaKeika01',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_ShussoubaKeika02','DROP INDEX IF EXISTS IX_ShussoubaKeika02',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_ShussoubaHassouJoukyou01','DROP INDEX IF EXISTS IX_ShussoubaHassouJoukyou01',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PreImport','IX_ShussoubaHassouJoukyou02','DROP INDEX IF EXISTS IX_ShussoubaHassouJoukyou02',NULL,NULL,NULL,0);

INSERT INTO 'UserSQL' VALUES('PostImport','UQ_Race','CREATE INDEX UQ_Race ON Race(Nengappi, KaisaiBasho, RaceBangou)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','UQ_RaceLapTime','CREATE UNIQUE INDEX UQ_RaceLapTime ON RaceLapTime(RaceId, Bangou)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','UQ_RaceKeika','CREATE UNIQUE INDEX UQ_RaceKeika ON RaceKeika(RaceId, Bangou)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_RaceHassouJoukyou','CREATE INDEX IX_RaceHassouJoukyou ON RaceHassouJoukyou(RaceId)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','UQ_Shussouba','CREATE UNIQUE INDEX UQ_Shussouba ON Shussouba(RaceId, Umaban)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_Shussouba01','CREATE INDEX IX_Shussouba01 ON Shussouba(Time)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_Shussouba02','CREATE INDEX IX_Shussouba02 ON Shussouba(Zenhan3F)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_Shussouba03','CREATE INDEX IX_Shussouba03 ON Shussouba(Kouhan3F)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_Shussouba04','CREATE INDEX IX_Shussouba04 ON Shussouba(KyousoubaId)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_Shussouba05','CREATE INDEX IX_Shussouba05 ON Shussouba(KanaBamei)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_Shussouba06','CREATE INDEX IX_Shussouba06 ON Shussouba(KishuId)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_Shussouba07','CREATE INDEX IX_Shussouba07 ON Shussouba(KyuushaId)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_Choukyou','CREATE INDEX IX_Choukyou ON Choukyou(KyousoubaId)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_ChoukyouRireki','CREATE INDEX IX_ChoukyouRireki ON ChoukyouRireki(ChoukyouId)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','UQ_ChoukyouTime','CREATE INDEX UQ_ChoukyouTime ON ChoukyouTime(ChoukyouRirekiId, F)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','UQ_ShussoubaTsuukaJuni','CREATE INDEX UQ_ShussoubaTsuukaJuni ON ShussoubaTsuukaJuni(ShussoubaId, Bangou)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_ShussoubaKeika01','CREATE INDEX IX_ShussoubaKeika01 ON ShussoubaKeika(RaceKeikaId)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_ShussoubaKeika02','CREATE INDEX IX_ShussoubaKeika02 ON ShussoubaKeika(ShussoubaId)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_ShussoubaHassouJoukyou01','CREATE INDEX IX_ShussoubaHassouJoukyou01 ON ShussoubaHassouJoukyou(RaceHassouJoukyouId)',NULL,NULL,NULL,0);
INSERT INTO 'UserSQL' VALUES('PostImport','IX_ShussoubaHassouJoukyou02','CREATE INDEX IX_ShussoubaHassouJoukyou02 ON ShussoubaHassouJoukyou(ShussoubaId)',NULL,NULL,NULL,0);
