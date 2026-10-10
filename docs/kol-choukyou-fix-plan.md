# KOL 調教取り込み 修正計画

作成日: 2026-10-10
対象: `src/app/reader/KOL/` 以下（主に [KolChoukyouTool.ts](../src/app/reader/KOL/KolChoukyouTool.ts) と、その呼び出し元 `KD3/KolDen2Kd3.ts` `KD3/KolSei2Kd3.ts` `KD3/KolUmaKd3.ts`）

## 1. 調査結果

### 1.1 KeibaDataAnalizer の 2019-07-20 14:58 以降の変更

`KeibaDataAnalizer` のリポジトリ（全ブランチ）で該当する日時以降のコミットは **1 件だけ**。

| コミット | 日時 | 内容 |
|---|---|---|
| `7c8606b` | 2026-04-11 15:56 | `Update CHOUKYOU_INDEX_MAP and fix logic in KDRaceShussoubaImporter` |

変更点は 3 つ（いずれも調教履歴の読み取り）。

| # | 変更 | 意味 |
|---|---|---|
| A | `KDRaceShussoubaImporter.BuildChoukyouRirekiMap` の `return choukyouRirekiMap;` を `continue;` に変更（調教コースが空の場合、プールの場合の 2 箇所） | 旧実装は、ある調教スロットがコース空 / プールだと**ループごと打ち切り**、後続スロット（2 本目・3 本目）を取りこぼしていた |
| B | `KD3ShutsubahyouImporter` の `CHOUKYOU_INDEX_MAP` で `{1, 256}` をコメントアウト | 調教 1 本目（KD3 のオフセット 256）を取り込み対象から外した |
| C | `KD2ShutsubahyouImporter` の `CHOUKYOU_INDEX_MAP` で `{1, 255}` をコメントアウト | 同上（KD2 は 255） |

> 注意: この 1 コミットに修正理由の説明はない。B/C は「1 本目のスロットが取り込めない（または不正）」という判断と読めるが、**KOL の実データで確認するまで確定できない**（後述 Q1）。

### 1.2 Analizer の調教履歴の読み方（現行・正とみなす）

`BuildChoukyouRirekiMap` のスロット 1 本あたりの処理:

1. `index+9` の 8 桁が日付でなければ**そのスロットを飛ばす**（`continue`）。騎乗者の有無は見ない。
2. コースが空なら、時計なしで履歴だけ登録して次のスロットへ（`continue`）。
3. コースに「プール」を含む → 回数（`周` の直前の数字）だけ登録し、時計は読まない。
4. コースに「坂」を含む → 回数（`回` の直前の数字）を登録し、時計は 4F/3F/2F/1F（offset 45/51/57/63）。
5. それ以外 → 時計は 8F/7F/6F/5F/4F/3F/1F（offset 27/33/39/45/51/57/63）。
6. 時計の値が数値でない: `-` は捨て、それ以外は Comment に入れる。**数値で、F が 2 以上かつ 20 以下のものは捨てる**（異常値）。

## 2. KOL 側の誤り

優先度の目安は [jrdb-reader-fix-plan.md](./jrdb-reader-fix-plan.md) と同じ（P0: データ破損・欠落 / P1: 値の誤り / P2: 仕様への追随不足 / P3: 軽微）。

### P0

