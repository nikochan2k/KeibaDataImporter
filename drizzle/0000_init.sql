CREATE TABLE `Banushi` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ShussoubaId` integer NOT NULL,
	`ShoyuuId` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxBanushi1` ON `Banushi` (`ShussoubaId`,`ShoyuuId`);--> statement-breakpoint
CREATE INDEX `IxBanushi2` ON `Banushi` (`ShoyuuId`);--> statement-breakpoint
CREATE TABLE `Choukyou` (
	`Id` integer PRIMARY KEY NOT NULL,
	`UmaId` integer NOT NULL,
	`Noriyaku` integer,
	`TanshukuKishuMeiId` integer,
	`Nengappi` integer NOT NULL,
	`Renban` integer NOT NULL,
	`Basho` integer,
	`Type` integer,
	`Course` integer,
	`BashoCourse` text,
	`Baba` integer,
	`Kaisuu` integer,
	`IchiDori` integer,
	`Oikiri` integer,
	`Ashiiro` integer,
	`OikiriSonota` text,
	`AwaseUmaId` integer,
	`AwaseKekka` integer,
	`Chakusa` integer,
	`TimeSa` real,
	`AwaseReigai` text,
	`OiJoutai` integer,
	`ChoukyouF` integer,
	`TenF` real,
	`ChuukanF` real,
	`ShimaiF` real,
	`TenFShisuu` integer,
	`ChuukanFShisuu` integer,
	`ShimaiFShisuu` integer,
	`OikiriShisuu` integer,
	`AwaseUmaOikiriShurui` integer,
	`AwaseUmaNenrei` integer,
	`AwaseUmaClass` integer
);
--> statement-breakpoint
CREATE INDEX `IxChoukyou` ON `Choukyou` (`UmaId`);--> statement-breakpoint
CREATE TABLE `Choukyoushi` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`KolKyuushaCode` integer,
	`JrdbChoukyoushiCode` integer,
	`JvDataChoukyoushiCode` text,
	`Seinengappi` integer,
	`Seibetsu` integer,
	`HatsuMenkyoNen` integer,
	`TouzaiBetsu` integer,
	`ShozokuBasho` integer,
	`ShozokuBashoMei` text,
	`ShoutaiKubun` integer,
	`RitsuHokuNanBetsu` integer,
	`MenkyoKoufuNengappi` integer,
	`MenkyoMasshouNengappi` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxChoukyoushi1` ON `Choukyoushi` (`KolKyuushaCode`);--> statement-breakpoint
CREATE UNIQUE INDEX `IxChoukyoushi2` ON `Choukyoushi` (`JrdbChoukyoushiCode`);--> statement-breakpoint
CREATE UNIQUE INDEX `IxChoukyoushi3` ON `Choukyoushi` (`JvDataChoukyoushiCode`);--> statement-breakpoint
CREATE TABLE `ChoukyoushiMei` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ChoukyoushiId` integer NOT NULL,
	`JinmeiId` integer NOT NULL,
	`Kubun` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxChoukyoushiMei1` ON `ChoukyoushiMei` (`ChoukyoushiId`,`JinmeiId`,`Kubun`);--> statement-breakpoint
CREATE INDEX `IxChoukyoushiMei2` ON `ChoukyoushiMei` (`JinmeiId`);--> statement-breakpoint
CREATE TABLE `ChoukyouTime` (
	`ChoukyouId` integer NOT NULL,
	`F` integer NOT NULL,
	`Time` real,
	`Comment` text,
	PRIMARY KEY(`ChoukyouId`, `F`)
);
--> statement-breakpoint
CREATE TABLE `Houbokusaki` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`Meishou` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxHoubokusaki` ON `Houbokusaki` (`Meishou`);--> statement-breakpoint
CREATE TABLE `Jinmei` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`Meishou` text NOT NULL,
	`MatchingKey` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxJinmei` ON `Jinmei` (`MatchingKey`);--> statement-breakpoint
CREATE TABLE `Kaisai` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Key` integer NOT NULL,
	`Basho` integer NOT NULL,
	`Nen` integer NOT NULL,
	`Gatsu` integer NOT NULL,
	`Nichi` integer NOT NULL,
	`Kaiji` integer,
	`Nichiji` integer,
	`Youbi` integer,
	`Kyuujitsu` integer,
	`KaisaiKubun` integer,
	`ChuuouChihouGaikoku` integer,
	`GaikokuKeibajouMei` text
);
--> statement-breakpoint
CREATE INDEX `IxKaisai1` ON `Kaisai` (`Key`);--> statement-breakpoint
CREATE INDEX `IxKaisai2` ON `Kaisai` (`Basho`,`Kaiji`,`Nichiji`);--> statement-breakpoint
CREATE INDEX `IxKaisai3` ON `Kaisai` (`Basho`,`Nen`,`Gatsu`,`Nichi`);--> statement-breakpoint
CREATE TABLE `KaisaiYosou` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Tenki` integer,
	`ShibaBaba` integer,
	`ShibaBabaSokudo` integer,
	`ShibaBabaUchi` integer,
	`ShibaBabaNaka` integer,
	`ShibaBabaSoto` integer,
	`ShibaBabaSa` real,
	`ChokusenBabaSaSaiuchi` real,
	`ChokusenBabaSaUchi` real,
	`ChokusenBabaSaNaka` real,
	`ChokusenBabaSaSoto` real,
	`ChokusenBabaSaOsoto` real,
	`DirtBaba` integer,
	`DirtBabaSokudo` integer,
	`DirtBabaUchi` integer,
	`DirtBabaNaka` integer,
	`DirtBabaSoto` integer,
	`DirtBabaSa` real,
	`RenzokuNissuu` integer,
	`ShibaShurui` integer,
	`Kusatake` real,
	`Tenatsu` integer,
	`TouketsuBoushizai` integer,
	`ChuukanKousuiryou` real
);
--> statement-breakpoint
CREATE TABLE `Kishu` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`KolKishuCode` integer,
	`JrdbKishuCode` integer,
	`JvDataKishuCode` text,
	`Seinengappi` integer,
	`Seibetsu` integer,
	`MenkyoKoufuNengappi` integer,
	`MenkyoMasshouNengappi` integer,
	`Shozoku` integer,
	`ShozokuChoukyoushiId` integer,
	`ShoutaiKubun` integer,
	`ShozokuBashoMei` text,
	`MinaraiKubun` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxKishu1` ON `Kishu` (`KolKishuCode`);--> statement-breakpoint
