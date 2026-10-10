# JRDB 変換処理 修正計画

作成日: 2026-10-10
対象: `src/app/reader/JRDB/` 以下と、そこから使っている共通処理 (`src/app/reader/*.ts`, `src/app/converters/*.ts`, `src/app/Importer.ts`)

## 1. 調査方法

[JRDB データ仕様書ページ](https://jrdb.com/data_introduction/) と、`https://jrdb.com/program/` 配下の仕様書・コード表を取得し、各リーダーのオフセット・長さ・型・コード変換を突き合わせた。

### 参照した仕様書（版・日付）

| データ | 仕様書 | 版 / 日付 | 対応クラス |
|---|---|---|---|
| KYI/KYH/KYG 競走馬 | Kyi/kyi_doc.txt, Kyh/kyh_doc.txt, Kyg/kyg_doc.txt | 第11版a 2023.06.25 / 第10版 2014.01.09 / 第10版 2007.10.22 | `Ky$`, `Kyi`, `Kyh`, `Kyg` |
| BAC 番組 | Bac/bac_doc.txt | 第4版d 2017.12.30 | `Ba$`, `Bac` |
| KAB 開催 | Kab/kab_doc.txt | 第3版c 2015.09.18 | `Ka$`, `Kab` |
| SED/SEC 成績 | Sed/sed_doc.txt, Sec/secsoku_doc.txt | 第4版a 2022.08.22 / 第4版 | `Se$`, `Sed`, `Sec` |
| SKB 成績拡張 | Skb/skb_doc.txt | 第3版a 2016.12.30 | `Skb` |
| SRA/SRB 成績レース | Sra/sra_doc.txt, Srb/srb_doc.txt | 第2版 / 第2版b 2015.06.01 | `Sr$`, `Sra`, `Srb` |
| TYB 直前情報 | Tyb/tyb_doc.txt | 第4b版 2022.08.22 | `Tyb` |
| HJC 払戻 | Hjc/hjcdata_doc.txt | 第4a版 2024.09.29 | `Hj$`, `Hjc` |
| CHA 調教本追切 | Cha/cha_doc.txt | 第1版c 2017.02.10 | `Cha` |
| CYB 調教分析 | Cyb/cyb_doc.txt | 第2版e 2019.05.17 | `Cy$`, `Cyb` |
| OZ/OU/OT/OV 基準オッズ | Oz/Ozdata_doc.txt, Ou/Oudata_doc.txt, Ot/Otdata_doc.txt, Ov/ovdata_doc.txt | 第1版 / 第2版a 2023.12.02 / 第2版 / 第2版a 2023.12.02 | `Oz`, `Ou`, `Ot`, `Ov` |
| UKC 馬基本 | Ukc/ukc_doc.txt | 第3版 2002.08.20 | `Ukc` |
| KZA/KSA 騎手 | Ks/Ks_doc1.txt | 第1版c 2023.10.20 | `K$$`, `K$a` |
| CZA/CSA 調教師 | Cs/Cs_doc1.txt | 2001.05.16 | `C$$`, `C$a` |
| ZEC/ZKB/ZED 前走 | Zec/zec_doc.txt, Zkb/zkb_doc.txt, Zed/zed_doc.txt | SEC/SKB/SED と同一フォーマット | `Zec`, `Zkb`（ZED は未対応） |
| JO 情報 | Jo/Jodata_doc.txt | 第1版 1998.10.18（JOA の仕様は非公開） | `Joa` |
| コード表 | jrdb_code / tokki_code / bagu_code / ashimoto_code / keito_code / cyokyo_course_code / oi_code | 2019.05.26 / **2026.04.13** / 2024.07.12 / 2017.02.20 / 2003.05.15 / 2009.10.09 / 2008.09.28 | `converters/*` |

### 公開仕様では確認できなかったもの

- **OW（ワイド基準オッズ）**: 仕様書の URL が見つからなかった。レコード長 780 = 10 + 5×153 + 予備 3 + 改行 2 と推定され、現在の実装と矛盾はない。
- **JOA**: 公開されているのは JO 第1版（91 バイト）だけ。先頭から EM までのオフセットは一致したが、`厩舎BB印`(89)・`騎手BB印`(100) は確認できない。
- **BAB / KAA / HJA / CYA / KYG**: 旧版。KYG 以外は仕様書が公開されていない。
- **BAC のレコード長**: 仕様書の見出しは 176BYTE だが、項目を積み上げると 184BYTE（改行の位置は 183）。実装は 184 を使っている。実ファイルで確認したい。

## 2. 指摘一覧（優先度別）

優先度の目安:
- **P0**: DB の破損や、別レコードの上書き・欠落を起こす
- **P1**: 取り込んだ値が誤っている（10倍ずれる、コードの誤変換など）
- **P2**: 仕様の更新に追随していない、または取り込まれない
- **P3**: 軽微な誤り、ラベルの更新、デッドコード

### P0: データ破損・欠落

| # | 場所 | 内容 | 修正案 |
|---|---|---|---|
| P0-1 | [KaisaiTool.ts:48](../src/app/reader/KaisaiTool.ts#L48) `generateKaisaiKeyWith` | 開催キー（Kaisai.Key）に**場コードが含まれていない**（下位 7 ビットが空のまま）。過去のリファクタで開催 ID と開催キーを分けた際に `+ info.basho` が抜け落ちた。`getKaisaiWithKey` は Key だけで検索して `Id DESC` の先頭を返すため、同じ日に回次・日次が同じ別場（例: 4回東京1日と4回京都1日）を取り違える。さらに `saveOrUpdate` は `Id` を含む差分で UPDATE するため、**他場の Kaisai 行の主キーを書き換えてしまう**。 | `generateKaisaiKeyWith(nen, kaiji, nichiji, basho)` に `+ basho` を加える。既存データの Key を再計算する移行 SQL を用意する。 |
| P0-2 | [OddsHaitouTool.ts:48](../src/app/reader/OddsHaitouTool.ts#L48) `calculateOddsHaitouId` | ID 内の「確定」は 2 ビットだが、`Kakutei` 列挙型は 0〜4 を取る（`Kakutei.Kakutei = 4`）。`RaceId·2^21 + 4·2^19 = (RaceId+1)·2^21` となり、**レース N の確定配当・確定オッズが、レース N+1 の予想オッズ（Kakutei=0）と同じ ID になる**。 | 確定を 3 ビットに広げる（合計 50 ビット、Number で安全に扱える範囲）。OddsHaitou の ID を全件振り直す移行、または OddsHaitou を全件削除して再取り込みする。 |
| P0-3 | [OddsHaitouTool.ts:62](../src/app/reader/OddsHaitouTool.ts#L62) `saveOddsHaitou` | `saveOrUpdate(OddsHaitou, toBe, asIs)` の**引数が逆**（正しくは `asIs, toBe`）。既存行があると「旧値との差分」を UPDATE するだけなので、**オッズ・配当が一度入ると二度と更新されない**（金曜→土曜の KYI 更新や、KYI→OZ の上書きも効かない）。 | `saveOrUpdate(OddsHaitou, asIs, toBe)` に直す。 |
| P0-4 | [Importer.ts:156](../src/app/Importer.ts#L156) | SKB のパターンが `/seb\d+\.txt$/` になっていて、**SKB ファイルが一度も取り込まれない**。 | `/skb\d+\.txt$/i` に直す（旧 SEB は SED 系の旧名なので、SKB クラスに割り当てるのは誤り）。 |
| P0-5 | [Ky$.ts:122](../src/app/reader/JRDB/Ky$.ts#L122) と [Kyi.ts:26](../src/app/reader/JRDB/Kyi.ts#L26) | `Kyi`/`Kyh` の `setShussoubaYosou` は async だが、呼び出し側が `await` していない。`Kyi` 内では `houbokusakiDao.save` を await した後に `HoubokusakiId`・`HoubokusakiRank`・`KyuushaRank` を設定しているため、`saveOrUpdate` に**間に合わず欠落する**。 | 基底の `setShussoubaYosou` を `async` にして、呼び出し側で `await` する。`Cy$.setChoukyou`・`Se$.setShussoubaSeiseki` も同じ形にそろえる。 |
| P0-6 | [Hjc.ts:32](../src/app/reader/JRDB/Hjc.ts#L32), [Hjc.ts:50](../src/app/reader/JRDB/Hjc.ts#L50) | 3連複・3連単払戻: (a) オフセットが **1 ずれている**（仕様の相対 300/342 は 1 始まりなので、0 始まりでは 299/341）、(b) 3連単の件数が **3 件しか読まれていない**（仕様は 6 件）、(c) どちらも **`Baken.Umatan` として保存**しており、馬単の払戻を上書きする。 | offset を 299 と 341 に、3連単の件数を 6 に、Baken を `Sanrenpuku`・`Sanrentan` に直す。 |
| P0-7 | [Oz.ts:78](../src/app/reader/JRDB/Oz.ts#L78) `saveUmaren` | 馬連の基準オッズを **`Baken.Wide`** で保存している。OW のワイド基準オッズと ID が衝突し、互いに上書きする。 | `Baken.Umaren` に直す。 |
| P0-8 | [KaisaiTool.ts:97](../src/app/reader/KaisaiTool.ts#L97) `setYoubi` | `new Date(Nen, Gatsu, Nichi)` で**月が 1 ずれる**（JavaScript の月は 0 始まり）。BAC/KYI などで Kaisai を作るたびに誤った曜日が計算され、KAB が入れた正しい曜日を上書きする。 | `new Date(Nen, Gatsu - 1, Nichi)` に直す。既存データの Youbi を再計算する。 |
| P0-9 | [Tyb.ts:36](../src/app/reader/JRDB/Tyb.ts#L36) | 出走馬が見つからないと `shussouba.Id` で TypeError になり、そのファイルの残りの行が取り込まれない。 | null のときは警告を出してスキップする。 |
| P0-10 | [DataToImport.ts:31](../src/app/reader/DataToImport.ts#L31) `readAll` | `transaction(await (async () => {...}))` は関数を渡しているだけで、中の処理はトランザクション用の `EntityManager` を使っていない。**トランザクションが実質的に効いていない**（途中で失敗すると中途半端な状態で残る）。 | `transaction(async (manager) => ...)` にして manager を引き回すか、明示的に QueryRunner でトランザクションを管理する。性能面の影響（SQLite では一括コミットのほうが速い）も確認する。 |
| P0-11 | [UmaDao.ts:47](../src/app/daos/UmaDao.ts#L47) `getKyousouba`（JRDB の `Ky$`・`Se$`・`Ukc` から使用） | `.where("k.UmaId = umaId")` の `:` が抜けていて、`umaId` が列名（= `k.UmaId` 自身）と解釈され、**条件が常に真になる**。性別・馬記号・調教師が一致する**別の馬の Kyousouba を返し**、Shussouba.KyousoubaId が誤った馬を指す。 | `.where("k.UmaId = :umaId")` に直す。Kyousouba と Shussouba.KyousoubaId を作り直す（KYI/UKC を再取り込み）。 |
| P0-12 | [Se$.ts:208](../src/app/reader/JRDB/Se$.ts#L208) `teardown` | `rows.forEach(async ...)` を待っていないため、TimeSa の UPDATE が後続処理や接続の終了と競合する。 | `for...of` と `await` に直す。 |

### P1: 値の誤り

| # | 場所 | 内容 | 修正案 |
|---|---|---|---|
| P1-1 | [Se$.ts:101](../src/app/reader/JRDB/Se$.ts#L101) | 走破タイムの形式は「1 バイト目: 分、2〜4 バイト目: 秒（0.1 秒単位）」。`readPositiveDouble(...,0.1)` で読んでいるため、**1:34.5 が 134.5 秒になる**。`Ten3FIkou`/`Agari3FIzen`/`Douchuu`/`TimeSa` もすべて誤る。 | KOL と同じく `readTime(buffer, 143, 4)` を使う。過去の SED/SEC/ZEC を再取り込みする。 |
| P1-2 | [JrdbOddsHaitouTool.ts:29](../src/app/reader/JRDB/JrdbOddsHaitouTool.ts#L29) | `saveOddsNinki` が一律に `×0.1` している。呼び出し元（KYI 基準オッズ `ZZ9.9`、SED 確定/10時オッズ `ZZZ9.9`、TYB オッズ `ZZZ9.9`）はどれも**小数点付き**なので、**値が 1/10 になる**。 | 倍率を引数で受け取る（既定は 1）。KYI/SED/TYB は倍率なしで読む。 |
| P1-3 | [Oz.ts:52](../src/app/reader/JRDB/Oz.ts#L52), [Oz.ts:70](../src/app/reader/JRDB/Oz.ts#L70) | OZ の複勝・馬連は `ZZ9.9`（小数点付き）なのに `×0.1` している（単勝は倍率なしで正しい）。 | 倍率を外す。 |
| P1-4 | [Se$.ts:78](../src/app/reader/JRDB/Se$.ts#L78) | レースペース指数 `ZZ9.9` に `×0.1` している。 | 倍率を外す。 |
| P1-5 | [Se$.ts:148](../src/app/reader/JRDB/Se$.ts#L148) | 気配コードを **`bataiCode`（馬体コード）** で変換している。 | `$S.kehaiCode` に直す。 |
| P1-6 | [Common.ts:145](../src/app/converters/Common.ts#L145) `touzaiBetsu` と [C$$.ts:20](../src/app/reader/JRDB/C$$.ts#L20) | JRDB の所属コードは **1:関東, 2:関西, 3:他** だが、`jrdb: "1"` を関西（Nishi）に割り当てている。調教師の東西が逆になる。 | JRDB 側の対応を `Higashi: "1"`, `Nishi: "2"` に直す（KOL 側の対応は変えない）。CZA/CSA を再取り込みする。 |
| P1-7 | [ShussoubaYosou.ts:9](../src/app/converters/ShussoubaYosou.ts#L9) `shirushi` | JRDB の印コードは `1:◎ 2:○ 3:▲ 4:注 5:△ 6:△ 9:☆`。`"4"` を **×** に割り当てていて、注が無い。☆(9) も無い。 | 「注」と「☆」を追加し、`"4"` を注に直す。KOL の `"4"`(×) は別エントリに残す。 |
| P1-8 | [ShussoubaYosou.ts:103](../src/app/converters/ShussoubaYosou.ts#L103) `yusouKubun` | 輸送区分の「不明」は仕様では **0**。`"5"` を不明に割り当てている。 | `jrdb: "0"` に直す。 |
| P1-9 | [Choukyou.ts:323](../src/app/converters/Choukyou.ts#L323) `oiJoutai` | 追い状態は **2 桁のコード**（`01`〜`09`）。`jrdb: "1"`〜`"9"` と完全一致で比べているため、01〜09 がすべて null になる。 | `"01"`〜`"09"` に直す。 |
| P1-10 | [Choukyou.ts:153](../src/app/converters/Choukyou.ts#L153) `type` | 調教コースコードの `25`（函館Ｗ）、`62`（北障害）、`68`（美障害ダ）がどの種類にも当たらず null になる。 | 25 を WoodChip に、62・68 を Shougai に追加する。 |
| P1-11 | [Reader.ts](../src/app/reader/Reader.ts) `readInt` | 馬体重増減は `XZ9`（符号 + 数字 2 桁、十の位が 0 なら空白）なので、`"+ 2"` → `parseInt` が NaN になり、**増減が ±9 以内のときは null になる**。KYI(399)・SED(335)・TYB(91) が該当する。 | 符号付きの数値を読む関数（空白を除いてから `parseInt`）を追加して使う。 |
| P1-12 | [Ka$.ts:39](../src/app/reader/JRDB/Ka$.ts#L39), [Ka$.ts:50](../src/app/reader/JRDB/Ka$.ts#L50) | 芝・ダートの馬場差を `readPositiveDouble` で読んでいるため、**負の値と 0 が捨てられる**（仕様の注記に「数字は "-" マイナス記号有り」とある）。`×0.1` の単位も要確認。直線馬場差も 0 を捨てている。 | `readDouble` にする。単位は実データで確認する（§4）。 |
| P1-13 | [Skb.ts:43](../src/app/reader/JRDB/Skb.ts#L43), [Skb.ts:46](../src/app/reader/JRDB/Skb.ts#L46) | 脚元コードの「総合」は相対 69（0 始まりで 68）、「左前」は相対 78（同 77）なのに、69・78 を読んでいる（右前・左後・右後は正しい）。 | 68 と 77 に直す（P2-1 で呼び出しを有効にするのと同時に直す）。 |
| P1-14 | [RaceTool.ts:83](../src/app/reader/RaceTool.ts#L83) `saveRaceLapTime` | 距離が 200 で割り切れないとき、1 ハロン目は 100m（1150m なら 150m）。2 区間目以降の `KaishiKyori` を 0 起点で +200 しているので 100m ずれる。また 150m のケースを 100m と判定する。 | Race.Kyori から端数（`Kyori % 200`）を求めて 1 区間目の長さを決め、以降はその終点から 200m ずつ進める。 |
| P1-15 | [Ukc.ts:31](../src/app/reader/JRDB/Ukc.ts#L31) | **血統登録番号（0, 8）を Uma に設定していない**。`UmaDao.getUma` は馬名でも OR 照合するので二重登録にはなりにくいが、同名の別馬（再使用された馬名、父母馬との同名など）を同一馬として扱ってしまう。 | `uma.KettouTourokuBangou = readStr(buffer, 0, 8)` を追加する。 |
| P1-16 | [Tool.ts:57](../src/app/reader/Tool.ts#L57) `getDaysFrom1970With` | ローカルタイムで日数を計算しているため、実行環境のタイムゾーンによって開催 ID（つまりレース ID・出走馬 ID）が変わる（JST では小数部 0.375 を含み、128 倍して整数になっているだけ）。 | `Date.UTC(nen, gatsu-1, nichi) / 86400000` にする。**既存 ID がすべて変わる**ので、P0-1/P0-2 の移行とまとめて行うか、`TZ=Asia/Tokyo` を固定して現状を維持するかを決める。 |

### P2: 仕様更新への未対応・未取り込み

| # | データ | 内容 | 修正案 |
|---|---|---|---|
| P2-1 | KYI / SKB | `saveShussoubaJoutaiSeries`（KYI の体型総合・馬特記、SKB の特記・馬具・脚元・分析用データ）が**どこからも呼ばれていない**。KYI 側は `await` も無い。 | `saveShussoubaRelated` から呼ぶ。コードが空白の欄はスキップする（今のままだと Code が null で保存される）。 |
| P2-2 | KYI 第11版a (2023.06.25) / KSA 第1版c (2023.10.20) | 見習い区分に **4:★(4K減)、9:◇(2K減)** が追加された。`Kishu.minaraiKubun` に無く、KYI 側は読み込みがコメントアウトされている（しかも存在しない `$S.minaraiKubun` を参照している）。KSA の見習い区分(79)・所属コード(62) も取り込んでいない。 | `minaraiKubun` に 4 と 9 を追加し、KYI(186)・TYB(68)・KSA(79) で取り込む。 |
| P2-3 | 特記コード表 2026.04.13 | **945〜998** が追加された（Ｃ逆手前、坂上失速、遠征ダメ、関西向き 等）。 | `ShussoubaJoutai.tokki` に追加する。 |
| P2-4 | 馬具コード表 2024.07.12 | **000（ノーマルハミ）、031（ミックレム頭絡）、098（タンプレートハミ）、099（耳栓）** が無い。 | `bagu` に追加する。 |
| P2-5 | CYB 第2版d/e (2019) | **一週前追切指数**(86, 3)・**一週前追切コース**(89, 2) を取り込んでいない。 | エンティティにカラムを追加して取り込む。 |
| P2-6 | SED 第4版a (2022.08) | **発走時間**(370, 4) を取り込んでいない。そのほか未取り込み: 前3F先頭差(316)・後3F先頭差(319)・1(2)着タイム差(255)・コース(339)・備考(264)・Race 系の項目（距離・頭数等。BAC が無い過去レースで必要）。 | 必要な項目から追加する。SED 単独でも Race が埋まるよう `setRace` を実装する。 |
| P2-7 | TYB 第4a/4b版 | 脚元情報(46)・負担重量(65)・見習い区分(68)・馬場状態(69)・天候(71)・オッズ取得時間(84)・**馬体コード(97)・気配コード(98)・発走時間(99)** を取り込んでいない。 | 追加する（`ashimotoJouhou` コンバータは既にある）。 |
| P2-8 | Importer | **ZED**（SED 形式の前走データ）、**KKA**（競走馬拡張）、**KTA**（登録馬）、**MZA/MSA**（抹消馬）のリーダーが無い。 | ZED は `Sed` を継承した `Zed` を追加する。KKA/KTA/MSA は必要性を判断してから対応する。 |
| P2-9 | SED/ZEC/ZED の地方・外国レース | 地方・外国のレースキーは「回 = 月を英字変換、日 = 日を英字変換」になる（SED 特記事項）。`readPositiveInt`/`readHex` では正しく解釈できず、Kaisai の Kaiji/Nichiji/Key が壊れる。 | 場コードが中央（01〜10）以外のときは回・日を使わず、年月日から開催を決める。英字変換の規則は実データで確認する。 |
| P2-10 | コード表 jrdb_code 2019.05.26 | 馬体コード **7:緩い**、気配コード **7:チャカ, 8:イレチ** が無い。種別コード **20:障害, 99:その他** が `joukenNenreiSeigen` に無い（障害戦の年齢条件が null になる）。BAC の右左 9:他、内外 3:直ダ・9:他 も無い。 | 追加する。 |
| P2-11 | SRB トラックバイアス | ダートは `1:有利 2:普通 3:不利` で芝と意味が違うのに、芝用のコンバータで一律に変換している。 | 芝ダ（Race.DirtShiba）で使うコンバータを切り替えるか、ダート用のコード値を分ける。 |
| P2-12 | 速報版 SED | 速報版は正式版と同じファイル名で、多くの項目が空白になる。空白は null になり `saveOrUpdate` で上書きされるため、正式版の後に速報版を取り込むとデータが消える。 | 運用ルールとして明記するか、速報版の判定（IDM が空白など）をして null を `undefined` 扱いにする。 |

### P3: 軽微な誤り・ラベル・デッドコード

| # | 場所 | 内容 |
|---|---|---|
| P3-1 | [JrdbTool.ts:25](../src/app/reader/JRDB/JrdbTool.ts#L25) `getDateFromFilename` | `yyyymmdd` が未初期化のまま `+=` しているので必ず NaN になる。未使用なので削除する。 |
| P3-2 | [Tool.ts:93](../src/app/reader/Tool.ts#L93) `normalizeHoujinMei` | 正規表現が `¥(株¥)` になっていて（`\` ではなく `¥`）、`(株)`・`(有)` が除去されない。`/\(株\)|㈱|株式会社/` に直す。 |
| P3-3 | [Reader.ts:25](../src/app/reader/Reader.ts#L25) `normalize` | 濁点付き半角カナの置換が `replace(string)` なので、各文字の最初の 1 箇所しか変換されない。`replaceAll` にする。 |
| P3-4 | `Shussouba.classCode`, `ShussoubaYosou.joukenGroup`, `kyuushaRank` | ラベルが旧表記のまま（1600万→3勝、1000万→2勝、500万→1勝、準オープン→3勝クラス、厩舎ランク 5 は「ノーマル」）。コード値は正しい。 |
| P3-5 | [Ky$.ts:87](../src/app/reader/JRDB/Ky$.ts#L87) | `banushiDao.save` を `await` していない。 |
| P3-6 | `Ky$` 激走印(332) | 仕様は「1:激走馬」のフラグなのに、印コードとして変換している（値 1 → ◎）。 |
| P3-7 | `Ky$` 道中差・後3F差・ゴール差 | 単位は「半馬身（約 0.1 秒）」で、`readPositiveDouble` のため 0 が null になる。順位 1 位の差 0 を残したいなら `readDouble` にする。 |
| P3-8 | `Ky$` ブリンカー(170) | 1:初装着 / 2:再装着 / 3:ブリンカーの区別を捨てている（`Shussouba.blinker` コンバータはある）。 |
| P3-9 | `Ou`/`Ot`/`Ov` | 取消時の値 `9999.9`（OV は `9999999`）をそのままオッズとして保存している。スキップする。 |
| P3-10 | [C$$.ts](../src/app/reader/JRDB/C$$.ts) | `if (!toBe.ShozokuBasho)` は京都（code 0）を偽と判定する。`== null` で比べる。 |
| P3-11 | `Ba$` | 発走時刻が空白だと `"null:null"` になる。 |
| P3-12 | [Ukc.ts:38](../src/app/reader/JRDB/Ukc.ts#L38) | `uma.Seibetsu` を 2 回代入している。馬主名(177)・馬主会(217) は未取り込み。 |

## 3. 実施計画

### フェーズ 0: テスト基盤（先にやる）

プロジェクトにはテストが無い。オフセットの修正を安全に行うため、先に最低限のテストを用意する。

1. `bun test` を使う。`test/fixtures/` に JRDB 公式サンプル（KYI150712, SED080913, SKB020908, TYB210912, HJC240929, CSA020907, KSA020907）から数レコードずつ置く。ライセンス上の扱いは要確認。難しければ仕様どおりに組み立てた合成レコードで代用する。
2. DB に触れない部分（Reader 関数、`Codes` の変換、各リーダーの `set*` メソッド）を、エンティティを作って値を比べる形でテストする。
3. ID 計算（Kaisai/Race/Shussouba/OddsHaitou）の単体テストを追加する。

### フェーズ 1: P0 の修正 + データ移行

1. P0-3（引数の順）、P0-4（SKB パターン）、P0-6（HJC）、P0-7（OZ 馬連）、P0-8（曜日）、P0-9（TYB null）、P0-11（Kyousouba 照合）、P0-12（teardown）を修正する。どれも局所的な変更。
2. P0-5（async の await 漏れ）を修正する。`set*` 系を Promise を返す形にそろえる。
3. P0-1（開催キー）と P0-2（オッズ配当 ID）を修正する。どちらも **ID・キーの体系が変わる**ので、`migration/` に移行スクリプトを追加する。
   - Kaisai: `Key = Key + Basho` で更新する。ただし、すでに他場で上書きされた行は復元できないので、Kaisai は BAC/KAB から再取り込みする。
   - OddsHaitou: 全件削除して再取り込みするのが確実。ID を振り直す SQL で対応する場合は、`Kakutei` 列から新しい ID を計算し直す。
4. P0-10（トランザクション）は影響範囲が広いので単独のコミットにし、取り込み時間を計測してから入れる。

### フェーズ 2: P1 の修正

1. 倍率の誤り（P1-1〜P1-4）をまとめて直す。Time と各オッズは**再取り込みが必要**。
2. コード変換の誤り（P1-5〜P1-10）を直す。
3. 符号付き数値の読み取り（P1-11, P1-12）を追加する。
4. P1-13〜P1-15 を直す。
5. P1-16（タイムゾーン）は方針を決めてから着手する（ID が全件変わるため、フェーズ 1 の移行と同時にやるかどうか）。

### フェーズ 3: P2（仕様追随）

1. コード表の追加（P2-2〜P2-4, P2-10）。特記・馬具コードは仕様のテキストから生成すると転記ミスが無い。
2. 未呼び出し処理の有効化（P2-1）。
3. 新しい項目の取り込み（P2-5〜P2-7）。エンティティにカラムを追加するので、`migration/`（SQLite/MySQL/PostgreSQL の 3 系統）にも反映する。
4. ZED リーダーの追加と、地方・外国レースキーへの対応（P2-8, P2-9）。
5. SRB のダート用バイアス、速報版の扱い（P2-11, P2-12）。

### フェーズ 4: P3

まとめて 1〜2 コミットで片付ける。

### 再取り込みが必要なデータ

| 修正 | 再取り込み対象 |
|---|---|
| P0-1, P0-8 | BAC, KAB（Kaisai） |
| P0-2, P0-3, P0-6, P0-7, P1-2, P1-3 | KYI, OZ, OW, OU, OT, OV, SED, TYB, HJC（OddsHaitou は全件作り直し） |
| P0-4, P1-13, P2-1 | SKB, KYI（ShussoubaJoutai） |
| P0-5 | KYI（放牧先） |
| P0-11, P1-15 | KYI, UKC（Kyousouba / Shussouba.KyousoubaId / Uma） |
| P1-1, P1-4, P1-5, P1-11 | SED, SEC, ZEC, TYB, KYI |
| P1-6 | CZA/CSA |
| P1-9, P1-10 | CHA |
| P1-12 | KAB |
| P1-14 | SRA/SRB（RaceLapTime） |

## 4. 実データで確認したい事項

- BAC の実際のレコード長（176 か 184 か）
- KAB の芝馬場差・ダ馬場差・直線馬場差の値の範囲と単位（負の値の有無、0.1 秒単位かどうか）
- OW の仕様（レコード長 780、オッズは `ZZ9.9` と推定）
- JOA の `厩舎BB印`(89)・`騎手BB印`(100) の位置と、使われているコード体系
- SED/ZED の地方・外国レースキーにおける「月・日の英字変換」の規則
- 既存 DB で、馬名照合によって別馬が統合されている Uma がないか（UKC 由来で KettouTourokuBangou が空の行など）
