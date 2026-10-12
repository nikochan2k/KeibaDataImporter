# 別人判定（同一人物・同一馬の突き合わせ）

馬・騎手・調教師は、KOL・JRDB・JRA-VAN で別々のコード体系を持つ。
取り込み時に「すでに取り込んだ人物（馬）か、別の人物（馬）か」を判定し、同じなら同じ行にまとめる。

対象と実装場所:

| 対象 | ファイル | コード列 |
| --- | --- | --- |
| 馬 | `src/app/daos/UmaDao.ts` | `KolUmaCode`, `KettouTourokuBangou` |
| 騎手 | `src/app/daos/KishuDao.ts` | `KolKishuCode`, `JrdbKishuCode`, `JvDataKishuCode` |
| 調教師 | `src/app/daos/ChoukyoushiDao.ts` | `KolKyuushaCode`, `JrdbChoukyoushiCode`, `JvDataChoukyoushiCode` |

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
