import { Codes } from "./Codes";

export const basho = new Codes(
  [
    { code: 0, kol: "00", jrdb: /08|京都/, jvdata:"08", naiyou: "京都" },
    { code: 1, kol: "01", jrdb: /09|阪神/, jvdata:"00", naiyou: "阪神" },
    { code: 2, kol: "02", jrdb: /07|中京/, jvdata:"07", naiyou: "中京" },
    { code: 3, kol: "03", jrdb: /10|小倉/, jvdata:"10", naiyou: "小倉" },
    { code: 4, kol: "04", jrdb: /05|東京/, jvdata:"05", naiyou: "東京" },
    { code: 5, kol: "05", jrdb: /06|中山/, jvdata:"06", naiyou: "中山" },
    { code: 6, kol: "06", jrdb: /03|福島/, jvdata:"03", naiyou: "福島" },
    { code: 7, kol: "07", jrdb: /04|新潟/, jvdata:"04", naiyou: "新潟" },
    { code: 8, kol: "08", jrdb: /01|札幌/, jvdata:"01", naiyou: "札幌" },
    { code: 9, kol: "09", jrdb: /02|函館/, jvdata:"02", naiyou: "函館" },
    { code: 10, kol: "10", jrdb: /35|大井/, jvdata:"44", naiyou: "大井" },
    { code: 11, kol: "11", jrdb: /36|川崎/, jvdata:"45", naiyou: "川崎" },
    { code: 12, kol: "12", jrdb: /34|船橋/, jvdata:"43", naiyou: "船橋" },
    { code: 13, kol: "13", jrdb: /33|浦和/, jvdata:"42", naiyou: "浦和" },
    { code: 14, kol: "14", jrdb: /岩見/, naiyou: "岩見" },
    { code: 15, kol: "15", jrdb: /21|旭川/, naiyou: "旭川" },
    { code: 16, kol: "16", jrdb: /帯広/, naiyou: "帯広" },
    { code: 17, kol: "17", jrdb: /野田/, naiyou: "野田" },
    { code: 18, kol: "18", jrdb: /北見/, naiyou: "北見" },
    { code: 19, kol: "19", jrdb: /38|笠松/, jvdata:"47", naiyou: "笠松" },
    { code: 20, kol: "20", jrdb: /37|金沢/, jvdata:"46", naiyou: "金沢" },
    { code: 21, kol: "21", jrdb: /47|荒尾/, jvdata:"56", naiyou: "荒尾" },
    { code: 22, kol: "22", jrdb: /31|宇都/, jvdata:"40", naiyou: "宇都宮" },
    { code: 23, kol: "23", jrdb: /46|佐賀/, jvdata:"55", naiyou: "佐賀" },
    { code: 24, kol: "24", jrdb: /48|中津/, jvdata:"57", naiyou: "中津" },
    { code: 25, kol: "25", jrdb: /32|高崎/, jvdata:"41", naiyou: "高崎" },
    { code: 26, kol: "26", jrdb: /45|高知/, jvdata:"54", naiyou: "高知" },
    { code: 27, kol: "27", jrdb: /30|足利/, jvdata:"39", naiyou: "足利" },
    { code: 28, kol: "28", jrdb: /27|上山/, jvdata:"37", naiyou: "上山" },
    { code: 29, kol: "29", jrdb: /26|水沢/, jvdata:"36", naiyou: "水沢" },
    { code: 30, kol: "30", jrdb: /29|三条/, jvdata:"38", naiyou: "三条" },
    { code: 31, kol: "31", jrdb: /紀井/, jvdata:"49", naiyou: "紀三井寺" },
    { code: 32, kol: "32", jrdb: /43|益田/, jvdata:"52", naiyou: "益田" },
    { code: 33, kol: "33", jrdb: /25|盛岡/, jvdata:"35", naiyou: "盛岡" },
    { code: 34, kol: "34", jrdb: /39|名古/, jvdata:"48", naiyou: "名古屋" },
    { code: 35, kol: "35", jrdb: "22", jvdata:"58", naiyou: "札幌(地)" },
    { code: 36, kol: "36", jrdb: "24", jvdata:"59", naiyou: "函館(地)" },
    { code: 37, kol: "37", jrdb: /41|園田/, jvdata:"50", naiyou: "園田" },
    { code: 38, kol: "38", jrdb: /44|福山/, jvdata:"53", naiyou: "福山" },
    { code: 39, kol: "39", jrdb: /42|姫路/, jvdata:"51", naiyou: "姫路" },
    { code: 40, kol: "40", jrdb: "40", jvdata:"61", naiyou: "中京(地)" },
    { code: 41, kol: "41", jrdb: "28", jvdata:"60", naiyou: "新潟(地)" },
    { code: 42, kol: "42", jrdb: /23|門別/, jvdata:"30", naiyou: "門別" },
    { code: 43, kol: "43", jrdb: /弥富/, naiyou: "弥富" },
    { code: 44, kol: "44", jrdb: /小林/, naiyou: "小林" },
    { code: 45, kol: "45", jrdb: /西脇/, naiyou: "西脇" },
    { code: 46, kol: "46", jrdb: /境町/, naiyou: "境町" },
    { code: 47, kol: "47", jrdb: /小向/, naiyou: "小向" },
    { code: 49, jrdb: /美浦/, naiyou: "美浦" },
    { code: 50, kol: "50", jrdb: /栗東/, naiyou: "栗東" },
    { code: 51, kol: "51", jrdb: /美*南/, naiyou: "美浦南" },
    { code: 52, kol: "52", jrdb: /美*北/, naiyou: "美浦北" },
    { code: 53, kol: "53", jrdb: /白井/, naiyou: "白井" },
    { code: 54, kol: "54", jrdb: /道営/, naiyou: "道営" },
    { code: 55, kol: "55", jrdb: /岩手/, naiyou: "岩手" },
    { code: 56, kol: "56", jrdb: /岩見/, jvdata:"32", naiyou: "岩見沢" },
    { code: 57, kol: "57", jrdb: /旭川/, jvdata:"34", naiyou: "旭川" },
    { code: 58, kol: "58", jrdb: /帯広/, jvdata:"33", naiyou: "帯広" },
    { code: 59, kol: "59", jrdb: /北見/, jvdata:"31", naiyou: "北見" },
    { code: 60, kol: "60", jrdb: /71|香港/, jvdata:"G0", naiyou: "香港" },
    { code: 61, kol: "61", jrdb: /66|米|アメリ/, jvdata:"A4", naiyou: "アメリカ合衆国", tanshuku: "米国" },
    { code: 62, kol: "62", jrdb: /61|英|イギリ/, jvdata:"A6", naiyou: "イギリス", tanshuku: "英国" },
    { code: 63, kol: "63", jrdb: /63|仏|フラン/, jvdata:"A8", naiyou: "フランス", tanshuku: "仏国" },
    { code: 64, kol: "64", jrdb: /62|愛|アイル/, jvdata:"B2", naiyou: "アイルランド", tanshuku: "愛国" },
    { code: 65, kol: "65", jrdb: /68|UAE/, jvdata:"C7", naiyou:"アラブ首長国連邦", tanshuku: "UAE" },
    { code: 66, kol: "66", jrdb: /67|カナダ/, jvdata:"B8", naiyou:"カナダ", tanshuku: "加国" },
    { code: 67, kol: "67", jrdb: /64|伊|イタリ/, jvdata:"C0", naiyou: "イタリア", tanshuku: "伊国" },
    { code: 68, kol: "68", jrdb: /65|独|ドイツ/, jvdata:"C2", naiyou: "ドイツ", tanshuku: "独国" },
    { code: 69, kol: "69", jrdb: /69|豪|オーストラリア/, jvdata:"B6", naiyou: "オーストラリア", tanshuku: "豪州" },
    { code: 70, kol: "70", jrdb: /西独|西ドイツ/, jvdata:"H0", naiyou:"西ドイツ", tanshuku: "西独" },
    { code: 71, kol: "71", jrdb: /70|新|ニュー/, jvdata:"B4", naiyou: "ニュージーランド", tanshuku: "新国" },
    { code: 72, kol: "72", jrdb: /72|チリ/, jvdata:"F2", naiyou: "チリ" },
    { code: 73, kol: "73", jrdb: /亜|アルゼ/, jvdata:"E2", naiyou: "アルゼンチン", tanshuku: "亜国" },
    { code: 74, kol: "74", jrdb: /伯|ブラジ/, jvdata:"E4", naiyou: "ブラジル", tanshuku: "伯国" },
    { code: 75, kol: "75", jrdb: /73|星|新嘉|シンガ/, jvdata:"M0", naiyou: "シンガポール", tanshuku: "星国" },
    { code: 76, kol: "76", jrdb: /74|典|瑞|スウェ/, jvdata:"D0", naiyou: "スウェーデン", tanshuku: "典国" },
    { code: 77, kol: "77", jrdb: /西|スペイ/, jvdata:"G2", naiyou: "スペイン", tanshuku: "西国" },
    { code: 78, kol: "78", jrdb: /瑞西|スイス/, jvdata:"H4", naiyou: "スイス", tanshuku: "スイス" },
    { code: 79, kol: "79", jrdb: /白|ベルギー/, jvdata:"E6", naiyou: "ベルギー", tanshuku: "白国" },
    { code: 80, kol: "80", jrdb: "75", jvdata:"M2", naiyou: "マカオ" },
    { code: 81, kol: "81", jrdb: /76|墺|オーストリア/, jvdata:"M4", naiyou: "オーストリア", tanshuku: "墺国" },
    { code: 82, kol: "82", jrdb: /77|土|トルコ/, jvdata:"E8", naiyou: "トルコ", tanshuku: "土国" },
    { code: 83, kol: "83", jrdb: /華|カター/, jvdata:"M0", naiyou: "カタール", tanshuku: "華国" },
    { code: 84, jrdb: /印|インド/, jvdata:"B0", naiyou: "インド", tanshuku: "印" },
    { code: 85, kol: "85", jrdb: /韓国/, jvdata:"F0", naiyou: "韓国" },
    { code: 86, kol: "86", jrdb: /ソウル/, naiyou: "ソウル" },
    { code: 87, kol: "87", jrdb: /プサン/, naiyou: "プサン" },
    { code: 88, kol: "88", jrdb: /ペルー/, jvdata:"E0", naiyou: "ペルー" },
    { code: 89, kol: "89", jrdb: /サウジ/, jvdata:"K6", naiyou: "サウジアラビア", tanshuku: "サウジ" },
    { code: 90, kol: "90", jrdb: /兵庫/, naiyou: "兵庫" },
    { code: 91, kol: "91", jrdb: /栃木/, naiyou: "栃木" },
    { code: 92, jrdb: /イラク/, jvdata:"C6", naiyou: "イラク" },
    { code: 93, jrdb: /バーレ/, naiyou: "バーレーン", tanshuku: "バーレ" },
    { code: 94, jrdb: /シリア/, jvdata:"C8", naiyou: "シリア" },
    { code: 95, jrdb: /ハンガ/, jvdata:"D2", naiyou: "ハンガリー" },
    { code: 96, jrdb: /ポルト/, jvdata:"D4", naiyou: "ポルトガル" },
    { code: 97, jrdb: /ロシア/, jvdata:"D6", naiyou: "ロシア" },
    { code: 98, jrdb: /ウルグ/, jvdata:"D8", naiyou: "ウルグアイ" },
    { code: 99, kol: "99", jrdb: /北海/, naiyou: "北海道" },
    { code: 100, jrdb: /中国/, jvdata:"F1", naiyou: "中華人民共和国" },
    { code: 101, jrdb: /パナマ/, jvdata:"F2", naiyou: "パナマ" },
    { code: 102, jrdb: /南ア/, jvdata:"H2", naiyou: "南アフリカ" },
    { code: 103, jrdb: /モナコ/, jvdata:"H6", naiyou: "モナコ" },
    { code: 104, jrdb: /フィリ/, jvdata:"H8", naiyou: "フィリピン" },
    { code: 105, jrdb: /プエル/, jvdata:"I0", naiyou: "プエルトリコ" },
    { code: 106, jrdb: /コロンビア/, jvdata:"I2", naiyou: "コロンビア" },
    { code: 107, jrdb: /チェコス/, jvdata:"I4", naiyou: "チェコスロバキア" },
    { code: 108, jrdb: /チェコ/, jvdata:"I6", naiyou: "チェコ" },
    { code: 109, jrdb: /スロバ/, jvdata:"I8", naiyou: "スロバキア" },
    { code: 110, jrdb: /エクア/, jvdata:"J0", naiyou: "エクアドル" },
    { code: 111, jrdb: /ギリシ/, jvdata:"J2", naiyou: "ギリシャ" },
    { code: 112, jrdb: /マレー/, jvdata:"J4", naiyou: "マレーシア" },
    { code: 113, jrdb: /メキシ/, jvdata:"J6", naiyou: "メキシコ" },
    { code: 114, jrdb: /モロッ/, jvdata:"J8", naiyou: "モロッコ" },
    { code: 115, jrdb: /パキス/, jvdata:"K0", naiyou: "パキスタン" },
    { code: 116, jrdb: /ポーラ/, jvdata:"K2", naiyou: "ポーランド" },
    { code: 117, jrdb: /パラグ/, jvdata:"K4", naiyou: "パラグアイ" },
    { code: 118, jrdb: /キプロ/, jvdata:"K8", naiyou: "キプロス" },
    { code: 119, jrdb: /タイ/, jvdata:"L0", naiyou: "タイ" },
    { code: 120, jrdb: /ウクラ/, jvdata:"L2", naiyou: "ウクライナ" },
    { code: 121, jrdb: /ベネズ/, jvdata:"L4", naiyou: "ベネズエラ" },
    { code: 122, jrdb: /ユーゴ/, jvdata:"L6", naiyou: "ユーゴスラビア" },
    { code: 123, jrdb: /デンマ/, jvdata:"L8", naiyou: "デンマーク" },
    { code: 124, jrdb: /タイ/, jvdata:"L0", naiyou: "タイ" },
    { code: 125, jrdb: /ヨルダ/, jvdata:"M6", naiyou: "ヨルダン" },
    { code: 126, jrdb: /日本/, jvdata:"A2", naiyou: "日本" },
    { code: 127, jrdb: /外国/, jvdata:"A0", naiyou: "外国" },
  ]
);

