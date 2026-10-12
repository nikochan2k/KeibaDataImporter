# 別人判定（同一人物・同一馬の突き合わせ）

馬・騎手・調教師は、KOL・JRDB・JRA-VAN で別々のコード体系を持つ。
取り込み時に「すでに取り込んだ人物（馬）か、別の人物（馬）か」を判定し、同じなら同じ行にまとめる。

対象と実装場所:

| 対象 | ファイル | コード列 |
| --- | --- | --- |
| 馬 | `src/app/daos/UmaDao.ts` | `KolUmaCode`, `KettouTourokuBangou` |
| 騎手 | `src/app/daos/KishuDao.ts` | `KolKishuCode`, `JrdbKishuCode`, `JvDataKishuCode` |
| 調教師 | `src/app/daos/ChoukyoushiDao.ts` | `KolKyuushaCode`, `JrdbChoukyoushiCode`, `JvDataChoukyoushiCode` |
| 生産者 | `src/app/daos/SeisanshaDao.ts` | `JvDataCode` |

## 全体の流れ

`getUma` / `getKishu` / `getChoukyoushi` が既存行を探す。

1. **コード一致**: コード列のどれかが一致する行があれば、その行を採用する（別人判定は行わない）。
2. **名前一致**: コードで見つからなければ名前で探し、候補から「別人」を除く。
3. どれにも当たらなければ `null`（新規行として保存）。

## 別人判定 `conflicts(a, b)`

「両方が値を持ち、かつ値が違う項目が1つでもあれば別人」。片方が null の項目は矛盾とみなさない。

- 馬 (`UmaDao.ts` の `conflicts`): `KolUmaCode`, `KettouTourokuBangou`, `Seinen`, `Seinengappi`, `Seibetsu`
- 騎手 (`KishuDao.ts` の `conflicts`): `KolKishuCode`, `JrdbKishuCode`, `JvDataKishuCode`
- 調教師 (`ChoukyoushiDao.ts` の `conflicts`): `KolKyuushaCode`, `JrdbChoukyoushiCode`, `JvDataChoukyoushiCode`

## 名前での候補選び

### 騎手・調教師 (`findByMeishou`)

1. `Jinmei.MatchingKey`（NFKC 正規化 + 異体字の縮退。`jinmeiMatchingKey`）が一致する名前を `KishuMei` / `ChoukyoushiMei` 経由で引き、1人1行にまとめる。
2. 次の両方を満たす候補だけ残す。
   - `conflicts` が偽（コードが矛盾しない）
   - 生年月日 (`Seinengappi`) が、どちらかが空か、両方あって一致する
3. 採用の条件:
   - 姓名 (`seimei`) がある場合: 候補が1人ならその人。複数でも `toBe.Seinengappi` があれば先頭。
   - 姓名がなく略称 (`tanshuku`) だけの場合: 候補がちょうど1人のときだけ。

### 馬 (`getUma`)

1. `KanaBamei`、なければ `EigoBamei` が一致する馬を探す。
2. `conflicts` が偽のものだけ残す。
3. 候補が複数なら `Seinen` の新しい順（同じなら `Id` の大きい順）で先頭を採る。
   馬名は別の馬に使い回されるため。併せ馬のように馬名しか分からない馬は、いま走っている馬である見込みが高い。

### 繁殖馬 (`saveHanshokuba`)

JV-Data の繁殖馬マスタ (HN)・産駒マスタ (SK)・競走馬マスタ (UM) の 3 代血統は、祖先を繁殖登録番号で指す。
繁殖登録番号は同じ馬に複数あることがあるので、`Uma` の列にせず `Hanshokuba` 表 (繁殖登録番号 → `UmaId`) に置く。

1. `Hanshokuba` に繁殖登録番号があれば、その馬。
2. なければ、取り込み中の馬にすでにつないでいた祖先 (KOL・JRA-VAN などから馬名でつないだ親) のうち、
   繁殖登録番号がまだなく、`conflicts` が偽のもの。
3. それもなければ `getUma` で探す。ただし、別の繁殖登録番号が付いた馬は、血統登録番号が一致するときだけ採る
   (馬名だけが同じ別の馬を区別するため)。
4. 見つけた馬 (なければ新しい馬) に、その繁殖登録番号を付ける。

### 生産者 (`getSeisansha`)

関連は `Shoyuu`（名前）⇔ `SeisanshaMei` ⇔ `Seisansha`（生産者）→ `Seisanba`（馬と生産者）。
生産者と名前は多対多（KOL の正式名と略称のように 1 人に名前が複数あり、同じ名前の別の生産者もいる）。名前の区分（`MeishouKubun` の正式名・略称・フリガナ・欧字）は `SeisanshaMei.Kubun`。
KOL・JRDB・JRA-VAN の生産者は名前だけ、JV-Data の生産者はコード (`JvDataCode`) もある。

