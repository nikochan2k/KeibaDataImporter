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

## 4. 段階 2: 馬主マスタ BN (構造の変更あり)

今の `Banushi` は出走馬と名前 (`Shoyuu`) をつなぐ表で、馬主そのものを表す表がない。生産者 (`Seisansha` / `SeisanshaMei`) と同じ形に組み替える。

- 今の `Banushi` を `ShussoubaBanushi` に改名する (ShussoubaId, ShoyuuId, Kubun)。`BanushiDao` と閲覧 (`BrowseService`) の参照も直す。
- 新 `Banushi`: Id, JvDataCode (6 桁), Fukushoku (服色標示)。
- 新 `BanushiMei`: BanushiId, ShoyuuId, Kubun (`MeishouKubun`)。
- BN から取り込むもの: コード、法人格無の名前 (`tool.normalizeHoujinMei`)、半角カナ (フリガナ)、欧字名、服色。本年・累計成績は BR と同じく取り込まない。
- SE の馬主コードで `ShussoubaBanushi` を `Banushi` につなぐかは「9. 決めること」の 2。

## 5. 段階 3: 調教 HC・WC → `Choukyou`

`Choukyou` は調教 1 本を 1 行にする表なので (出走馬ごとのまとめは `ShussoubaHyouka`)、KOL の調教や JRDB の本追切と同じ行にまとめる。

- Type: HC は `ChoukyouType.Hanro`、WC は `ChoukyouType.WoodChip`。
- Basho: トレセン区分 0 (美浦) / 1 (栗東) から決める。美浦の割り当ては「9. 決めること」の 3。
- WC のコース (A〜E) → `Course`。
- `Choukyou` に足す列:
  - `Jikoku`: 調教時刻 (HHMM)
  - `MigiHidari`: 馬場周り
- 時計は `ChoukyouTime` に 1 ハロンごとに入れる (ハロンの合計タイムとラップの両方を持つ)。
  - 測定不良 (`0000` / `000`) は null にする。
  - 999.9 秒以上 (`9999` / `999`) も null にする。
- 行を決める方法: 同じ馬・日・場所・種別の中で、`KolChoukyouTool.findRenban` と同じように時計を突き合わせて Renban を決める。合うものがなければ新しい行にする。突き合わせの処理は共通化して、KOL と JV-Data の両方で使う。

## 6. 段階 4: データマイニング予想 DM・TM → `ShussoubaYosou`

- `ShussoubaYosou` に足す列:
  - `DmYosouTime`: 予想走破タイム (秒)
  - `DmGosaPlus`: 予想誤差 + (秒)
  - `DmGosaMinus`: 予想誤差 − (秒)
  - `TmScore`: 対戦型の予測スコア
- データ区分 1 (前日)・2 (当日)・3 (直前)・7 (成績) は、後から来たもので上書きする。
- レースは `jvdataRaceTool.ensureRace` で作り、出走馬は馬番で探す (なければ作る)。RA・SE が後から来ても同じ行に入るようにする。

## 7. 段階 5: 特別登録馬 TK・Tok1 と競走馬除外 JG

特別登録馬は出走馬ではない (馬番がなく、大半は出走しない) ので、`Shussouba` には入れない。

### 特別登録馬 (TK・Tok1 共通)

- 新規 `TokubetsuTourokuba`: 主キーは (RaceId, Renban)。KyousoubaId, Kinryou, KouryuuKubun を持つ。
  - 調教師は `Kyousouba` に入れる (調教師コードと略称から `jraTool.saveChoukyoushi`)。
  - データ区分 2 (ハンデ発表後) で負担重量を上書きする。
  - 1 レコードで最大 300 頭 (Tok1 は 100 頭)。空の連番は読み飛ばす。
