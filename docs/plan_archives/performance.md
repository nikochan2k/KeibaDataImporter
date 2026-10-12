# 高速化の分析と手法

テストと取り込み処理を速くした記録。計測の方法、見つけた原因、効いた手法、効かなかった手法、残った課題をまとめる。

## 結果

| 対象 | 前 | 後 |
|---|---|---|
| `bun test` 全体 | 約190秒 | 約35〜40秒 |
| KOL `uma` の取り込み | 11.8秒 | 約1.6秒 |
| KOL `kod` の取り込み | 0.69秒 | 0.32秒 |
| KOL `ods` の取り込み | 0.23秒 | 0.10秒 |
| `prepare` の呼び出し回数 (`uma`) | 51,032回 | 259回 |

## 計測の方法

### CPU プロファイル

```sh
bun --cpu-prof --cpu-prof-dir=<出力先> <スクリプト>
```

出力された `.cpuprofile` (JSON) を読み、サンプルの自己時間を関数ごとに集計した。次の 2 つの集計が役に立った。

- 関数名と位置ごとの自己時間。上位の関数がわかる。
- 自己時間を、呼び出しをさかのぼって最初に見つかった `src/app/` 内のフレームに寄せる。bun:sqlite の `get` や `values` のようなネイティブ関数の時間が、どのアプリ関数のものかわかる。

ネイティブ関数の自己時間は名前だけでは「SQLite の実行」としかわからない。呼び出し元の 2〜3 段上まで出すと、`saveOddsHaitou` や `saveOrUpdate` など、対象が絞れる。

### SQL の実行時間と回数

`Database.prototype.prepare` を差し替え、返ってきた文の `run` / `get` / `all` / `values` を包んで、SQL 文ごとの回数と時間を集計した。drizzle も `client.prepare` を呼ぶので、これで全部の文を拾える。`openDb` で接続が作り直されるため、接続の個別のインスタンスではなく、プロトタイプを差し替える必要がある。

### 準備回数

`prepare` の呼び出しを、呼び出し元ごとに数えた。51,032 回が 259 回になったことで、文の使い回しが効いたことを確認できた。

## 見つけた原因

遅い原因は、INSERT を 1 行ずつ行うことや、`Buffer.copy` ではなかった。**find / update / save の呼び出しごとに、drizzle がクエリを組み立て、SQLite が文を準備し直していた**こと。1 回あたりは小さいが、取り込みでは数万回呼ばれる。

もう 1 つは、Shift_JIS のデコードに使っていた `encoding-japanese` が遅かったこと。

## 効いた手法

### 1. テストの実行方針 (`CLAUDE.md`)

テスト自体を速くする前に、実行の頻度を減らす。作業中は関係するテストファイルだけを実行し、全体は push 前に 1 回だけ実行する。

### 2. `decodeSjis` を `TextDecoder` に替える

`src/app/util/Sjis.ts`。`new TextDecoder("shift_jis")` でデコードし、`encoding-japanese` との違いは後処理で合わせた。

違いが出るのは次の入力。

- 変換できないバイト: `TextDecoder` は U+FFFD (置換文字) にする。`encoding-japanese` は `?` にする。
- `0x80`: `TextDecoder` はそのまま通す。
- 外字 (`0xF040`〜`0xF9FC`): 私用領域 (U+E000〜U+F8FF) の文字になる。
- リードバイトの後ろの ASCII。

後処理で `[\x80�-]` を `?` に置き換えて、`encoding-japanese` の結果に合わせた。`encodeSjis` は変えていない。

検証は `test/sjis.test.ts`。ASCII・半角カナ・全角、Windows-31J の拡張文字、変換できないバイト、有効な 2 バイト文字すべてで `encoding-japanese` と一致すること、エンコード・デコードの往復を確認する。

### 3. 準備済みの文を使い回す (`src/app/db/helpers.ts`)

同じ形のクエリは、組み立てと準備を 1 回で済ませ、値だけを差し替えて実行する。

- 文は `.prepare()` で作り、値は `sql.placeholder` で渡す。
- 文の入れ物は `statementCache()` (`db.ts`)。接続の drizzle インスタンスをキーにした `WeakMap` で、接続を開き直すと別の入れ物になる。
- 入れ物のキーは、表・演算・条件や項目の名前と数。例: `findOne:Race|Id:eq`、`upsert:Uma|Id,Name`。
- 対象は `findOneBy` / `findBy` / `countBy` / `save` / `upsert` / `updateBy`。