CREATE UNIQUE INDEX `IxKishu2` ON `Kishu` (`JrdbKishuCode`);--> statement-breakpoint
CREATE UNIQUE INDEX `IxKishu3` ON `Kishu` (`JvDataKishuCode`);--> statement-breakpoint
CREATE TABLE `KishuMei` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`KishuId` integer NOT NULL,
	`JinmeiId` integer NOT NULL,
	`Kubun` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxKishuMei1` ON `KishuMei` (`KishuId`,`JinmeiId`,`Kubun`);--> statement-breakpoint
CREATE INDEX `IxKishuMei2` ON `KishuMei` (`JinmeiId`);--> statement-breakpoint
CREATE TABLE `Kyousouba` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`UmaId` integer NOT NULL,
	`Seibetsu` integer,
	`UmaKigou` integer,
	`ChoukyoushiId` integer,
	`KoueiGaikokuChoukyoushiMei` text
);
--> statement-breakpoint
CREATE INDEX `IxKyousouba` ON `Kyousouba` (`UmaId`);--> statement-breakpoint
CREATE TABLE `OddsHaitou` (
	`Id` integer PRIMARY KEY NOT NULL,
	`RaceId` integer NOT NULL,
	`Baken` integer NOT NULL,
	`Kakutei` integer,
	`Bangou1` integer NOT NULL,
	`Bangou2` integer,
	`Bangou3` integer,
	`Odds1` real,
	`Odds2` real,
	`Haitoukin` integer,
	`Ninki` integer,
	`ShutokuJikan` text
);
--> statement-breakpoint
CREATE INDEX `IxOddsHaitou` ON `OddsHaitou` (`RaceId`,`Baken`);--> statement-breakpoint
CREATE TABLE `Race` (
	`Id` integer PRIMARY KEY NOT NULL,
	`KaisaiId` integer NOT NULL,
	`RaceBangou` integer NOT NULL,
	`IppanTokubetsu` integer,
	`HeichiShougai` integer,
	`Grade` integer,
	`JpnFlag` integer,
	`JuushouKaisuu` integer,
	`JoukenSarakei` integer,
	`JoukenAraKei` integer,
	`JoukenBoba` integer,
	`JoukenHinba` integer,
	`JoukenSenba` integer,
	`JoukenMaruKon` integer,
	`JoukenMaruChichi` integer,
	`JoukenMaruIchi` integer,
	`JoukenMaruChuu` integer,
	`JoukenKakuChuu` integer,
	`JoukenMaruKokusai` integer,
	`JoukenMaruShou` integer,
	`JoukenMaruShi` integer,
	`JoukenMaruTokuShi` integer,
	`JoukenKakuShi` integer,
	`JoukenShounyuu` integer,
	`JoukenNaikokusan` integer,
	`JoukenKouryuu` integer,
	`JoukenWakate` integer,
	`JoukenKyuushuusan` integer,
	`JoukenChibasan` integer,
	`JoukenKansaiHaifuba` integer,
	`JoukenKantouHaifuba` integer,
	`JoukenJraNintei` integer,
	`JoukenJraShitei` integer,
	`JoukenAshige` integer,
	`JoukenKurige` integer,
	`JoukenAshigeShiroge` integer,
	`JoukenKurokage` integer,
	`JoukenSeed` integer,
	`BetteiBareiHandi` integer,
	`BetteiBareiHandiReigai` text,
	`JoukenNenreiSeigen` integer,
	`Jouken1` integer,
	`Kumi1` integer,
	`IjouIkaMiman` integer,
	`Jouken2` integer,
	`Kumi2` integer,
	`DirtShiba` integer,
	`MigiHidari` integer,
	`UchiSoto` integer,
	`Course` integer,
	`Kyori` integer,
	`MaeuriFlag` integer,
	`YoteiHassouJikan` text,
	`HassouJikan` text,
	`Tousuu` integer,
	`TorikeshiTousuu` integer,
	`CourseRecordId` integer,
	`KyoriRecordId` integer,
	`RaceRecordId` integer,
	`Shoukin1Chaku` integer,
	`Shoukin2Chaku` integer,
	`Shoukin3Chaku` integer,
	`Shoukin4Chaku` integer,
	`Shoukin5Chaku` integer,
	`SannyuShoukin1Chaku` integer,
	`SannyuShoukin2Chaku` integer,
	`FukaShou` integer,
	`BakenHatsubaiFlagTanshou` integer,
	`BakenHatsubaiFlagFukushou` integer,
	`BakenHatsubaiFlagWakuren` integer,
	`BakenHatsubaiFlagUmaren` integer,
	`BakenHatsubaiFlagUmatan` integer,
	`BakenHatsubaiFlagWide` integer,
	`BakenHatsubaiFlagSanrenpuku` integer,
	`BakenHatsubaiFlagSanrentan` integer,
	`WinsFlag` integer,
	`SuiteiTimeRyou` real,
	`SuiteiTimeOmoFuryou` real,
	`YosouPace` integer,
	`Yosoushamei2` text,
	`KolNengappi` integer
);
--> statement-breakpoint
CREATE INDEX `IxRace` ON `Race` (`KaisaiId`,`RaceBangou`);--> statement-breakpoint
CREATE TABLE `RaceHassouJoukyou` (
	`Id` integer PRIMARY KEY NOT NULL,
	`RaceId` integer NOT NULL,
	`HassouJoukyou` text NOT NULL,
	`Ichi` integer NOT NULL,
	`Joukyou` integer NOT NULL,
	`FuriBashin` real,
	`FuriByou` real
);
--> statement-breakpoint
CREATE INDEX `IxRaceHassouJoukyou` ON `RaceHassouJoukyou` (`RaceId`);--> statement-breakpoint
CREATE TABLE `RaceKeika` (
	`Id` integer PRIMARY KEY NOT NULL,
	`RaceId` integer NOT NULL,
	`Keika` text NOT NULL,
	`Midashi1` integer,
	`Midashi2` integer
);
--> statement-breakpoint
CREATE INDEX `IxRaceKeika` ON `RaceKeika` (`RaceId`);--> statement-breakpoint
CREATE TABLE `RaceLapTime` (
	`Id` integer PRIMARY KEY NOT NULL,
	`RaceId` integer NOT NULL,
	`KaishiKyori` integer NOT NULL,
	`ShuuryouKyori` integer NOT NULL,
	`LapTime` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IxRaceLapTime` ON `RaceLapTime` (`RaceId`);--> statement-breakpoint