- レース側は `ensureRace` で作り、競走名・グレード・競走種別・記号・重量種別・条件・距離・トラック・コース区分を入れる。RA と同じ項目は RA の処理を共通化して使う。
- `Race.HandiHappyoubi` (ハンデ発表日) を足す。
- Tok1 の JRA-VAN 形式は `src/app/reader/JRA/JRAVAN/JravanTok1.ts` に作る。Tok1 のコースレコード欄は段階 6 の `Record` に入れる。

### JG 競走馬除外情報

- 新規 `Jogaiba`: 主キーは (RaceId, KyousoubaId, UketsukeJun)。ShussouKubun (出走区分), JogaiJoutai (除外状態区分) を持つ。

## 8. 段階 6〜8

### 段階 6: レコードマスタ RC (既存の `Record` を作り直す)

今の `Record` (KOL 用: Nengappi, Time, UmaId, Kinryou, 騎手, Basho) では、RC の項目が入りきらない。

- `Record`: Id, Shikibetsu (1: コース / 2: G1), RaceId, Basho, TokubetsuBangou, KyousouShubetsu, Kyori, Track, RecordKubun, Time, Tenkou, Baba。
- 新規 `RecordHoyuuba`: RecordId, UmaId, Kinryou, KishuId, ChoukyoushiId (同着を考えて最大 3 頭)。
- `KolRaceTool.getRecord`、`RaceDao.saveRecord`、`Race.CourseRecordId` / `KyoriRecordId` / `RaceRecordId` と閲覧の参照を新しい構造に合わせる。
- Tok1 のコースレコード欄もここに入れる。

### 段階 7: 重勝式 WIN5 WF

- 新規 `Win5`: 主キーは開催年月日。HatsubaiHyousuu、HenkanFlag・FuseiritsuFlag・TekichuuNashiFlag、CarryOverShoki・CarryOverZandaka、ChuushiFlag。
- 新規 `Win5Race`: 主キーは (Win5Id, Jun 1〜5)。RaceId, YuukouHyousuu。
- 新規 `Win5Haraimodoshi`: Win5Id, Umaban1〜5, Haraimodoshikin, TekichuuHyousuu (最大 243 組)。
- データ区分 9 (重勝式中止) はレース中止と意味が違うので、`isActive` で読み飛ばさず `ChuushiFlag` に残す。

### 段階 8: 出走別着度数 CK (6870 バイト)

出走時点の、馬・騎手・調教師・馬主・生産者それぞれの着度数と賞金。

- 新規 `Chakudosuu` (縦持ち): 主キーは (ShussoubaId, Taishou, Bunrui)。Chaku1〜Chaku5, Chakugai を持つ。
  - Taishou: 馬 / 騎手 / 調教師 / 馬主 / 生産者 (enum)
  - Bunrui: 総合・中央合計・馬場別・馬場状態別・距離別・競馬場別・脚質・本年・累計 など (enum)
- 賞金 (平地・障害の本賞金・付加賞金・収得賞金の累計、騎手などの本年・累計) は新規 `ChakudosuuShoukin` に、同じキーで入れる。
- 騎手・調教師・馬主・生産者のコードと名前は SE と重なるので、つなぐためだけに使う。
- 段階 2 の馬主マスタに依存する。

## 9. 決めること

1. **CK を全項目取り込むか**。馬の着度数の大半は、取り込んだ成績から計算できる。最も作業量が大きい。指示が「全部」なので、全項目を推奨する。
2. **SE の馬主コードで出走馬を馬主マスタにつなぐか**。名前の表記ゆれに強くなるので、つなぐことを推奨する (`ShussoubaBanushi.BanushiId` を足す)。
3. **美浦の HC・WC の Basho**。JV-Data は美浦の南・北を区別しない。KOL の 美浦南 (51) / 美浦北 (52) に施設ごとの固定の対応で割り当てるか、新しい「美浦」コードを作るか。施設の実際の位置を確かめたうえで、固定の対応を推奨する。

## 10. 順序

段階 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8。段階 8 は段階 2 に、段階 5 の Tok1 のコースレコードは段階 6 に依存する。それ以外の段階は独立していて、入れ替えてよい。
