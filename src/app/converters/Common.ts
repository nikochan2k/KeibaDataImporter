import { Codes } from "./Codes";

export const basho = new Codes(
  [
    { code: 0, kol: "00", jrdb: /08|京都/, naiyou: "京都" },
    { code: 1, kol: "01", jrdb: /09|阪神/, naiyou: "阪神" },
    { code: 2, kol: "02", jrdb: /07|中京/, naiyou: "中京" },
    { code: 3, kol: "03", jrdb: /10|小倉/, naiyou: "小倉" },
    { code: 4, kol: "04", jrdb: /05|東京/, naiyou: "東京" },
    { code: 5, kol: "05", jrdb: /06|中山/, naiyou: "中山" },
    { code: 6, kol: "06", jrdb: /03|福島/, naiyou: "福島" },
    { code: 7, kol: "07", jrdb: /04|新潟/, naiyou: "新潟" },
    { code: 8, kol: "08", jrdb: /01|札幌/, naiyou: "札幌" },
    { code: 9, kol: "09", jrdb: /02|函館/, naiyou: "函館" },
    { code: 10, kol: "10", jrdb: /35|大井/, naiyou: "大井" },
    { code: 11, kol: "11", jrdb: /36|川崎/, naiyou: "川崎" },
    { code: 12, kol: "12", jrdb: /34|船橋/, naiyou: "船橋" },
    { code: 13, kol: "13", jrdb: /33|浦和/, naiyou: "浦和" },
    { code: 14, kol: "14", jrdb: /岩見/, naiyou: "岩見" },
    { code: 15, kol: "15", jrdb: /21|旭川/, naiyou: "旭川" },
    { code: 16, kol: "16", jrdb: /帯広/, naiyou: "帯広" },
    { code: 17, kol: "17", jrdb: /野田/, naiyou: "野田" },
    { code: 18, kol: "18", jrdb: /北見/, naiyou: "北見" },
    { code: 19, kol: "19", jrdb: /38|笠松/, naiyou: "笠松" },
    { code: 20, kol: "20", jrdb: /37|金沢/, naiyou: "金沢" },
    { code: 21, kol: "21", jrdb: /47|荒尾/, naiyou: "荒尾" },
    { code: 22, kol: "22", jrdb: /31|宇都/, naiyou: "宇都" },
    { code: 23, kol: "23", jrdb: /46|佐賀/, naiyou: "佐賀" },
    { code: 24, kol: "24", jrdb: /48|中津/, naiyou: "中津" },
    { code: 25, kol: "25", jrdb: /32|高崎/, naiyou: "高崎" },
    { code: 26, kol: "26", jrdb: /45|高知/, naiyou: "高知" },
    { code: 27, kol: "27", jrdb: /30|足利/, naiyou: "足利" },
    { code: 28, kol: "28", jrdb: /27|上山/, naiyou: "上山" },
    { code: 29, kol: "29", jrdb: /26|水沢/, naiyou: "水沢" },
    { code: 30, kol: "30", jrdb: /29|三条/, naiyou: "三条" },
    { code: 31, kol: "31", jrdb: /紀井/, naiyou: "紀井" },
    { code: 32, kol: "32", jrdb: /43|益田/, naiyou: "益田" },
    { code: 33, kol: "33", jrdb: /25|盛岡/, naiyou: "盛岡" },
    { code: 34, kol: "34", jrdb: /39|名古/, naiyou: "名古屋" },
    { code: 35, kol: "35", jrdb: "22", naiyou: "札幌(地)" },
    { code: 36, kol: "36", jrdb: "24", naiyou: "函館(地)" },
    { code: 37, kol: "37", jrdb: /41|園田/, naiyou: "園田" },
    { code: 38, kol: "38", jrdb: /44|福山/, naiyou: "福山" },
    { code: 39, kol: "39", jrdb: /42|姫路/, naiyou: "姫路" },
    { code: 40, kol: "40", jrdb: "40", naiyou: "中京(地)" },
    { code: 41, kol: "41", jrdb: "28", naiyou: "新潟(地)" },
    { code: 42, kol: "42", jrdb: /23|門別/, naiyou: "門別" },
    { code: 43, kol: "43", jrdb: /弥富/, naiyou: "弥富" },
    { code: 44, kol: "44", jrdb: /小林/, naiyou: "小林" },
    { code: 45, kol: "45", jrdb: /西脇/, naiyou: "西脇" },
    { code: 46, kol: "46", jrdb: /境町/, naiyou: "境町" },
    { code: 47, kol: "47", jrdb: /小向/, naiyou: "小向" },
    { code: 50, kol: "50", jrdb: /栗東/, naiyou: "栗東" },
    { code: 51, kol: "51", jrdb: /美*南/, naiyou: "美浦南" },
    { code: 52, kol: "52", jrdb: /美*北/, naiyou: "美浦北" },
    { code: 49, jrdb: /美浦/, naiyou: "美浦" },
    { code: 53, kol: "53", jrdb: /白井/, naiyou: "白井" },
    { code: 54, kol: "54", jrdb: /道営/, naiyou: "道営" },
    { code: 55, kol: "55", jrdb: /岩手/, naiyou: "岩手" },
    { code: 56, kol: "56", jrdb: /岩見/, naiyou: "岩見" },
    { code: 57, kol: "57", jrdb: /旭川/, naiyou: "旭川" },
    { code: 58, kol: "58", jrdb: /帯広/, naiyou: "帯広" },
    { code: 59, kol: "59", jrdb: /北見/, naiyou: "北見" },
    { code: 60, kol: "60", jrdb: /71|香港/, naiyou: "香港" },
    { code: 65, kol: "65", jrdb: /68|UAE/, naiyou: "UAE" },
    { code: 66, kol: "66", jrdb: /67|カナダ/, naiyou: "加国" },
    { code: 70, kol: "70", jrdb: /西独|西ドイツ/, naiyou: "西独" },
    { code: 72, kol: "72", jrdb: /72|チリ/, naiyou: "チリ" },
    { code: 78, kol: "78", jrdb: /瑞西|スイス/, naiyou: "瑞西" },
    { code: 80, kol: "80", jrdb: "75", naiyou: "マカオ" },
    { code: 82, kol: "82", jrdb: /トルコ/, naiyou: "トルコ" },
    { code: 83, kol: "83", jrdb: /カター/, naiyou: "カタール" },
    { code: 85, kol: "85", jrdb: /韓国/, naiyou: "韓国" },
    { code: 86, kol: "86", jrdb: /ソウル/, naiyou: "ソウル" },
    { code: 87, kol: "87", jrdb: /プサン/, naiyou: "プサン" },
    { code: 88, kol: "88", jrdb: /ペルー/, naiyou: "ペルー" },
    { code: 89, kol: "89", jrdb: /サウジ/, naiyou: "サウジ" },
    { code: 90, kol: "90", jrdb: /兵庫/, naiyou: "兵庫" },
    { code: 91, kol: "91", jrdb: /栃木/, naiyou: "栃木" },
    { code: 92, kol: "92", jrdb: /バーレ/, naiyou: "バーレ" },
    { code: 94, kol: "94", jrdb: /南ア|南阿/, naiyou: "南ア" },
    { code: 99, kol: "99", jrdb: /北海/, naiyou: "北海道" },
    { code: 61, kol: "61", jrdb: /66|米|アメリ/, naiyou: "米国" },
    { code: 62, kol: "62", jrdb: /61|英|イギリ/, naiyou: "英国" },
    { code: 63, kol: "63", jrdb: /63|仏|フラン/, naiyou: "仏国" },
    { code: 64, kol: "64", jrdb: /62|愛|アイル/, naiyou: "愛国" },
    { code: 67, kol: "67", jrdb: /64|伊|イタリ/, naiyou: "伊国" },
    { code: 68, kol: "68", jrdb: /65|独|ドイツ/, naiyou: "独国" },
    { code: 69, kol: "69", jrdb: /69|豪|オーストラリア/, naiyou: "豪州" },
    { code: 71, kol: "71", jrdb: /70|新|ニュー/, naiyou: "新国" },
    { code: 73, kol: "73", jrdb: /亜|アルジ/, naiyou: "亜国" },
    { code: 74, kol: "74", jrdb: /伯|ブラジ/, naiyou: "伯国" },
    { code: 75, kol: "75", jrdb: /73|星|新嘉|シンガ/, naiyou: "新嘉坡" },
    { code: 76, kol: "76", jrdb: /74|瑞|スウェ/, naiyou: "瑞典" },
    { code: 77, kol: "77", jrdb: /西|スペイ/, naiyou: "西班牙" },
    { code: 79, kol: "79", jrdb: /白|ベルギー/, naiyou: "白耳義" },
    { code: 81, kol: "81", jrdb: /76|墺|オーストリア/, naiyou: "墺国" },
  ]
);

export enum TouzaiBetsu {
  Nishi = 1,
  Higashi,
  Sonota
}

export const touzaiBetsu = new Codes(
  [
    { code: TouzaiBetsu.Nishi, kol: "1", jrdb: "1", naiyou: "関西", tanshuku: "西" },
    { code: TouzaiBetsu.Higashi, kol: "2", jrdb: "2", naiyou: "関東", tanshuku: "東" },
    { code: TouzaiBetsu.Sonota, kol: /.*/, jrdb: /.*/, naiyou: "その他" },
  ]
);

export enum MasshouFlag {
  Geneki,
  Massou,
  Intai
}

export const masshouFlag = new Codes(
  [
    { code: MasshouFlag.Massou, kol: "1", jrdb: "1", naiyou: "抹消" },
    { code: MasshouFlag.Intai, kol: "2", naiyou: "引退" },
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
  Kakutei
}