export enum TouzaiBetsu {
  Sonota = 0,
  Nishi,
  Higashi,
  Chihou,
  Kaigai
}

export const touzaiBetsu = new Codes(
  [
    { code: TouzaiBetsu.Nishi, kol: "1", jrdb: "1", naiyou: "関西", tanshuku: "西" },
    { code: TouzaiBetsu.Higashi, kol: "2", jrdb: "2", naiyou: "関東", tanshuku: "東" },
    { code: TouzaiBetsu.Chihou, jvdata: "3", naiyou: "地方招待", tanshuku: "地方" },
    { code: TouzaiBetsu.Kaigai, jvdata: "4", naiyou: "海外招待", tanshuku: "海外" },
    { code: TouzaiBetsu.Sonota, kol: /.*/, jrdb: /.*/, naiyou: "その他" },
  ]
);

export enum MasshouFlag {
  Geneki,
  Massou
}

export const masshouFlag = new Codes(
  [
    { code: MasshouFlag.Massou, kol: /1|2/, jrdb: "1", naiyou: "抹消" },
    { code: MasshouFlag.Geneki, kol: /.*/, jrdb: /.*/, naiyou: "現役" },
  ]
);

export enum Baken {
  Tanshou,
  Fukushou,
  Wakuren,
  Umaren,
  Wide,
  Umatan,
  Sanrenpuku,
  Sanrentan
}

export const bakenShubetsu = new Codes(
  [
    { code: 0, naiyou: "単勝" },
    { code: 1, naiyou: "複勝" },
    { code: 2, naiyou: "枠連" },
    { code: 3, naiyou: "馬連" },
    { code: 4, naiyou: "ワイド" },
    { code: 5, naiyou: "馬単" },
    { code: 6, naiyou: "三連複" },
    { code: 7, naiyou: "三連単" }
  ]
);

export enum Kakutei {
  Yosou,
  Zenjitsu,
  ToujitsuAM,
  Chokuzen,
  Kakutei
}

export const hyouka = new Codes(
  [
    { code: 1, kol: "1", jrdb: "1", naiyou: "◎" },
    { code: 2, kol: "2", jrdb: "2", naiyou: "○" },
    { code: 3, kol: "3", jrdb: "3", naiyou: "△" },
  ]
);

export const seibetsu = new Codes(
  [
    { code: 1, jvdata: "1", naiyou: "男性" },
    { code: 2, jvdata: "2", naiyou: "女性" },
  ]
);
