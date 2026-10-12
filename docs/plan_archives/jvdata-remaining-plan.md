# JV-Data・JRA-VAN 未対応レコードの取り込み計画

[jvdata-spec/](jvdata-spec/) と [jra-van-spec/](jra-van-spec/) のうち、取り込み処理のないレコード種別をすべて取り込む計画。速報系のみのレコード (WH・WE・AV・JC・TC・CC と開催速報の `.rtd`) は対象外。

## 1. 対象

### JRA-VAN (旧形式)

| ファイル | 内容 |
|---|---|
| JracTok1.dat | 特別登録馬 |

ほかの `Jrac*.dat` (Den1/2・Sei1/2/h・Hyo1〜6・Ods1/3〜6・Umaj・Kisi・Chok・Delu/k/c・Sch1) は取り込み済み。

### JV-Data

| ID | 内容 | データ種別 |
|---|---|---|
| TK | 特別登録馬 | TOKU |
| WF | 重勝式 (WIN5) | RACE (速報 0B51 もあり) |
| JG | 競走馬除外情報 | RACE |
| BN | 馬主マスタ | DIFF/DIFN・TCOV/TCVN・RCOV/RCVN |
| RC | レコードマスタ | DIFF/DIFN・TCOV/TCVN・RCOV/RCVN |
| BT | 系統情報 | BLOD/BLDN |
| DM | タイム型データマイニング予想 | MING (速報 0B13 もあり) |
| TM | 対戦型データマイニング予想 | MING (速報 0B17 もあり) |
| CK | 出走別着度数 | SNAP/SNPN |
| HC | 坂路調教 | SLOP |
| WC | ウッドチップ調教 | WOOD |
| HS | 競走馬市場取引価格 | HOSE/HOSN |
| HY | 馬名の意味由来 | HOYU |
| CS | コース情報 | COMM |

取り込み済み: RA・SE・HR・H1・H6・O1〜O6・UM・KS・CH・BR・HN・SK・YS。

## 2. 共通の進め方

- 各レコードは `src/app/reader/JRA/JVData/Jvdata*.ts` に `JvdataRecord` の派生クラスとして作り、`JvData.ts` に登録する。
- `JvData.ts` のクラスコメントにある「取り込み処理のないレコード種別(特別登録馬、坂路調教、マイニング予想など)は読み飛ばす」を、実態に合わせて直す。
- テストは `test/spec/jvdata.ts` (仕様書の項目名からレコードを作る仕組み) に乗せる。`spec.test.ts` のレコード長・読んだ範囲の検査が自動で効くので、値の突き合わせを `jvdata.test.ts` / `jravan.test.ts` に足す。
- テーブルは `src/app/entities/*.ts` を変えるだけ。マイグレーションは作らない。
- 段階ごとにコミットする。段階の終わりに `bun run typecheck` と `bun run lint`、関係するテストファイルだけを実行する。全体の `bun test` は push の前に 1 回。
- 最後に [plan_archives/jvdata.md](plan_archives/jvdata.md) の「取り込むレコード種別」の表を更新する。

## 3. 段階 1: 単純なマスタ (他に依存しない)

### HY 馬名の意味由来

- `Uma.BameiYurai` (text) を足す。
- 血統登録番号で馬を探し (なければ作る)、由来を入れる。馬名は UM と同じなので読まない。

### CS コース情報

- 新規 `CourseSetsumei`。主キーは (Basho, Kyori, Track, KaishuuNengappi)。列は Setsumei (text)。
- 競馬場コード・トラックコードは既存のコード変換を使う。

### BT 系統情報

- 新規 `Keitou`。系統ID (2 桁ずつ系譜を表す文字列) を主キーにし、Meishou・Setsumei を持つ。
- `Uma.KeitouId` (text) を足す。繁殖登録番号は `umaDao.findHanshokuba` で馬に直す。
- 既存の `Uma.ChichiKeitouCode` / `HahaChichiKeitouCode` は JRDB の系統コードで別物なので、そのまま残す。

### HS 競走馬市場取引価格

- 新規 `Shijou`: 主催者・市場コードを主キーにし、主催者名称・市場名称を持つ。
- 新規 `ShijouTorihiki`: 主キーは (UmaId, ShijouCode, KaishiNengappi)。ShuuryouNengappi・Nenrei・Kakaku (円) を持つ。
- 父・母の繁殖登録番号と生年は UM・HN・SK で取り込み済みなので読まない。

## 4. 段階 2: 馬主マスタ BN (構造の変更あり) — 済

出走馬と名前 (`Shoyuu`) をつないでいた `Banushi` をやめ、馬主を生産者 (`Seisansha` / `SeisanshaMei`) と同じ形にして、馬につなぐ。

