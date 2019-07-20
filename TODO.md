* 
* ShussoubaChoukyou -> ChoukyouJrdb, タイムがREALじゃない, 1週前調教がない, 中間と本追い切りを分ける
* Choukyou -> ChoukyouJrdb, Shussoubaに紐付ける
* 見出しの定義がJRDBにない, IDの作り方もミスってる
* KTAを入れる
* 調教の変換テーブルが抜けている、中間追い切り指数
* 調教の場所コードと一般の場所コードを合わせる
* KOLのコースはJRDBの調教トラックに合わせる、コースも維持する
* ダートのTrackBiasの変換コード間違い
* 出走直後の横離れてをカウントする
* 前3F先頭差、馬ペース流れ
* 輸送区分のスペルミス


* 中央・地方・外国は競馬場コードから変換できる
* KOLで開催区分は競馬場コードから変換できる
* ×ShussoubaSeisekiの乗り替わりは算出できる→データがない場合があるので算出できない
* JRDB、KOL、JRAVAN、JVDATAの優先度を決める
  * RaceKeikaはKOLを優先
* LZH解凍でディレクトリを扱えるようにする