CREATE TABLE `RaceMei` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`RaceId` integer NOT NULL,
	`TokubetsuMeiId` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxRaceMei` ON `RaceMei` (`RaceId`,`TokubetsuMeiId`);--> statement-breakpoint
CREATE TABLE `RaceSeiseki` (
	`Id` integer PRIMARY KEY NOT NULL,
	`TorikeshiTousuu` integer,
	`Pace` integer,
	`PaceShisuu` real,
	`PaceUpNokoriFalon` integer,
	`PaceNagare` integer,
	`Tenki` integer,
	`Baba` integer,
	`BabaSokudo` integer,
	`ShougaiHeikin1F` real,
	`Shoukin1Chaku` integer,
	`Shoukin2Chaku` integer,
	`Shoukin3Chaku` integer,
	`Shoukin4Chaku` integer,
	`Shoukin5Chaku` integer,
	`Shoukin5ChakuDouchaku` integer,
	`Shoukin5ChakuDouchaku2` integer,
	`SeisaiNaiyou` text,
	`RaceComment` text,
	`KolNengappi` integer
);
--> statement-breakpoint
CREATE TABLE `RaceTrackBias` (
	`Id` integer PRIMARY KEY NOT NULL,
	`RaceId` integer NOT NULL,
	`Midashi` integer NOT NULL,
	`Ichi` integer NOT NULL,
	`TrackBias` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IxRaceTrackBias` ON `RaceTrackBias` (`RaceId`);--> statement-breakpoint
