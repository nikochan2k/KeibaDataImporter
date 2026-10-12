# KOL KD3 取り込み処理の点検結果

作成日: 2026-10-10
対象: `src/app/reader/KOL/` 以下(KD3 の 17 種類)

## 1. 点検方法

仕様書(KD3 フォーマット 第11版)と見本データは [kol-spec/](./kol-spec/README.md) に置いた。点検は次の 3 つで行った。

1. 仕様書の項目表を読み取り、レコード長と、リーダーのレコード長を突き合わせた。
2. 見本データを実際の取り込み処理に通し、リーダーが読んだ範囲(offset, length)を記録して、仕様書の項目と突き合わせた(仕様書の項目に収まらない読み取り、まったく読まれない項目を洗い出す)。
3. 読み取りの 1 行ごとに、仕様書の項目名とソースの行を並べて目で確認した(項目名と代入先の意味が合うか)。

このハーネスは [test/spec/kol.ts](../test/spec/kol.ts)、テストは [test/kol.test.ts](../test/kol.test.ts)。

## 2. 修正した不具合

優先度の目安は [jrdb-reader-fix-plan.md](./jrdb-reader-fix-plan.md) と同じ(P0: データ破損・欠落・取り込み不能 / P1: 値の誤り / P2: 取りこぼし)。

### P0