- `Banushi`: Id, JvDataCode (6 桁), BanushiKaiCode (JRDB の馬主会コード。`Shoyuu` から移す), Fukushoku (服色標示)。
- `BanushiMei`: BanushiId, ShoyuuId, Kubun (`MeishouKubun`)。
- `UmaBanushi`: 主キーは (UmaId, Nengappi)。BanushiId。馬主は変わるので「その日の時点の馬主」を持つ。日付は出走馬ならレースの日、UM ならデータ作成年月日。
- 名前による突き合わせは `ShoyuushaDao` にまとめ、生産者と共用する。
- BN から取り込むもの: コード、法人格無の名前 (`tool.normalizeHoujinMei`)、半角カナ (フリガナ)、欧字名、服色。本年・累計成績は BR と同じく取り込まない。
- SE・UM の馬主コードと名前、KOL の正式名・略称、JRDB の名前と馬主会コードも、同じ馬主にまとめて `UmaBanushi` に入れる。

## 5. 段階 3: 調教 HC・WC → `Choukyou` — 済

`Choukyou` は調教 1 本を 1 行にする表なので (出走馬ごとのまとめは `ShussoubaHyouka`)、KOL の調教や JRDB の本追切と同じ行にまとめる。

- Type: HC は `ChoukyouType.Hanro`、WC は `ChoukyouType.WoodChip`。
- Basho: トレセン区分 1 (栗東) は栗東 (50)、0 (美浦) は美浦南 (51)。KOL・JRDB でも美浦の坂路・ウッドチップは美浦南なので、同じ調教が同じ行になる。
- WC のコース (A〜E) → `Course`。
- `Choukyou` に足す列:
  - `Jikoku`: 調教時刻 (HH:MM)
  - `MigiHidari`: 馬場周り
- 時計は KOL と同じく、`ChoukyouTime` にハロン数ごとの「残りのハロンの合計タイム」で入れる (1 ハロンは最後のラップ)。途中のラップは合計タイムの差なので取り込まない。
  - 測定不良 (`0000` / `000`) と 999.9 秒以上 (`9999` / `999`) は入れない。
- 行を決める方法: `ChoukyouDao.saveChoukyou` (KOL から移して共通化)。同じ馬・日・場所・種別の中で時計を突き合わせて Renban を決め、合うものがなければ新しい行にする。
  KOL と JV-Data では時計のあるハロンが違うので、両方にあるハロンだけを比べる。

## 6. 段階 4: データマイニング予想 DM・TM → `ShussoubaYosou` — 済

- `ShussoubaYosou` に足した列:
  - `DmKubun` / `TmKubun`: 予想の時点 (データ区分 1: 前日, 2: 当日, 3: 直前, 7: 成績)
  - `DmTime`: 予想走破タイム (秒)
  - `DmGosaPlus` / `DmGosaMinus`: 予想誤差 + / − (秒)
  - `TmScore`: 対戦型の予測スコア
- 取り込む順序によらず、データ区分の大きい (あとの時点の) 予想を残す。そのために時点の列を持つ。
- レースは `jvdataRaceTool.ensureRace` で作り、出走馬は馬番から ID を決めて、なければ作る。RA・SE が後から来ても同じ行に入る。

## 7. 段階 5: 特別登録馬 TK・Tok1 と競走馬除外 JG — 済

特別登録馬は出走馬ではない (馬番がなく、大半は出走しない) ので、`Shussouba` には入れない。

### 特別登録馬 (TK・Tok1 共通)

- `TokubetsuTourokuba`: 主キーは (RaceId, UmaId)。Renban, KyousoubaId, Kinryou, KouryuuKubun (JV-Data だけ) を持つ。
  - 連番は登録の変更でずれうるので、主キーは馬にした。
  - 調教師は `Kyousouba` に入れる (調教師コードと略称から `jraTool.saveChoukyoushi`)。
  - ハンデキャップ競走の負担重量は、データ区分 2 (ハンデ発表後) で入る。空白では既存の値を消さない。
  - 1 頭ぶんの保存は `jraTool.saveTokubetsuTourokuba` で、TK・Tok1 共通。
- レース側は RA と同じく、競走名・グレード・競走種別・記号・重量種別・条件・距離・トラックを入れる。
- `Race.HandiHappyoubi` (ハンデ発表日) を足した。
- Tok1 のコースレコード欄は、既存の `JravanRaceTool.createRaceWith` が出馬表・成績と同じく `Record` に入れる (段階 6 で `Record` を作り直すときに合わせて直す)。
- 取り込まないもの: 特別競走番号、競走名の副題・カッコ内・欧字、年齢別の競走条件、コース区分、TK の馬記号と調教師の東西所属。

### JG 競走馬除外情報

- `TouhyouJogaiba`: 主キーは (RaceId, UmaId, UketsukeJun)。ShussouKubun (出走区分), JogaiJoutai (除外状態区分) を持つ。

## 8. 段階 6〜8

### 段階 6: レコードマスタ RC (`Record` を作り直す) — 済

