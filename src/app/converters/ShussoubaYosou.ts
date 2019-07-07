import { Codes } from "./Codes";

export const shirushi = new Codes(
  [
    { code: 1, kol: "0", jrdb: "1", naiyou: "◎" },
    { code: 2, kol: "1", jrdb: "2", naiyou: "○" },
    { code: 3, kol: "2", jrdb: "3", naiyou: "▲" },
    { code: 5, kol: "3", jrdb: /5|6/, naiyou: "△" },
    { code: 6, kol: "4", jrdb: "4", naiyou: "×" }
  ]
);

export const kyoriTekisei = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "短距離" },
    { code: 2, jrdb: "2", naiyou: "中距離" },
    { code: 3, jrdb: "3", naiyou: "長距離" },
    { code: 5, jrdb: "5", naiyou: "哩" },
    { code: 6, jrdb: "6", naiyou: "万能" }
  ]
);

export const choukyouYajirushi = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "デキ抜群" },
    { code: 2, jrdb: "2", naiyou: "上昇" },
    { code: 3, jrdb: "3", naiyou: "平行線" },
    { code: 4, jrdb: "4", naiyou: "やや下降気味" },
    { code: 5, jrdb: "5", naiyou: "デキ落ち" }
  ]
);

export const kyuushaHyouka = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "超強気" },
    { code: 2, jrdb: "2", naiyou: "強気" },
    { code: 3, jrdb: "3", naiyou: "現状維持" },
    { code: 4, jrdb: "4", naiyou: "弱気" }
  ]
);

export const hidumeCode = new Codes(
  [
    { code: 1, jrdb: "01", naiyou: "大ベタ" },
    { code: 2, jrdb: "02", naiyou: "中ベタ" },
    { code: 3, jrdb: "03", naiyou: "小ベタ" },
    { code: 4, jrdb: "04", naiyou: "細ベタ" },
    { code: 5, jrdb: "05", naiyou: "大立" },
    { code: 6, jrdb: "06", naiyou: "中立" },
    { code: 7, jrdb: "07", naiyou: "小立" },
    { code: 8, jrdb: "08", naiyou: "細立" },
    { code: 9, jrdb: "09", naiyou: "大標準" },
    { code: 10, jrdb: "10", naiyou: "中標準" },
    { code: 11, jrdb: "11", naiyou: "小標準" },
    { code: 12, jrdb: "12", naiyou: "細標準" },
    { code: 17, jrdb: "17", naiyou: "大標起" },
    { code: 18, jrdb: "18", naiyou: "中標起" },
    { code: 19, jrdb: "19", naiyou: "小標起" },
    { code: 20, jrdb: "20", naiyou: "細標起" },
    { code: 21, jrdb: "21", naiyou: "大標ベ" },
    { code: 22, jrdb: "22", naiyou: "中標ベ" },
    { code: 23, jrdb: "23", naiyou: "小標ベ" },
    { code: 24, jrdb: "24", naiyou: "細標ベ" },
  ]
);

export const joukenGroup = new Codes(
  [
    { code: 0, jrdb: "0", naiyou: "未勝利クラス" },
    { code: 1, jrdb: "1", naiyou: "1勝クラス" },
    { code: 2, jrdb: "2", naiyou: "2勝クラス" },
    { code: 3, jrdb: "3", naiyou: "準オープンクラス" },
    { code: 9, jrdb: "9", naiyou: "オープンクラス" },
  ]
);

export const courseDori = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "最内" },
    { code: 2, jrdb: "2", naiyou: "内" },
    { code: 3, jrdb: "3", naiyou: "中" },
    { code: 4, jrdb: "4", naiyou: "外" },
    { code: 5, jrdb: "5", naiyou: "大外" },
  ]
);