**注意**: placeholder は列の変換 (`mode` や `$type` の encoder) を通らない。いまのスキーマにはその種の列がないので安全だが、追加するときは `helpers.ts` の `cached` のコメントを読むこと。

### 4. `upsertAll` による一括保存

複数行を 1 回の `INSERT ... ON CONFLICT DO UPDATE` で保存する。

- 項目の組 (undefined を除いた列名) が同じ行ごとにまとめて 1 文にする。
- 更新は `excluded.列名` を使う。更新する列がなければ `DO NOTHING`。
- 変数の上限 (`SQLITE_MAX_VARIABLE_NUMBER`) に収まるよう、30,000 変数ごとに分ける。
- 行数が 64 以下の文だけ使い回す。それより多いと形が多様になりすぎる。
- 同じ主キーの行があるときは、項目の組が同じ行の中では後の行の値が残る。組が違う行どうしの順序は保証しない。
- 保存後の行は読み戻さない。自動採番の Id が要る場合は使えない。

適用先は、主キーが決まっていて読み戻しが要らない表。

- `ChoukyouTime` (`KolChoukyouTool`)
- `ShussoubaTsuukaJuni` (`KolShussoubaTool`)
- `OddsHaitou` (`OddsHaitouTool.saveOddsHaitouAll`)。KOL のオッズ読み込み 8 メソッドと `saveRaceHaitou` が使う。

`OddsHaitou` の Id は `calculateOddsHaitouId` で計算できるので、先に Id を付けてからまとめて保存できる。JRDB 系は 1 件ずつ保存する呼び出しが多く、そのまま残した。

テストは `test/db.test.ts` の `describe("upsertAll")`。一部の項目だけの更新、項目の組が混ざる場合、主キーの重複、主キーだけの行、20,000 行の分割、空配列。

### 5. `normalize` の高速化 (`src/app/reader/Reader.ts`)

文字ごとの `indexOf` と、置換語ごとの `split().join()` をやめ、正規表現と `Map` で一度に置換する。

- 濁点付きの半角カナは、全部を `|` でつないだ正規表現と `Map` で置換する。
- 全角記号・半角カナは、文字クラスの正規表現と `Map` で置換する。`fromChar` に同じ文字が複数あるときは、元の `indexOf` と同じく最初のものを使う。

旧実装との一致は、UTF-16 の全コード単位 (63,488 文字) と、半角カナ・濁点の 3 連の組み合わせで確認した。差異は 0 件。

### 6. `upsertLater` による書き込みの後回し (`src/app/db/helpers.ts`)

[bulk-upsert-plan.md](./bulk-upsert-plan.md) の段階 1。戻り値が要らない `upsert` を、トランザクションの中では溜めて、まとめて `upsertAll` で書く。

- 同じ主キーの行は項目ごとにマージする (`upsert` を順に呼んだ結果と同じ)。
- 同じ表を読む・書く直前、生の SQL の直前、COMMIT の直前、5,000 行を超えたときに書き出す。ROLLBACK では捨てる。
- `db.ts` の `setTransactionHooks` で、COMMIT 前と ROLLBACK 時の処理を登録する (`helpers.ts` を import すると循環するため)。
- 適用先は `ShussoubaYosou` / `ShussoubaHyouka` / `ShussoubaSeiseki` (KOL・JRDB・JRA の全呼び出し)。
- 結果: `uma` の取り込みが約 1.6 秒から約 1.35 秒 (各 4 回の計測で、旧 1.52〜1.84 秒、新 1.29〜1.55 秒)。

段階 2 で `RaceSeiseki` (全呼び出し) と、`KolUma` の `Shussouba` の追加も `upsertLater` にした。あわせて、主キーを全部指定した `findOneBy` / `updateBy` は、その行が溜まっていなければ表を書き出さないようにした (毎レコード同じ表を読む `KolUma` で、1 行ずつ書き出すことになるのを避ける)。`uma` は 1.28〜1.55 秒で、段階 1 から目立った差はなかった (各 948 行で、元々 50〜70ms の見込みだった)。