- `Record`: Shubetsu (コース / G1 / 距離の JRA レコード)、Nengappi、Time、Kubun (基準・レコード・参考・備考)、Basho、RaceId (レコードが出たレース)、Kyori、TrackCode、DirtShiba・MigiHidari・UchiSoto、KyousouShubetsuCode、TokubetsuBangou、Tenki、Baba。
- `RecordHoyuuba`: 主キーは (RecordId, UmaId)。Kinryou、KishuId (JRA-VAN・JV-Data)、TanshukuKishuMeiId (KOL)、ChoukyoushiId。同着で複数頭。
- 同じレコードは、種類・日付・場所・距離・タイムが同じ行にまとめる (`RecordDao.saveRecord`)。KOL・JRA-VAN のレースごとのレコードと RC が同じ行になる。
- KOL (出馬表・成績のコース・距離・G1 レコード) と JRA-VAN (コースレコード) は、距離・トラックをそのレースから入れる。KOL のレコードフラグ、JRA-VAN の騎手・調教師コード・天候・馬場も取り込む。
- `Race.CourseRecordId` / `KyoriRecordId` / `RaceRecordId` はそのまま。

### 段階 7: 重勝式 WIN5 WF — 済

- `Win5`: 主キーは開催日。Kubun (データ区分)、HatsubaiHyousuu、HenkanFlag・FuseiritsuFlag・TekichuuNashiFlag、CarryOverShoki・CarryOverZandaka。
- `Win5Race`: 主キーは (開催日, 何レース目)。RaceId, YuukouHyousuu。対象レースは、レースの行がなければ作る。
- `Win5Haraimodoshi`: 主キーは (開催日, Umaban1〜5)。Haraimodoshikin, TekichuuHyousuu (最大 243 組)。
- 詳細発表時 → 1 レース目確定時 → 払戻発表時 → 成績 (月曜) と何度も提供されるので、`Win5.Kubun` を比べて、前の時点のデータは読み飛ばす。
- データ区分 9 (重勝式中止) はレースの中止と意味が違うので、読み飛ばさず `Win5.Kubun` に残す (中止フラグの列は作らない)。

### 段階 8: 出走別着度数 CK (6870 バイト) — 済

出走時点の、馬・騎手・調教師・馬主・生産者それぞれの着度数と賞金。

その後、KOL・JRA-VAN のマスタの成績も同じ表に入れられるよう、表を (対象, 時点) ごとの形に作り直した。

- `Chakudosuu`: 主キーは (Taishou, TaishouId, Nengappi, Kikan, Bunrui)。
  - Taishou: 馬 / 騎手 / 調教師 / 馬主 / 生産者 / 種牡馬の産駒。TaishouId はそれぞれの表の Id (馬・種牡馬は Uma)。
  - Nengappi: 時点。CK と KOL の出馬表はレースの日、マスタはデータ作成年月日。同じ日の同じ騎手は、何レース騎乗しても 1 組の行。
  - Kikan: 累計 / 本年 / 前年。
  - Bunrui: 総合・中央・平地・芝・ダート・障害・地方交流・地方外国・トラック別・直線・産駒の年齢別・その日の競馬場コース、馬場状態別 (`babaBunrui`)、距離別 (`kyoriBunrui`。データ元ごとに違う距離の区切りから番号を作る)、競馬場別 (`keibajouBunrui`)。内容は `chakudosuuBunruiNaiyou` で引ける。
  - 回数: `Chaku1`〜`Chaku3` と `Chaku4Ika` (4 着以下) は必ず入れる。`Chaku4`・`Chaku5`・`Chakugai` (6 着以下) は JV-Data だけ。回数が全部 0 の分類は行を作らない。
- `ChakudosuuShuukei`: 主キーは (Taishou, TaishouId, Nengappi, Kikan)。本年・前年の年、賞金 (円)、脚質傾向 (JV-Data)、連対脚質別回数 (KOL)、登録レース数。
- 取り込むデータ元:
  - JV-Data: CK (レースの日の時点)、UM・KS・CH・BN・BR (データ作成年月日の時点。KS・CH は 本年・前年・累計 の順で、引退した人は 引退年・引退前年・累計 なので、年は `ChakudosuuShuukei.Nen` で分かる)
  - JRA-VAN: 競走馬 (賞金・着回数の累計)、騎手・調教師 (生涯・本年・前年)
  - KOL: 騎手・厩舎 (通算累計・本年・昨年)、競走馬 (成績と賞金)、種牡馬 (産駒の本年・昨年)、出馬表出走馬 (場所別成績。KD3 だけ)
  - JRDB: 競走馬拡張データ (KKA) の生涯成績 (JRA 成績は中央、交流成績・他成績は `JrdbKouryuu`・`JrdbSonota`)。レースの日の時点。
- KKA の今回のレースの条件で絞った着度数は、時点の表に合わないので、出走馬ごとの `ShussoubaJoukenChakudosuu` に入れる。

## 9. 決めること

1. ~~CK を全項目取り込むか~~。全項目を取り込んだ。
2. ~~SE の馬主コードで出走馬を馬主マスタにつなぐか~~。馬主マスタは出走馬ではなく馬 (`UmaBanushi`) につなぐことにした。
3. ~~美浦の HC・WC の Basho~~。美浦南 (51) にした (KOL・JRDB と同じ)。

## 10. 順序

段階 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8。段階 8 は段階 2 に、段階 5 の Tok1 のコースレコードは段階 6 に依存する。それ以外の段階は独立していて、入れ替えてよい。