| # | 場所 | 内容 |
|---|---|---|
| 1 | [OddsHaitouTool.ts:243](../src/app/reader/KOL/KolOddsHaitouTool.ts#L243) `saveRaceHaitou` | 払戻をすべて `Baken.Sanrentan` で保存していた。単勝・複勝・枠連・馬連・ワイド・馬単・3連複の払戻が 3連単として保存され、ID も衝突して互いに上書きしていた。`info.baken` にした。 |
| 2 | [KolOds.ts:34](../src/app/reader/KOL/KD3/KolOds.ts#L34), [KolKod.ts:34](../src/app/reader/KOL/KD3/KolKod.ts#L34) | 枠連オッズを `saveTanshouOdds` で読んでいた。枠連の位置(251〜)を単勝として 18 件保存し、本物の単勝オッズを上書きしていた。`saveWakurenOdds` にした。 |
| 3 | [KolOddsHaitouTool.ts:56](../src/app/reader/KOL/KolOddsHaitouTool.ts#L56) `saveWakurenOdds` | 枠連の組み合わせを 8×8=64 通り読んでいた。仕様は `1-1, 1-2, …, 1-8, 2-2, …, 8-8` の 36 通り。以降のオッズ(馬連の領域)まで読み進めていた。 |
| 4 | [KolUma.ts:87](../src/app/reader/KOL/KD3/KolUma.ts#L87) | 過去走が 5 走に満たない馬で、レース ID が null になり `findOneBy({ Id: null })` が例外になる。**ファイルごとロールバックされ、競走馬データがまったく取り込めなかった**(見本の 2 ファイルとも)。スキップするようにした。 |
| 5 | [KolSei2.ts:94](../src/app/reader/KOL/KD3/KolSei2.ts#L94) | `if (toBe) return null;` と条件が逆。出走馬が未登録のとき必ず登録されず、`createShussouba` が null のときは `toBe.Wakuban` で落ちていた。`!toBe` にした。出走馬の馬番がないレコードで落ちないようにもした。 |
| 6 | [KolKet.ts:23](../src/app/reader/KOL/KD3/KolKet.ts#L23) | 3代血統図のレコード長が 2010(種牡馬データの長さ)。仕様書は 839。レコードの区切りがずれて、1 件目しか読めなかった。 |
| 7 | [KolSei3Kd3.ts](../src/app/reader/KOL/KD3/KolSei3Kd3.ts) | レースの成績が未登録(`asIs` が null)だと `asIs.SeisaiNaiyou` で落ちる。 |
| 8 | [KolChoukyouTool.ts:74](../src/app/reader/KOL/KolChoukyouTool.ts#L74) | ID に使うハッシュの `slice(offset + 27, 42)` の終端が絶対位置で、常に空。同じ馬が同じ日に 2 回調教すると同じ ID になり上書きされた。調教の本体(offset+17〜77)から作る。([kol-choukyou-fix-plan.md](./kol-choukyou-fix-plan.md) の K-P0-1) |
| 9 | [KolChoukyouTool.ts:57](../src/app/reader/KOL/KolChoukyouTool.ts#L57) | `saveShussoubaChoukyou` が `await` されていない。保存の失敗が握りつぶされる。(同 K-P0-3) |
| 10 | `KolDen2` `KolSei2` `KolUma` の `saveShussoubaJoutai` | 状態(ブリンカー)の保存を `await` していなかった。 |

### P1(値の誤り)

| # | 場所 | 内容 |
|---|---|---|
| 11 | [KolRaceTool.ts:150](../src/app/reader/KOL/KolRaceTool.ts#L150) `saveSpecialRaceLapTime` | 障害レースの上り時計(`104.9-52.0-38.9-13.3`)を、項目の長さ(5/4/4)でなく常に 3 バイト、しかも 0.1 秒単位として読んでいた(`104.9` → 10.4)。長さを使い、秒の単位(×1)で読む。 |
| 12 | [KolSei1.ts:202](../src/app/reader/KOL/KD3/KolSei1.ts#L202) | 障害の上り 1F(`13.3`)を 0.1 倍していた(1.33)。 |
| 13 | [KolSei1.ts:480](../src/app/reader/KOL/KD3/KolSei1.ts#L480) | 馬単 4 番目の人気を 1 番目の位置(2345)から読んでいた。正しくは 2387。 |
| 14 | [KolDen1.ts:149](../src/app/reader/KOL/KD3/KolDen1.ts#L149) | 附加賞を 351(SEI1 の位置)から読んでいた。DEN1 は 322。 |
| 15 | [KolDen1.ts:65](../src/app/reader/KOL/KD3/KolDen1.ts#L65), [KolSei1.ts:78](../src/app/reader/KOL/KD3/KolSei1.ts#L78), [KolUma.ts:182](../src/app/reader/KOL/KD3/KolUma.ts#L182) | 曜日を、休日の変換表(`kyuujitsu`: 1〜3 だけ)で読んでいた。火〜金(4〜7)が null になり、土日月だけ偶然合っていた。曜日の変換表(`youbi`)にした。 |
| 16 | [KolRaceTool.ts:132](../src/app/reader/KOL/KolRaceTool.ts#L132) `saveRaceHassouJoukyou` | 発走状況の馬番を `/(\([0-9]+\))+/.exec` で取っていて、`(04)(05)` のうち最後の `(05)` しか保存されない。馬番が 1 つもない文言だと `null.length` で落ちる。`matchAll` で全部取る。 |
| 17 | [KolOddsHaitouTool.ts:109](../src/app/reader/KOL/KolOddsHaitouTool.ts#L109) `saveWideOdds` | ワイドの上限オッズ(`Odds2`)を保存していなかった(複勝は保存している)。 |
| 18 | [KolKet.ts:90](../src/app/reader/KOL/KD3/KolKet.ts#L90) | 3代血統図の母母を 332、母父父を 542 から読んでいた(1 バイトずれ、仕様は 331, 541)。 |
| 19 | [KolKet.ts](../src/app/reader/KOL/KD3/KolKet.ts) | 父父(205)を牝馬として保存していた。 |
| 20 | `KolKet` `KolKet5Kd3` | 血種を毛色の変換表(`keiro`)で変換していた(`kesshu` が正しい)。 |
| 21 | [KolKet5Kd3.ts](../src/app/reader/KOL/KD3/KolKet5Kd3.ts) | 父・父父・父父父・父母父・母父・母父父・母母父(エリア名が「父」で終わる 1〜3 代の祖先)を牝馬として保存していた。 |
| 22 | [KolKet5Kd3.ts](../src/app/reader/KOL/KD3/KolKet5Kd3.ts) `saveHch` | 母父母の父と母が逆(父に母父母母、母に母父母父を渡していた)。 |
| 23 | `KolKet` `KolKet5Kd3` | 祖先の名前が空だと、`.Id` で落ちてファイル全体がロールバックされる。`?.Id` にした。3代血統図の英語馬名は、空のときに既存の値を消さないようにした。 |
| 24 | [KolChoukyouTool.ts:154](../src/app/reader/KOL/KolChoukyouTool.ts#L154) | `Shiba <= type \|\| type <= Shougai` が常に真で、プール・連闘・ゲート・牧場にもコース用の時計(8F〜1F)を読んでいた。`&&` にした。(kol-choukyou-fix-plan.md の K-P1-1) |

### P2(取りこぼし)

| # | 場所 | 内容 |
|---|---|---|
| 25 | [KolShu.ts:33](../src/app/reader/KOL/KD3/KolShu.ts#L33) | 種牡馬コード(先頭 7 バイト)を保存していなかった。馬名だけで馬を探すので、カナと英語が別の行になりうる。 |
| 26 | [KolUma.ts:124](../src/app/reader/KOL/KD3/KolUma.ts#L124) | 過去走のレコード指数を読む `saveShussoubaHyouka` が定義されているのに呼ばれていなかった。 |
| 27 | [KolUma.ts:332](../src/app/reader/KOL/KD3/KolUma.ts#L332) | 過去走の騎手の東西別・所属場所・所属厩舎・見習い区分を読んでいなかった(DEN2・SEI2 は読んでいる)。 |

## 3. 修正していないもの(判断が必要)

| 場所 | 内容 |
|---|---|
| [KolKis.ts:25](../src/app/reader/KOL/KD3/KolKis.ts#L25) | 騎手の「初免許年(YYYY)」を `Kishu.MenkyoKoufuNengappi`(年月日)に入れている。厩舎は `HatsuMenkyoNen` に入れている。騎手に年だけを入れる列がないので、列を足すか、`YYYY0101` にするか決める必要がある(スキーマ変更になるので保留)。 |
| [KolOddsHaitouTool.ts:28](../src/app/reader/KOL/KolOddsHaitouTool.ts#L28) `getOdds` | オッズが `*`(上限以上)のとき `10 ** (桁数 - 2)` を入れる。仕様書の上限は単勝 50 倍(ODS)/1 万倍(KOD)、馬連 1000 倍、3連複 100 万倍、3連単 1 億倍と、データごとに違うので、桁数からは決まらない。また「50 倍以上」を 1000 倍と保存してよいかは決めが必要。 |
| 調教の読み方 | [kol-choukyou-fix-plan.md](./kol-choukyou-fix-plan.md) の K-P1-2(異常値の除外)、K-P1-3(回数の読み方)、K-P2-1(日付の有無でスロットを飛ばす)など。K-Q1「1 本目(DEN2 の 256)は有効か」は、仕様書で「調教フラグ 0=前回 1=追切り、(前回)調教１」と定義されており、**有効**。Analizer が外した理由は仕様書からは分からない。 |
| `KolSei1.save` | レースが既に登録されている(DEN1・UMA が先)と、`saveRace` を実行せず、SEI1 のレース情報(コースレコード、取消頭数など)でレースを更新しない。意図的かもしれない。 |
| ODS・KOD の `*` | 上と同じ。 |

## 4. 仕様書にあるが取り込んでいない項目

見本データを通して「どのリーダーも読まなかった範囲」から。取り込み先の列(エンティティ)がないものがほとんどなので、必要になったら列と一緒に足す。

| データ | 読んでいない項目 |
|---|---|
| KYU 厩舎 | 登録抹消フラグ、データ作成年月日、通算・本年・昨年の成績、距離別・場所別・馬場別の成績(109〜) |
| KIS 騎手 | 東西別以降すべて(所属、見習い区分、通算・本年・昨年の成績、距離別・場所別・馬場別の成績) |
| SYU 種牡馬 | 以降の予備、データ作成年月日(140〜) |
| UMA 競走馬 | 現在の馬主名・短縮馬主名(343, 383)、過去 6〜55 走(4014〜、場所・年・回・日・R・年月日・交流フラグ・馬番)、過去走の出走馬の予備 |
| DEN1 出馬表レース | 出走馬の一覧(枠番・馬番・馬コード、566〜)、レース短評・展開(逃げ以外)・予想者名(見本データでは空) |
| DEN2 出走馬 | 生年、スピード指数 5 走分(742〜)、ローテーション 8 週分(767〜)、場所別成績(843〜) |
| SEI1 | 出走馬の一覧(2918〜)、組(中央はなし) |
| SEI2 | 生年(432) |
| COM1 | 確定着順・騎手名など(72〜90)。次走へのメモ・騎手厩舎コメントは読んでいる |
| 全種別 | 開催年(2〜5)は、年月日から読むので不要。曜日は開催にだけ入れる |
| 特別登録(TOK1, TOK2) | 取り込み処理自体がない。仕様書は [kol-spec/KD3/spec/](./kol-spec/KD3/spec/)、見本データはない |

## 5. テスト

[test/kol.test.ts](../test/kol.test.ts)(`KOL_SPEC_FULL=1` で KOD2・KOD3 の取り込みも行う)。

| テスト | 確かめること | 対応する不具合 |
|---|---|---|
| KD3 の仕様書 | 項目表が読め、レコード長がリーダーと一致し、見本ファイルがレコード長の整数倍で CR LF で終わる | #6 |
| KD3 見本ファイルの取り込み | 15 種類の取り込みでエラーが出ない。読んだ範囲が仕様書の項目の中に収まる | #4, #5, #7 |
| SEI1 払戻 | 券種ごとの件数が見本データと一致する。単勝の払戻金が一致する | #1 |
| SEI1 障害の上り時計 | 秒で保存される | #11, #12 |
| SEI1 馬単の人気 | 4 番目の人気を 2387 から読む | #13 |
| SEI1 発走状況 | `(04)(05)` の両方の馬番が保存される。馬番のない文言でも落ちない | #16 |
| SEI1・DEN1 曜日 | 火曜・水曜の開催が正しい曜日になる | #15 |
| DEN1 附加賞 | 322 から読む | #14 |
| UMA | 過去走が少ない馬も取り込める。過去走のレコード指数・騎手の東西別が保存される | #4, #26, #27 |
| SEI2 | 出走馬が未登録でも、出走馬と成績が登録される | #5 |
| ODS・KOD | 単勝・枠連・馬連の件数が見本データと一致し、混ざらない。KOD2 でワイドの上限・下限が保存される | #2, #3, #17 |
| SYU | 種牡馬コードが保存される | #25 |
| KET5 | 牡牝が正しく、母父母の親子関係が正しい | #21, #22 |
| KET | 仕様書の位置から祖先を読む(仕様書の項目表から作った 1 レコード)。祖先が空でも取り込める | #6, #18, #19, #23 |
| SEI3 | レースが未登録でも落ちない | #7 |
| 調教 | 同日 2 回の調教が別の行になる。プールには時計がない。ウッドチップは 8F〜1F が保存される | #8, #24 |

## 6. 既存データの移行

次のテーブルは、修正前の取り込みで誤った値や ID が入っている。KOL 由来の行を削除して、KOL のファイルを取り込み直すのが確実。

- `OddsHaitou`(#1, #2, #3: 払戻・オッズ全般)
- `Choukyou`, `ChoukyouTime`(#8: ID の作り方が変わる)
- `Kaisai.Youbi`(#15)、`Race.FukaShou`(#14: DEN1 由来)、`RaceLapTime`・`RaceSeiseki.ShougaiHeikin1F`(#11, #12)
- `Uma`(#18〜#22: 血統図の牡牝と親子関係)