export const tenkaiKigou = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "逃馬", tanshuku: "<" },
    { code: 2, jrdb: "2", naiyou: "上がりの最も速い馬", tanshuku: "@" },
    { code: 3, jrdb: "3", naiyou: "上がりの速い馬(2,3番目)", tanshuku: "*" },
    { code: 4, jrdb: "4", naiyou: "データ不足で確認が必要な馬", tanshuku: "?" },
    { code: 0, jrdb: "0", naiyou: "その他", tanshuku: "(" },
  ]
);

export const yusouKubun = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "滞在" },
    { code: 2, jrdb: "2", naiyou: "通常" },
    { code: 3, jrdb: "3", naiyou: "遠征" },
    { code: 4, jrdb: "4", naiyou: "連闘" },
    { code: 0, jrdb: "5", naiyou: "不明" },
  ]
);

export const baguHenkouJouhou = new Codes(
  [
    { code: 0, jrdb: "0", naiyou: "馬具変更なし", tanshuku: "" },
    { code: 1, jrdb: "1", naiyou: "馬具変更（通常）", tanshuku: "通常" },
    { code: 2, jrdb: "2", naiyou: "馬具変更（特注）", tanshuku: "特注" },
  ]
);

export const ashimotoJouhou = new Codes(
  [
    { code: 0, jrdb: "0", naiyou: "平行線", tanshuku: "" },
    { code: 1, jrdb: "1", naiyou: "良化", tanshuku: "!" },
    { code: 2, jrdb: "2", naiyou: "疑問", tanshuku: "?" },
    { code: 3, jrdb: "3", naiyou: "悪化", tanshuku: "X" },
  ]
);

export const souhouZentai = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "ピッチ" },
    { code: 2, jrdb: "2", naiyou: "ストライド" }
  ]
);

export const souhouAshidukai = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "掻き込み" },
    { code: 2, jrdb: "2", naiyou: "投げ出し／振り出し" }
  ]
);

export const souhouKaiten = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "速い" },
    { code: 2, jrdb: "2", naiyou: "普通" },
    { code: 3, jrdb: "3", naiyou: "遅い" },
  ]
);

export const souhouHohaba = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "狭い" },
    { code: 2, jrdb: "2", naiyou: "普通" },
    { code: 3, jrdb: "3", naiyou: "広い" },
  ]
);

export const souhouAshiage = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "高い" },
    { code: 2, jrdb: "2", naiyou: "普通" },
    { code: 3, jrdb: "3", naiyou: "低い" },
  ]
);

export const taikeiZentai = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "長方形" },
    { code: 2, jrdb: "2", naiyou: "普通" },
    { code: 3, jrdb: "3", naiyou: "正方形" },
  ]
);

export const taikeiOkisa = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "大きい" },
    { code: 2, jrdb: "2", naiyou: "普通" },
    { code: 3, jrdb: "3", naiyou: "小さい" },
  ]
);

export const taikeiKakudo = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "大きい" },
    { code: 2, jrdb: "2", naiyou: "普通" },
    { code: 3, jrdb: "3", naiyou: "小さい" },
  ]
);

export const taikeiHohaba = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "広い" },
    { code: 2, jrdb: "2", naiyou: "普通" },
    { code: 3, jrdb: "3", naiyou: "狭い" },
  ]
);

export const taikeiNagasa = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "長い" },
    { code: 2, jrdb: "2", naiyou: "普通" },
    { code: 3, jrdb: "3", naiyou: "短い" },
  ]
);

export const taikeiO = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "上げる" },
    { code: 2, jrdb: "2", naiyou: "下げる" },
  ]
);

export const taikeiFuri = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "激しい" },
    { code: 2, jrdb: "2", naiyou: "少し" },
    { code: 3, jrdb: "3", naiyou: "あまり振らない" },
  ]
);

export const koukyuuFlag = new Codes(
  [
    { code: 0, jrdb: "0", naiyou: "通常" },
    { code: 1, jrdb: "1", naiyou: "降級" },
    { code: 2, jrdb: "2", naiyou: "2段階降級" },
  ]
);

