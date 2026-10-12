/**
 * 名前の区分。人名 (Jinmei) にも、馬主・生産者の名前 (Shoyuu) にも使う。
 * 同じ表記がどの区分かは人によって違うため、名前の辞書ではなく、
 * 人や生産者・馬主と名前をつなぐ表 (KishuMei・ChoukyoushiMei・SeisanshaMei・BanushiMei) に持つ。
 * 閲覧では番号の小さい区分 (名称) を先に表示する。
 */
export enum MeishouKubun {
  /** 名称。人なら姓名、馬主・生産者なら正式名 (法人格を除いたもの) */
  Meishou,
  Tanshuku,
  /** フリガナ (半角カナは全角にしたもの) */
  Furigana,
  /** 欧字の名前 */
  Eigo,
}
