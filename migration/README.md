# KeibaDataAnalizer のデータベースを移行する

旧 KeibaDataAnalizer の SQLite データベース(`Keiba.sql` のスキーマ)を、このプロジェクトの
データベース(`src/app/entities`)へ移行する。

```
bun start    # 移行先に空のテーブルを作る(未作成の場合)
migration/migrate-sqlite.sh <移行元 Keiba.sqlite> <移行先 keiba.sqlite>
```

SQL は `steps/` に分かれている。`dialect/` は DB 固有の部分(日付のカレンダーを作る処理)だけで、
`steps/*.sql` は SQLite / MySQL / PostgreSQL 共通の書き方にしてある。移行元のテーブルは
`old.` を付けて参照する(SQLite は ATTACH ... AS old、MySQL は DB 名 old、PostgreSQL はスキーマ名 old)。

| ファイル | 内容 |
| --- | --- |
| `dialect/*.sql` | カレンダー(`mig_calendar`)の作成 |
| `steps/10_master.sql` | Jinmei, Kishu, KishuMei, Choukyoushi, ChoukyoushiMei, Uma |
| `steps/20_race.sql` | Kaisai, Race, RaceSeiseki, TokubetsuMei, RaceMei, Record, RaceLapTime, RaceKeika, RaceHassouJoukyou, OddsHaitou |
| `steps/30_shussouba.sql` | Kyousouba, Shussouba, ShussoubaSeiseki, ShussoubaTsuukaJuni, ShussoubaHassouJoukyou, Shoyuu, Banushi, Seisansha |
| `steps/40_choukyou.sql` | Choukyou, ChoukyouTime |
| `steps/90_verify.sql` | 移行元と移行先の件数の比較 |
| `steps/99_cleanup.sql` | 作業テーブル(`mig_*`)の削除 |

## 動作確認の状況

* SQLite: 架空のデータ(2レース分)で最後まで実行できることと、主な値を確認した。実データでは未確認。
* MySQL / PostgreSQL: 未実行。MySQL は 8.0 以降、`sql_mode = 'ANSI'` が必要。
  PostgreSQL は識別子の大文字小文字(クォートの有無)を、移行先のテーブルの作り方に合わせて調整が必要。

## 移行しないデータ・対応が無いデータ

* 旧 `ShussoubaKeika`: 新しい `ShussoubaKeika` は `RaceKeika.Keika` を Importer が解析した値で、形式が違う。
* 旧 `Race` の `JoukenKei` / `JoukenFuka1` / `JoukenFuka2`: 新 `Race` の条件フラグと一対一で対応しない。
* 旧 `Shussouba` の `Blinker` / `YosouShirushi*` / `Ninki` / `Odds`、旧 `Kyousouba` の
  `KoueiGaikokuKyuushaMei` / `HirabaOmoKousetsu` ほか、旧 `Kishu` の所属・資格区分: 新スキーマに列が無い。
* 旧 `Choukyou` の `Tanpyou` / `HonsuuCourse` / `HonsuuHanro` / `HonsuuPool` / `Rating`、
  旧 `ChoukyouRireki.ChoukyouBaba`、旧 `RaceHassouJoukyou.UmabanGun`: 新スキーマに列が無い。
* `ImportFile` / `ImportLog` / `UserSQL` / `Code` / `Japanize`: 新スキーマに対応するテーブルが無い。
* `ShussoubaYosou` / `ShussoubaHyouka` / `ShussoubaJoutai` / `ShussoubaChoukyou` / `RaceTrackBias` /
  `KaisaiYosou` / `Houbokusaki`: 旧スキーマに元データが無い。

## 前提と、実データで確認すべき点

* **コード値は変換せずにそのまま写す**(Grade, DirtShiba, Baba, Tenki, Seibetsu など)。
  新しい Importer は KOL のコードを内部コードに変換する表(`src/app/converters`)を持つが、
  旧 Analizer がどの値を保存していたかは、旧DBに実データが無く確認できていない。
  コードの意味が違う列があれば、`steps/*.sql` で `CASE` による変換が必要。
* **Id の付け方**
  * `Uma.Id` / `Kishu.Id` / `Choukyoushi.Id` は、KOL のコードをそのまま使う。移行先が空であることが前提。
  * 開催・レース・出走馬の Id は、Importer と同じ規則(日数 * 128 + 場所、* 64 + レース番号、* 64 + 馬番)。
    日数は UTC での 1970-01-01 からの経過日数。Importer の `getDaysFrom1970With` はローカル時刻の
    `Date` を使うので、`TZ=UTC` 以外で動かした Importer の Id とは一致しない。
  * `OddsHaitou.Id` は Importer と規則が違う。Importer は「確定」に 2bit しか割り当てておらず、
    確定(=4)が次のレースの予想(=0)と同じ Id になり得るため、3bit にしている。
  * `Choukyou.Id` は CRC16 の代わりに同じ馬・同じ日の連番を使う。
  * `RaceLapTime` / `RaceKeika` / `RaceHassouJoukyou` / `ShussoubaTsuukaJuni` / `ShussoubaHassouJoukyou` の
    Id は、このスクリプト独自の規則(一意であることのみ保証)。
* **日付**: 旧 DB の DATE 列は `YYYY-MM-DD` か `YYYY-MM-DD 00:00:00` の文字列である前提。
  新しい日付は `YYYYMMDD` の整数、開催Id・調教Id は 1970-01-01 からの経過日数。
* **Kishu / Choukyoushi / Uma**: 旧マスタに無く、出走馬・調教などにだけ出てくるものは、
  取れる範囲の項目(名前、所属場所など)だけで作る。祖先馬の馬名は `KanaBamei` に入れる
  (英字名の `EigoBamei` への振り分けはしない)。
* **Choukyou**: 場所・コース・脚色・併せ馬はコード化せず、`BashoCourse` / `OikiriSonota` /
  `AwaseReigai` に原文を入れる。`Noriyaku` は NULL。
* 日付のない旧レース(`Nengappi` が不正)は移行されない。件数は `90_verify.sql` の
  「Race(日付なしで除外)」で確認できる。