export const gekisouType = new Codes(
  [
    { code: 1, jrdb: "A1", naiyou: "激走馬、中位人気グループで激走指数1番手", tanshuku: "A1" },
    { code: 2, jrdb: "A2", naiyou: "激走馬、中位人気グループで激走指数2番手", tanshuku: "A2" },
    { code: 3, jrdb: "A3", naiyou: "激走馬、中位人気グループで激走指数3番手", tanshuku: "A3" },
    { code: 4, jrdb: "A4", naiyou: "中位人気グループで激走指数4番手", tanshuku: "A4" },
    { code: 5, jrdb: "B1", naiyou: "下位人気グループで激走指数1番手", tanshuku: "B1" },
    { code: 6, jrdb: "B2", naiyou: "下位人気グループで激走指数2番手", tanshuku: "B2" },
  ]
);

export const shibaDirtShougaiFlag = new Codes(
  [
    { code: 0, jrdb: "0", naiyou: "変化なし" },
    { code: 1, jrdb: "1", naiyou: "トラック替り(芝ダ替り)" },
    { code: 2, jrdb: "2", naiyou: "初トラック(初芝,初ダ,初障)" },
  ]
);

export const kyoriFlag = new Codes(
  [
    { code: 0, jrdb: "0", naiyou: "経験有り" },
    { code: 1, jrdb: "1", naiyou: "最長距離" },
  ]
);

export const classFlag = new Codes(
  [
    { code: 0, jrdb: "0", naiyou: "変化なし" },
    { code: 1, jrdb: "1", naiyou: "昇級初戦" },
    { code: 2, jrdb: "2", naiyou: "降級" },
    { code: 3, jrdb: "3", naiyou: "格上挑戦" },
  ]
);

export const tenkyuuFlag = new Codes(
  [
    { code: 0, jrdb: "0", naiyou: "変化なし" },
    { code: 1, jrdb: "1", naiyou: "転厩1戦目" },
    { code: 2, jrdb: "2", naiyou: "転厩2戦目" },
    { code: 3, jrdb: "3", naiyou: "転厩3戦目" },
  ]
);

export const kyoseiFlag = new Codes(
  [
    { code: 0, jrdb: "0", naiyou: "変化なし" },
    { code: 1, jrdb: "1", naiyou: "去勢1戦目" },
    { code: 2, jrdb: "2", naiyou: "去勢2戦目" },
    { code: 3, jrdb: "3", naiyou: "去勢3戦目" },
  ]
);

export const houbokusakiRank = new Codes(
  [
    { code: 1, jrdb: "A", naiyou: "13%以上", tanshuku: "A" },
    { code: 2, jrdb: "B", naiyou: "11-13%", tanshuku: "B" },
    { code: 3, jrdb: "C", naiyou: "9-11%", tanshuku: "C" },
    { code: 4, jrdb: "D", naiyou: "7-9%", tanshuku: "D" },
    { code: 5, jrdb: "E", naiyou: "7%以下", tanshuku: "E" },
  ]
);

export const kyuushaRank = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "S級　ピンク", tanshuku: "S級" },
    { code: 2, jrdb: "2", naiyou: "A級　オレンジ", tanshuku: "A級" },
    { code: 3, jrdb: "3", naiyou: "B級　黄色", tanshuku: "B級" },
    { code: 5, jrdb: "5", naiyou: "C級", tanshuku: "C級" },
    { code: 6, jrdb: "6", naiyou: "D級　青", tanshuku: "D級" },
    { code: 7, jrdb: "7", naiyou: "E級　紫", tanshuku: "E級" },
    { code: 8, jrdb: "8", naiyou: "F級　灰色", tanshuku: "F級" },
    { code: 9, jrdb: "9", naiyou: "F級未満", tanshuku: "F級未満" },
  ]
);

export const lsHyouka = new Codes(
  [
    { code: 1, jrdb: "A", naiyou: "A" },
    { code: 2, jrdb: "B", naiyou: "B" },
    { code: 3, jrdb: "C", naiyou: "C" },
  ]
);

export const em = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "消し" },
  ]
);