| # | 場所 | 内容 | 修正案 |
|---|---|---|---|
| K-P0-1 | [KolChoukyouTool.ts:74](../src/app/reader/KOL/KolChoukyouTool.ts#L74) | `buffer.slice(offset + 27, 42)` の**終端が絶対位置**（`offset + 42` のつもり）。呼び出しの offset は 248/256/307/373/490 なので、始端 > 終端となり**常に空**。`crc16` が常に同じ値になり、`Choukyou.Id = 馬 * 2^31 + 日付 * 2^16 + hash` の hash が無意味になる。**同じ馬が同じ日に 2 回以上調教すると（コースや時計が違っても）同一 ID になり、後から来た方が前を上書きする**。 | `buffer.slice(offset + 27, offset + 69)`（時計欄 8F〜1F 全体）に直す。どこまでをハッシュ対象にするかは K-Q2 で決める。既存データは ID が変わるので再取り込み（K-P0-2 と併せて Choukyou / ChoukyouTime を全削除してから）。 |
| K-P0-2 | [KolChoukyouTool.ts:174](../src/app/reader/KOL/KolChoukyouTool.ts#L174) と L76 | ID が `馬ID * 2^31 + …` の後さらに `* 2^3` され、`Number.MAX_SAFE_INTEGER`（2^53）を超える可能性がある（馬 ID が 2^19 = 約 52 万を超えると丸め誤差で ID が衝突する）。 | Uma.Id の最大値を確認する。超えるなら ChoukyouTime.Id を `(Choukyou.Id, F)` の複合キーにするか、hash を 8 ビットに縮める。 |
| K-P0-3 | [KolChoukyouTool.ts:57](../src/app/reader/KOL/KolChoukyouTool.ts#L57) `saveShussoubaChoukyou` | `this.choukyouDao.save(sc)` を **`await` も `return` もしていない**。呼び出し側は `await` しているが、中身が待たれないため、保存失敗が握りつぶされ、後続処理と競合する。 | `return await this.choukyouDao.save(sc);` |

### P1

| # | 場所 | 内容 | 修正案 |
|---|---|---|---|
| K-P1-1 | [KolChoukyouTool.ts:153](../src/app/reader/KOL/KolChoukyouTool.ts#L153) | `$CH.ChoukyouType.Shiba <= choukyou.Type \|\| choukyou.Type <= $CH.ChoukyouType.Shougai` は `\|\|` のため**常に真**。プール・連闘・ゲート・牧場・その他の調教にも「コース用」の時計読み取りが走り、無関係な欄を時計として保存する。Analizer の A の趣旨（プールは時計を読まない）にも反する。 | 意図は「芝〜障害（Shiba=2 〜 Shougai=6）」なので `&&` にする。`Type` が null の場合（`Codes` が変換できなかった場合）も読まない。 |
| K-P1-2 | [KolChoukyouTool.ts:169-182](../src/app/reader/KOL/KolChoukyouTool.ts#L169-L182) `saveChoukyouTime` | Analizer は「数値で F ≥ 2 かつ 20 以下」の値を捨てるが、こちらはそのまま `Time` に保存する。KOL の欄に時計でない小さい数字（回数の残りなど）が入っていると、**1〜20 秒台の時計が混入する**。 | 同じ条件で捨てる。判定の根拠は実データで確認する（K-Q3）。 |
| K-P1-3 | [KolChoukyouTool.ts:99-103](../src/app/reader/KOL/KolChoukyouTool.ts#L99-L103) | 回数の読み取りは「欄の最初の数字」を取る。Analizer は `周` / `回` の**直前の数字**を取る。「3回 2周」のような欄や、前に別の数字が入る欄で値がずれる。 | `坂路: /(\d+)\s*回/`、`プール: /(\d+)\s*周/` で取る。 |

### P2

| # | 場所 | 内容 | 修正案 |
|---|---|---|---|
| K-P2-1 | [KolChoukyouTool.ts:67-70](../src/app/reader/KOL/KolChoukyouTool.ts#L67-L70) | Analizer は**日付の有無**でスロットを飛ばすが、こちらは**騎乗者名が空**だと飛ばす。騎乗者名が空で日付・時計だけあるスロットを取りこぼす。逆に日付がなく騎乗者だけあるスロットは `getDaysFrom1970` が不正値を返しうる。 | 日付（`offset + 9`, 8 桁）が読めなければ return、騎乗者名は空でも続行する（`Noriyaku` は null）。 |
| K-P2-2 | [KolChoukyouTool.ts:91-97](../src/app/reader/KOL/KolChoukyouTool.ts#L91-L97) | コースが空のスロットを Analizer は「履歴だけ登録・時計なし」とするが、こちらは `Basho`/`Type`/`Course` が全部 null のまま保存され、さらに `Type` が null で K-P1-1 の分岐に入る。 | コース空のときは時計を読まずに保存だけして次へ（A と同じ挙動）。 |
| K-P2-3 | [KolDen2Kd3.ts:149-170](../src/app/reader/KOL/KD3/KolDen2Kd3.ts#L149-L170) | 調教 1 本目（256）を取り込んでいる。Analizer は B/C で 1 本目を外した。 | **K-Q1 の結果次第**。1 本目が不正なら外す。有効なら Analizer 側が誤り（Analizer を戻す提案をする）。 |

### P3

| # | 場所 | 内容 | 修正案 |
|---|---|---|---|
| K-P3-1 | [KolChoukyouTool.ts:104](../src/app/reader/KOL/KolChoukyouTool.ts#L104) | コメント `// 307` が残っている（意味不明）。 | 削除。 |
| K-P3-2 | [KolChoukyouTool.ts:122-139](../src/app/reader/KOL/KolChoukyouTool.ts#L122-L139) | `execed = /[0-9]+(\.[0-9]+)/` は整数のタイム差（`2` など）を取れない。 | 仕様（KOL の併せ馬欄の書式）を確認してから `\.` を任意にする。 |

## 3. 未確定事項（実データで確認が必要）

KOL の実データ（KD3 の DEN2 / SEI2 / UMA）と、仕様がわかる資料がこのリポジトリにはない。次の 3 点は、実ファイルを 1 つ用意してから決める。

- **K-Q1**: KD3 の 256（KD2 の 255）の調教スロットは有効か。Analizer がコメントアウトした理由。確認方法: 実データで 256 の日付欄（265〜272）が日付として読めるか、373 / 490 と同じ構造か、`choukyouFlag`（前回/追切り）が何になっているか。
- **K-Q2**: `Choukyou.Id` の hash をどの範囲から作るか（時計欄だけか、コース・騎乗者も入れるか）。同日に複数回調教する馬で ID が分かれることを確認する。
- **K-Q3**: 時計欄に「20 以下の数値」が入るケースの実態（Analizer の除外条件の根拠）。

## 4. 作業手順

1. **テスト用データの用意**: 実ファイルから調教スロット部分を抜き出して `test/` に置く（K-Q1〜Q3 の確認用）。既存の `test/reader.test.ts` 等の流儀に合わせる。
2. **K-P0-1 / K-P0-3 / K-P1-1** を直す（影響が大きく、他に依存しない）。
3. K-Q1〜Q3 を確認し、K-P0-2 / K-P1-2 / K-P2-3 を決めて直す。
4. K-P1-3 / K-P2-1 / K-P2-2 / K-P3 を直す。
5. 単体テスト: (a) 同日 2 回調教した馬の ID が分かれる、(b) プールで ChoukyouTime が作られない、(c) 坂路で 4F〜1F のみ、(d) 騎乗者空・日付ありのスロットが保存される、(e) コース空のスロットが後続スロットを妨げない、(f) 大きな馬 ID でも ID が衝突しない。
6. 既存 DB の移行: Choukyou / ChoukyouTime は ID が変わるため、KOL 由来分を削除して KOL を再取り込みする。JRDB 由来の調教は別系統（TODO.md の `ChoukyouJrdb` を参照）なので影響しない。[migration/steps/40_choukyou.sql](../migration/steps/40_choukyou.sql) の重複統合ロジックに ID 計算が含まれていないか確認する。

## 5. 補足

- Analizer 側の変更（A）は `return` → `continue` で、スロットを 1 つのループで回していた構造に由来する不具合だった。こちらはスロットごとに `saveChoukyou` を呼ぶ構造のため、同じ形の不具合は**ない**（`return` は当該スロットだけを抜ける）。ただし K-P2-1 / K-P2-2 のとおり、スロットを飛ばす条件が Analizer とずれている。
- 調教以外（開催・レース・出走馬・オッズ）について、Analizer 側に該当期間の変更はなかった。KOL のそれらの誤りはこの計画の対象外。