生産者は必ず名前を持つ。産駒マスタ (SK) はコードしかないので、生産者は作らず馬の側 (`Uma.JvDataSeisanshaCode`) にコードを持ち、
生産者マスタ (BR) を取り込んだときに、同じコードを持つ馬を `Seisanba` でつなぐ。
こうすると、名前だけで作った生産者 (KOL など) にも BR でコードが付き、同じ生産者が 2 行に分かれない。

1. コードが一致する生産者があれば、その生産者。
2. 正式名（表記が同じもの）を持つ生産者を探す。コードを持つ生産者どうしは別の生産者として扱う。
   - コードがあるとき: まだコードのない生産者だけを採り、コードを付ける。
   - コードがないとき: 候補がひとりならその生産者。複数なら、コードのない生産者。
3. 正式名がなければ、略称で同じように探す。ただし略称は別の生産者と重なりやすいので、コードがないときは候補がひとりのときだけ。
4. どれにも当たらなければ新しい生産者。見つけた（作った）生産者に、今回の正式名・略称を足す。

## 保存時の扱い（騎手・調教師）

`saveKishu` / `saveChoukyoushi` は、既存行があっても次のいずれかのときだけ更新し、名前（`KishuMei` / `ChoukyoushiMei`）を追加する。

- 既存行が持たないコードを、今回のデータが持っている (`newCode`)
- 姓名・略称・フリガナが全部そろっている

それ以外は既存行をそのまま返す。

略称が4文字以上なら、先頭3文字の略称も別に登録する。

## 姓が変わった場合（騎手・調教師）

結婚・養子縁組・改名などで姓が変わると、名前（`Jinmei.MatchingKey`）が一致しない。
コードが共通の情報源どうしならコード一致で同一人物になるが、そうでない場合のために、名前での候補選びに次の段を足している（`lookup` / `findBySeinengappi`）。

- 姓名で探して候補が 0 人で、今回のデータに生年月日 (`Seinengappi`) があるときだけ働く。
- 生年月日が一致し、`conflicts` が偽（コードが矛盾しない）な行が **ちょうど 1 人** なら、同一人物とみなす。
- この経路で見つかったときは `renamed` として更新を強制し、新しい名前を `KishuMei` / `ChoukyoushiMei` に追加する。以降は旧姓でも新姓でも引ける。

コードが一致して見つかった行でも、今回の姓名が未登録（コードは同じで姓名だけ変わった）なら、同様に新しい名前を追加する。

生年月日が同じ別人がありうるので、候補が複数のときは同一人物とみなさず新規行にする。

## 既知の制限

- 生年月日が空のデータでは、姓が変わった人物は別行になりうる。
- 一度別行になった同一人物を、後から統合する仕組みはない（参照元の付け替えと旧行の削除が必要）。

## MatchingKey を TypeScript 側にキャッシュしない理由

`Jinmei` / `Shoyuu` / `Houbokusaki` は行数が少ない (サンプル DB で Jinmei 約 4,300 行、Shoyuu 約 2,100 行) ので、
MatchingKey で引く表を `Map` に読み込んでおけば速くなるか、を計測した。結論は **不要**。

- 検索の SELECT 自体が速い。騎手の名前検索 (`KishuDao.findByMeishou` の `Kishu ⨝ KishuMei ⨝ Jinmei`、`WHERE j.Meishou = ? OR j.MatchingKey = ?`) は
  1 回 約 11 µs。`Meishou` と `MatchingKey` の index が両方使われる (SQLite の MULTI-INDEX OR)。
  `Map` 引きにしても、取り込み全体では 1 秒に満たない差にしかならない。
- DB はプロセス内の SQLite (`bun:sqlite`) なので、往復の遅さがない。prepared statement も使い回している。
- `OR` を `UNION` に書き換えると、かえって遅い (約 46 µs)。
- キャッシュを持つと、保存のたびに `Map` を更新する必要がある。更新漏れは別人行の重複につながる。
  複数プロセスで取り込むと、他方の書き込みも見えない。
- 注意: 古い DB (`Jinmei.Meishou` の index がない) では、同じ検索が約 1.1 ms になり 100 倍遅い。
  最新のマイグレーションが当たっているか確認すること。

実際の取り込みのプロファイル (サンプル 18 MB、約 16 秒) で時間を食っていたのは、MatchingKey の検索ではなく、
`upsertAll` での SQL の組み立てと `prepare` だった。これを生 SQL の複数行 INSERT にして、約 9 秒になった。

試して効果がなかったもの (戻した):

- `query()` が全表の溜め書きを書き出すのを、読む表だけに絞る。flush の細切れは、見積もりほど効かなかった。
- `Codes.toCodeFrom` の結果のメモ化。プロファイル上の見かけで、実測では差がなかった。