CREATE TABLE `Record` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`Nengappi` integer NOT NULL,
	`Time` real NOT NULL,
	`UmaId` integer NOT NULL,
	`Kinryou` real NOT NULL,
	`TanshukuKishuMeiId` integer NOT NULL,
	`Basho` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxRecord` ON `Record` (`Nengappi`,`UmaId`);--> statement-breakpoint
CREATE TABLE `Seisansha` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`UmaId` integer NOT NULL,
	`ShoyuuId` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxSeisansha1` ON `Seisansha` (`UmaId`,`ShoyuuId`);--> statement-breakpoint
CREATE INDEX `IxSeisansha2` ON `Seisansha` (`ShoyuuId`);--> statement-breakpoint
CREATE TABLE `Shoyuu` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`Kubun` integer NOT NULL,
	`Meishou` text NOT NULL,
	`MatchingKey` text,
	`BanushiKaiCode` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxShoyuu1` ON `Shoyuu` (`Meishou`);--> statement-breakpoint
CREATE INDEX `IxShoyuu2` ON `Shoyuu` (`MatchingKey`);--> statement-breakpoint
CREATE TABLE `Shussouba` (
	`Id` integer PRIMARY KEY NOT NULL,
	`RaceId` integer NOT NULL,
	`Wakuban` integer,
	`Umaban` integer NOT NULL,
	`KyousoubaId` integer,
	`Nenrei` integer,
	`Kinryou` real,
	`KishuId` integer,
	`KishuTouzaiBetsu` integer,
	`KishuShozokuBasho` integer,
	`KishuShozokuChoukyoushiId` integer,
	`MinaraiKubun` integer,
	`Norikawari` integer,
	`Blinker` integer,
	`WakuKakuteiBataijuu` integer,
	`WakuKakuteiZougen` integer,
	`TorikeshiShubetsu` integer,
	`KyuuyouRiyuuCode` integer,
	`KyuuyouRiyuu` text,
	`KolNengappi` integer
);
--> statement-breakpoint
CREATE INDEX `IxShussouba1` ON `Shussouba` (`RaceId`,`Umaban`);--> statement-breakpoint
CREATE INDEX `IxShussouba2` ON `Shussouba` (`KyousoubaId`);--> statement-breakpoint
CREATE INDEX `IxShussouba3` ON `Shussouba` (`KishuId`);--> statement-breakpoint
CREATE TABLE `ShussoubaChoukyou` (
	`Id` integer PRIMARY KEY NOT NULL,
	`ShussoubaId` integer NOT NULL,
	`ChoukyouId` integer NOT NULL,
	`ChoukyouFlag` integer,
	`Yajirushi` integer,
	`Reigai` text,
	`HonOikiri` integer
);
--> statement-breakpoint
CREATE INDEX `IxShussoubaChoukyou1` ON `ShussoubaChoukyou` (`ShussoubaId`);--> statement-breakpoint
CREATE INDEX `IxShussoubaChoukyou2` ON `ShussoubaChoukyou` (`ChoukyouId`);--> statement-breakpoint
CREATE TABLE `ShussoubaHassouJoukyou` (
	`Id` integer PRIMARY KEY NOT NULL,
	`RaceHassouJoukyouId` integer NOT NULL,
	`ShussoubaId` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IxShussoubaHassouJoukyou` ON `ShussoubaHassouJoukyou` (`RaceHassouJoukyouId`,`ShussoubaId`);--> statement-breakpoint