段階 3 では、戻り値を使わない残りの `upsert` (`ShussoubaKeika` / `ShussoubaJoutai` / `KaisaiYosou` / `RaceKeika` / `OddsHaitou`) も `upsertLater` にした。`Race` / `Kaisai` / `Shussouba` は、戻り値で既存の値とマージした行 (`race.Kyori` など) を使うので、そのまま残した。

#### 段階ごとの効果

KOL 見本ファイル (KD3) の 16 種別を取り込む時間 (ms)。種別ごとに 5 回計測した中央値。全体は 2 周の計測で、1 周目の段階 1 は外れ値 (10,365) があるため 2 周目を載せる。

| 種別 | 基準 | 段階 1 | 段階 2 | 段階 3 |
|---|---|---|---|---|
| `uma` | 1,539 | 1,373 | 1,409 | 1,342 |
| `sei1` | 90 | 89 | 89 | 70 |
| `sei2` | 1,672 | 1,464 | 1,516 | 1,404 |
| `den2` | 446 | 414 | 415 | 402 |
| `com1` | 473 | 441 | 425 | 413 |
| 16 種別の合計 | 9,698 | 9,261 | 9,321 | 9,085 |

- 合計で約 6% (約 0.6 秒) 速くなった。`uma` と `sei2` は 13〜16% 短縮。
- 効果の大半は段階 1 (出走馬の予想・評価・成績)。段階 2 は誤差の範囲、段階 3 は `sei1` / `sei2` / `com1` で小さく効いた。
- `kod2` / `kod3` / `ods2` は変わらない。これらは既に一括保存を使っていて、残りは JS 側の処理が大半。
- 計測のばらつきは ±100ms 程度ある。段階どうしの差 (数十 ms) は、有意とは言えない。

## 効かなかった手法

- **`PRAGMA synchronous = NORMAL`**: `uma` の取り込みは 1.5〜1.6 秒のままで変化なし。取り込みは既に 1 ファイルを 1 トランザクションで書いていて、同期待ちが効いていない。
- **`Buffer.copy` のフック**: プロファイルで原因ではないと判明した。
- **`Race` / `Kaisai` / `Shussouba` の溜め書き (`upsertMerged`)**: 既存の値と合わせた行を返しつつ書き込みは溜め、主キーを指定した `findOneBy` は溜めた行から答える実装を試した。KOL 16 種別の取り込みの合計は、HEAD が 8,948 / 9,418 ms、試作が 8,996 / 10,127 ms (各種別 5 回の中央値、2 周)。ばらつき (±100ms) の範囲内で、`uma` も変わらなかった。`Race` / `Kaisai` の読み戻しは準備済みの文で既に安く、書き込みも 1 レースにつき 1 回なので、省ける時間が小さい。計画書の打ち切り基準に当てはまるので捨てた。
- **INSERT の一括化だけを狙う**: 先に直すべきは find / update の準備のやり直しだった。

## 残った課題

`uma` の取り込みは約 1.6 秒。内訳は SQLite の実行が約 0.87 秒 (46,046 回、1 回あたり約 19µs)、残りが JS 側の細かい処理。

大きい塊は 1 行ずつの INSERT。

- `ShussoubaYosou` / `ShussoubaHyouka` / `Kaisai` / `RaceSeiseki`: 各 948 行
- `Banushi`: 1,104 行
- `Race`、`Uma`、`Jinmei`: 自動採番

さらに速くするには、行をメモリに集めて親から順に一括 upsert する構造に組み替える。

- 一括にできるのは、子の主キーが親の Id から決まり、読み戻しが要らない表に限られる。
- 自動採番の表は Id の読み戻しが要り、一括にしにくい。
- 見込みは `uma` が 1.6 秒から 1.1 秒前後。テスト全体が約 40 秒なので、`uma` の取り込みはその約 4% で、全体への効果は数百ミリ秒にとどまる。
- 手を付けるなら、`ShussoubaYosou` と `ShussoubaHyouka` (それぞれ約 50〜70ms) から。

## 教訓

- 推測で手を付けず、先にプロファイルを取る。今回の本当の原因は、予想した INSERT や `Buffer.copy` ではなかった。
- 回数が多いものは、1 回の小ささに惑わされず、呼び出し回数を数える。`prepare` の回数を数えたことで原因が特定できた。
- ネイティブ関数の自己時間は、呼び出し元までさかのぼって集計しないと、何の時間かわからない。
- 置き換えるときは、旧実装との一致を全入力 (または網羅的な入力) で比較して確かめる。
