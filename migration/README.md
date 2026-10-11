# KeibaDataAnalizer のデータベースを移行する

旧 KeibaDataAnalizer の SQLite データベース(`Keiba.sql` のスキーマ)を、このプロジェクトの
データベース(`src/app/entities`)へ移行する。

```
bun start    # 移行先に空のテーブルを作る(SQLite の場合)
migration/migrate-sqlite.sh <移行元 Keiba.sqlite> <移行先 keiba.sqlite>
migration/migrate-mysql.sh <移行先DB名> [mysql のオプション...]
migration/migrate-postgresql.sh <接続文字列 または DB名> [psql のオプション...]
```

MySQL / PostgreSQL では、移行先にテーブルを作成済みで、移行元のテーブル(`Keiba.sql` と同じ構造)が
データベース/スキーマ `old` にあることが前提になる。`migration/old/Keiba.sql` は SQLite 用の記述
(`PRAGMA`、`INTEGER PRIMARY KEY AUTOINCREMENT` など)なので、そのままは流せない。

SQL は `steps/` に分かれている。`dialect/` は DB 固有の部分(日付のカレンダーを作る処理)だけで、
`steps/*.sql` は SQLite / MySQL / PostgreSQL 共通の書き方にしてある。移行元のテーブルは
`old.` を付けて参照する(SQLite は ATTACH ... AS old、MySQL は DB 名 old、PostgreSQL はスキーマ名 old)。

| ファイル | 内容 |
| --- | --- |
| `dialect/*.sql` | カレンダー(`mig_calendar`)の作成 |
| `steps/10_master.sql` | Jinmei, Kishu, KishuMei, Choukyoushi, ChoukyoushiMei, Uma |
| `steps/20_race.sql` | Kaisai, Race, RaceSeiseki, TokubetsuMei, RaceMei, Record, RaceLapTime, RaceKeika, RaceHassouJoukyou, OddsHaitou |
| `steps/30_shussouba.sql` | Kyousouba, Shussouba, ShussoubaSeiseki, ShussoubaTsuukaJuni, ShussoubaHassouJoukyou, Shoyuu, Banushi, Seisansha |
| `steps/40_choukyou.sql` | Choukyou, ChoukyouTime, ShussoubaChoukyou, ShussoubaHyouka(調教短評・調教本数) |
| `steps/90_verify.sql` | 移行元と移行先の件数の比較 |
| `steps/99_cleanup.sql` | 作業テーブル(`mig_*`)の削除 |
| `fill-matching-key.ts` | `Jinmei` / `Shoyuu` の `MatchingKey` を埋め、キーが同じになった `Jinmei` を1行にまとめる(SQL では計算できないので、SQL の後に実行する。`migrate-sqlite.sh` は自動で実行する。MySQL / PostgreSQL は手動で、SQLite 専用のスクリプトなので同じ計算で更新すること) |
| `fill-choukyou-id.ts` | `Choukyou` の `Basho` / `Type` / `Course` / `Renban` を埋め、`Choukyou` の Id と `ChoukyouTime` / `ShussoubaChoukyou` の `ChoukyouId` を Importer と同じ規則で振り直す(場所・種別のコード化を SQL では書けないため。`migrate-sqlite.sh` は自動で実行する。MySQL / PostgreSQL は手動で同じ計算をすること) |

## 動作確認の状況

* SQLite: 架空のデータ(2レース分)で最後まで実行できることと、主な値を確認した。実データでは未確認。
* MySQL / PostgreSQL: 実行環境が無く未実行(シェルは構文チェックのみ)。
  * MySQL は 8.0 以降。`migrate-mysql.sh` は `sql_mode = 'ANSI'` で実行する。DDL で暗黙コミットされるため、
    途中で失敗してもロールバックされない。
  * PostgreSQL は、移行先のテーブル・列がクォートなしの小文字の名前であることが前提
    (TypeORM が作る `"Race"` のような名前なら、小文字に直すか SQL の識別子を合わせる)。
    `migrate-postgresql.sh` は全体を1トランザクションで実行する。

## 移行しないデータ・対応が無いデータ

* 旧 `ShussoubaKeika`: 新しい `ShussoubaKeika` は `RaceKeika.Keika` を Importer が解析した値で、形式が違う。
* 旧 `Race` の `JoukenKei` / `JoukenFuka1` / `JoukenFuka2`: 新 `Race` の条件フラグと一対一で対応しない。
* 旧 `Shussouba` の `YosouShirushi*` / `Ninki` / `Odds`、旧 `Kyousouba` の
  `KoueiGaikokuKyuushaMei` / `HirabaOmoKousetsu` ほか、旧 `Kishu` の資格区分・所属場所: 新スキーマに列が無い。
  (旧 `Blinker` は `Shussouba.Blinker` と `ShussoubaJoutai` に、旧 `Kishu` の東西別・所属厩舎・見習い区分は
  `Kishu.Shozoku` / `ShozokuChoukyoushiId` / `MinaraiKubun` に移す。)
* 旧 `Choukyou` の `Rating` / `KyuuyouRiyuu`、
  旧 `ChoukyouRireki.ChoukyouBaba`、旧 `RaceHassouJoukyou.UmabanGun`: 新スキーマに列が無い。
* `ImportFile` / `ImportLog` / `UserSQL` / `Code` / `Japanize`: 新スキーマに対応するテーブルが無い。
* `ShussoubaYosou` / `ShussoubaHyouka`(調教短評・調教本数以外) / `ShussoubaJoutai` / `RaceTrackBias` /
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
  * `Choukyou.Id` は Importer と同じ規則(馬・日付・場所・種別・連番)。`40_choukyou.sql` は仮の Id で入れ、
    `fill-choukyou-id.ts` で振り直す。同じ馬・同じ日・同じ場所・同じ種別の調教が 5 件以上あると Id に収まらず、エラーで止まる。
  * `RaceLapTime` / `RaceKeika` / `RaceHassouJoukyou` / `ShussoubaTsuukaJuni` / `ShussoubaHassouJoukyou` の
    Id は、このスクリプト独自の規則(一意であることのみ保証)。
* **日付**: 旧 DB の DATE 列は `YYYY-MM-DD` か `YYYY-MM-DD 00:00:00` の文字列である前提。
  新しい日付は `YYYYMMDD` の整数、開催Id・調教Id は 1970-01-01 からの経過日数。
* **Kishu / Choukyoushi / Uma**: 旧マスタに無く、出走馬・調教などにだけ出てくるものは、
  取れる範囲の項目(名前、所属場所など)だけで作る。祖先馬の馬名は `KanaBamei` に入れる
  (英字名の `EigoBamei` への振り分けはしない)。
* **Choukyou**: 場所・コース・脚色・併せ馬は `BashoCourse` / `OikiriSonota` / `AwaseReigai` に原文を入れる。
  `Basho` / `Type` / `Course` だけは Id に必要なため、`BashoCourse` を Importer の変換表でコード化して入れる。
  `Noriyaku` は NULL。同じ調教は1件にまとめ、どの出走馬に出てきたか(と矢印・例外)は `ShussoubaChoukyou` に入れる。
  `ShussoubaChoukyou.ChoukyouFlag` は旧テーブルに無いので NULL。
* 日付のない旧レース(`Nengappi` が不正)は移行されない。件数は `90_verify.sql` の
  「Race(日付なしで除外)」で確認できる。
