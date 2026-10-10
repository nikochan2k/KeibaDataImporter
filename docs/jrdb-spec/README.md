# JRDB データ仕様書と見本データ

[JRDB のデータ仕様ページ](http://home.jrdb.com/program/data.html) から取得したもの(2026-10-10)。文字コードは Windows-932。

- `*/xxx_doc.txt`, `*siyo_doc.txt`: データ仕様書、データの説明
- `*/XXXyymmdd.txt`: 見本データ(実データの抜粋)
- `jrdb_code.txt`, `tokki_code.txt`, `bagu_code.txt`, `ashimoto_code.txt`, `keito_code.txt`, `cyokyo_course_code.txt`, `oi_code.txt`: コード表
- `data.html`: 取得元ページ(Windows-932)

サイトに実体がないため、`Sra/srasiyo_doc.txt` と `Zed/ZED020908.txt` は取得していない(ページ上でも前者はコメントアウト、後者はリンク切れ)。

## 見本データの癖

- 2008 年以前の見本は、レコード末尾の改行が `LF LF` になっている(長さはレコード長どおり)。
- TYB・HJC の見本は改行が `LF` だけで、レコード長より 1 バイト短い。テストでは仕様書どおりの `CR LF` にそろえた複製を使う。
- `Bac/bac_doc.txt` は見出しのレコード長が 176 だが、項目表と見本データは 184 バイト。
- `Kaa/kaa_doc.txt` の「ダ馬場状態内」の相対位置 42 は誤記(ダ馬場状態コードの 2 桁目と重なる。KAB と同じ 43 が正しい)。

## 使い方

`test/spec.test.ts` が、この仕様書と見本データを使って次を確かめる。

- 仕様書の項目表の長さがレコード長と一致する。リーダーのレコード長が仕様書と一致する。
- 見本データを取り込んで、エラーが出ない。リーダーが読んだ範囲が、すべて仕様書の項目の中に収まる。
- コード表のすべてのコードを変換できる。
- SED・KYI・HJC・OZ は、仕様書の項目名で取り出した値と、取り込み結果が一致する。

`bun test` では時間のかかる OV(3連単)・ZEC・ZKB の取り込みを省く。すべて取り込むときは `JRDB_SPEC_FULL=1 bun test test/spec.test.ts`(約 80 秒)。