CREATE TABLE `ShussoubaHyouka` (
	`Id` integer PRIMARY KEY NOT NULL,
	`KolRecordShisuu` integer,
	`Idm` integer,
	`IdmSoten` integer,
	`IdmBabasa` integer,
	`IdmPace` integer,
	`IdmDeokure` integer,
	`IdmIchidori` integer,
	`IdmFuri` integer,
	`IdmTen3FFuri` integer,
	`IdmDouchuuFuri` integer,
	`IdmAgari3FFuri` integer,
	`IdmRace` integer,
	`CourseDori` integer,
	`JoushoudoCode` integer,
	`ClassCode` integer,
	`BataiCode` integer,
	`KehaiCode` integer,
	`Pace` integer,
	`Ten3FShisuu` real,
	`Agari3FShisuu` real,
	`PaceShisuu` real,
	`Kyakushitsu` integer,
	`PaceNagare` integer,
	`PaddockComment` text,
	`AshimotoComment` text,
	`BaguSonotaComment` text,
	`RaceComment` text,
	`ChoukyouTanpyou` text,
	`ChoukyouHonsuuCourse` integer,
	`ChoukyouHonsuuHanro` integer,
	`ChoukyouHonsuuPool` integer,
	`ChoukyouType` integer,
	`Choukyouryou` integer,
	`ChoukyouTsuyosa` integer,
	`ChoukyouCourseMain` integer,
	`ChoukyouCourseHanro` integer,
	`ChoukyouCourseWood` integer,
	`ChoukyouCourseDirt` integer,
	`ChoukyouCourseShiba` integer,
	`ChoukyouCoursePool` integer,
	`ChoukyouCourseShougai` integer,
	`ChoukyouCoursePoly` integer,
	`ChoukyouKyori` integer,
	`ChoukyouJuuten` integer,
	`IsshuumaeOikiriShisuu` integer,
	`IsshuumaeOikiriBasho` integer,
	`OikiriShisuu` integer,
	`ShiageShisuu` integer,
	`ChoukyouryouHyouka` integer,
	`ShiageShisuuHenka` integer,
	`ChoukyouComment` text,
	`ChoukyouCommentNengappi` integer,
	`ChoukyouHyouka` integer
);
--> statement-breakpoint
CREATE TABLE `ShussoubaJoutai` (
	`Id` integer PRIMARY KEY NOT NULL,
	`ShussoubaId` integer NOT NULL,
	`Kubun` integer NOT NULL,
	`Code` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxShussoubaJoutai` ON `ShussoubaJoutai` (`ShussoubaId`,`Kubun`,`Code`);--> statement-breakpoint
CREATE TABLE `ShussoubaKeika` (
	`Id` integer PRIMARY KEY NOT NULL,
	`RaceKeikaId` integer NOT NULL,
	`ShussoubaId` integer NOT NULL,
	`TateCount` integer NOT NULL,
	`TateHanareteCount` integer NOT NULL,
	`TateOokikuHanareteCount` integer NOT NULL,
	`YokoCount` integer NOT NULL,
	`YokoHanareteCount` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IxShussoubaKeika` ON `ShussoubaKeika` (`RaceKeikaId`,`ShussoubaId`);--> statement-breakpoint
CREATE TABLE `ShussoubaSeiseki` (
	`Id` integer PRIMARY KEY NOT NULL,
	`Gate` integer,
	`Kinryou` real,
	`Bataijuu` integer,
	`Zougen` integer,
	`KishuId` integer,
	`KishuTouzaiBetsu` integer,
	`KishuShozokuBasho` integer,
	`KishuShozokuChoukyoushiId` integer,
	`MinaraiKubun` integer,
	`Norikawari` integer,
	`KakuteiChakujun` integer,
	`ChakujunFuka` integer,
	`NyuusenChakujun` integer,
	`TorikeshiShubetsu` integer,
	`RecordNinshiki` integer,
	`Time` real,
	`Chakusa1` integer,
	`Chakusa2` integer,
	`TimeSa` real,
	`Ten3F` real,
	`Ten3FIkou` real,
	`Douchuu` real,
	`Agari3FIzen` real,
	`Agari3F` real,
	`YonCornerIchiDori` integer,
	`Ten3FSentouSa` real,
	`Agari3FSentouSa` real,
	`Chaku12TimeSa` real,
	`Bikou` text,
	`KishuKyuushaComment` text,
	`JisouhenoMemo` text,
	`HonShoukin` integer,
	`ShuutokuShoukin` integer,
	`KolNengappi` integer
);
--> statement-breakpoint
CREATE INDEX `IxShussoubaSeiseki1` ON `ShussoubaSeiseki` (`Time`);--> statement-breakpoint
CREATE INDEX `IxShussoubaSeiseki2` ON `ShussoubaSeiseki` (`Ten3F`);--> statement-breakpoint
CREATE INDEX `IxShussoubaSeiseki3` ON `ShussoubaSeiseki` (`Agari3F`);--> statement-breakpoint
CREATE INDEX `IxShussoubaSeiseki4` ON `ShussoubaSeiseki` (`KishuId`);--> statement-breakpoint
CREATE TABLE `ShussoubaTsuukaJuni` (
	`Id` integer PRIMARY KEY NOT NULL,
	`ShussoubaId` integer NOT NULL,
	`Bangou` integer NOT NULL,
	`Juni` integer,
	`Joukyou` integer
);
--> statement-breakpoint
CREATE INDEX `IxShussoubaTsuukaJuni` ON `ShussoubaTsuukaJuni` (`ShussoubaId`);--> statement-breakpoint
CREATE TABLE `ShussoubaYosou` (
	`Id` integer PRIMARY KEY NOT NULL,
	`KolYosou1` integer,
	`KolYosou2` integer,
	`Rating` real,
	`Idm` real,
	`KishuShisuu` real,
	`JouhouShisuu` real,
	`OddsShisuu` real,
	`PaddockShisuu` real,
	`SougouShisuu` real,
	`BaguHenkouJouhou` integer,
	`Ashimoto` integer,
	`Kyakushitsu` integer,
	`KyoriTekisei` integer,
	`Joushoudo` integer,
	`Rotation` integer,
	`TokuteiJouhouHonmei` integer,
	`TokuteiJouhouTaikou` integer,
	`TokuteiJouhouTanana` integer,
	`TokuteiJouhouRenshita` integer,
	`TokuteiJouhouAna` integer,
	`SougouJouhouHonmei` integer,
	`SougouJouhouTaikou` integer,
	`SougouJouhouTanana` integer,
	`SougouJouhouRenshita` integer,
	`SougouJouhouAna` integer,
	`NinkiShisuu` integer,
	`ChoukyouShisuu` real,
	`KyuushaShisuu` real,
	`ChoukyouYajirushi` integer,
	`KyuushaHyouka` integer,
	`KishuKitaiRentairitsu` real,
	`GekisouShisuu` integer,
	`HidumeCode` integer,
	`OmoTekisei` integer,
	`ClassCode` integer,
	`SougouShirushi` integer,
	`IdmShirushi` integer,
	`JouhouShirushi` integer,
	`KishuShirushi` integer,
	`KyuushaShirushi` integer,
	`ChoukyouShirushi` integer,
	`GekisouShirushi` integer,
	`OddsShirushi` integer,
	`PaddockShirushi` integer,
	`ChokuzenSougouShirushi` integer,
	`ShibaTekisei` integer,
	`DirtTekisei` integer,
	`KakutokuShoukin` integer,
	`ShuutokuShoukin` integer,
	`JoukenClass` integer,
	`TenShisuu` real,
	`PaceShisuu` real,
	`AgariShisuu` real,
	`IchiShisuu` real,
	`PaceYosou` integer,
	`DouchuuJuni` integer,
	`DouchuuSa` real,
	`DouchuuUchiSoto` integer,
	`Agari3FJuni` integer,
	`Agari3FSa` real,
	`Agari3FUchiSoto` integer,
	`GoalJuni` integer,
	`GoalSa` real,
	`GoalUchiSoto` integer,
	`TenkaiKigou` integer,
	`KyoriTekisei2` integer,
	`GekisouJuni` integer,
	`LsShisuuJuni` integer,
	`TenShisuuJuni` integer,
	`PaceShisuuJuni` integer,
	`AgariShisuuJuni` integer,
	`IchiShisuuJuni` integer,
	`KishuKitaiTanshouRitsu` real,
	`KishuKitai3ChakunaiRitsu` real,
	`YosouKubun` integer,
	`SouhouZentai` integer,
	`SouhouAshidukai` integer,
	`SouhouKaiten` integer,
	`SouhouHohaba` integer,
	`SouhouAshiage` integer,
	`TaikeiZentai` integer,
	`TaikeiSenaka` integer,
	`TaikeiDou` integer,
	`TaikeiShiri` integer,
	`TaikeiTomo` integer,
	`TaikeiHarabukuro` integer,
	`TaikeiAtama` integer,
	`TaikeiKubi` integer,
	`TaikeiMune` integer,
	`TaikeiKata` integer,
	`TaikeiMaeNagasa` integer,
	`TaikeiUshiroNagasa` integer,
	`TaikeiMaeHaba` integer,
	`TaikeiUshiroHaba` integer,
	`TaikeiMaeTsunagari` integer,
	`TaikeiUshiroTsunagari` integer,
	`TaikeiO` integer,
	`TaikeiFuri` integer,
	`StartShisuu` real,
	`DeokureRitsu` real,
	`MankenShisuu` integer,
	`MankenShirushi` integer,
	`KoukyuuFlag` integer,
	`GekisouType` integer,
	`ShibaDirtShougaiFlag` integer,
	`KyoriFlag` integer,
	`ClassFlag` integer,
	`TenkyuuFlag` integer,
	`KyoseiFlag` integer,
	`NyuukyuuNansoume` integer,
	`NyuukyuuNengappi` integer,
	`NyuukyuuNannichimae` integer,
	`HoubokusakiId` integer,
	`HoubokusakiRank` integer,
	`KyuushaRank` integer,
	`CidChoukyouSoten` real,
	`CidKyuushaSoten` real,
	`CidSoten` real,
	`Cid` integer,
	`LsShisuu` real,
	`LsHyouka` integer,
	`Em` integer,
	`KyuushaBbShirushi` integer,
	`KishuBbShirushi` integer
);
--> statement-breakpoint
CREATE TABLE `TokubetsuMei` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`Meishou` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxTokubetsuMei` ON `TokubetsuMei` (`Meishou`);--> statement-breakpoint
CREATE TABLE `Uma` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`KolUmaCode` integer,
	`KettouTourokuBangou` text,
	`FamilyNumber` text,
	`KanaBamei` text,
	`EigoBamei` text,
	`KyuuBamei` text,
	`Seinen` integer,
	`Seinengappi` integer,
	`Keiro` integer,
	`Kesshu` integer,
	`SanchiCode` text,
	`Sanchi` integer,
	`SanchiMei` text,
	`Seibetsu` integer,
	`ChichiUmaId` integer,
	`HahaUmaId` integer,
	`MasshouFlag` integer,
	`MasshouNengappi` integer,
	`Jiyuu` text,
	`Ikisaki` text,
	`YunyuubaFlag` integer,
	`KyoriTekisei` integer,
	`OmoKousetsu` integer,
	`DirtKousetsu` integer,
	`ShibouNen` integer,
	`ChichiKeitouCode` integer,
	`HahaChichiKeitouCode` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `IxUma1` ON `Uma` (`KolUmaCode`);--> statement-breakpoint
CREATE UNIQUE INDEX `IxUma2` ON `Uma` (`KettouTourokuBangou`);--> statement-breakpoint
CREATE INDEX `IxUma3` ON `Uma` (`KanaBamei`);--> statement-breakpoint
CREATE INDEX `IxUma4` ON `Uma` (`EigoBamei`);