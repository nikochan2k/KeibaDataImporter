import { Codes } from "./Codes";

export const choukyouFlag = new Codes(
  [
    { code: 0, kol: "0", naiyou: "前回" },
    { code: 1, kol: "1", naiyou: "追切り" }
  ]
);

export enum Noriyaku {
  Joshu = 1,
  Choukyoushi = 2,
  HonbanKishu = 3,
  ChoukyouKishu = 4,
  Minarai = 5
}

export const noriyaku = new Codes(
  [
    { code: 1, kol: /助手/, jrdb: "1", naiyou: "助手" },
    { code: 2, kol: /調教師/, jrdb: "2", naiyou: "調教師" },
    { code: 3, jrdb: "3", naiyou: "本番騎手" },
    { code: 4, jrdb: "4", naiyou: "調教騎手" },
    { code: 5, kol: /見習/, jrdb: "5", naiyou: "見習" }
  ]
);

export enum ChoukyouBasho {
  Sonota = 199
}

export const basho = new Codes(
  [
    { code: 0, kol: /京都/, jrdb: /36|37|47/, naiyou: "京都" },
    { code: 1, kol: /阪神/, jrdb: /38|39|48/, naiyou: "阪神" },
    { code: 2, kol: /中京/, jrdb: /34|35|46/, naiyou: "中京" },
    { code: 3, kol: /小倉/, jrdb: /40|41|49/, naiyou: "小倉" },
    { code: 4, kol: /東京/, jrdb: /30|31|44/, naiyou: "東京" },
    { code: 5, kol: /中山/, jrdb: /32|33|45/, naiyou: "中山" },
    { code: 6, kol: /福島/, jrdb: /26|27|42/, naiyou: "福島" },
    { code: 7, kol: /新潟/, jrdb: /28|29|43/, naiyou: "新潟" },
    { code: 8, kol: /札幌/, jrdb: /21|22/, naiyou: "札幌" },
    { code: 9, kol: /函館/, jrdb: /23|24|25/, naiyou: "函館" },
    { code: 10, kol: /大井/, naiyou: "大井" },
    { code: 11, kol: /川崎/, naiyou: "川崎" },
    { code: 12, kol: /船橋/, naiyou: "船橋" },
    { code: 13, kol: /浦和/, naiyou: "浦和" },
    { code: 14, kol: /岩見/, naiyou: "岩見" },
    { code: 15, kol: /旭川/, naiyou: "旭川" },
    { code: 16, kol: /帯広/, naiyou: "帯広" },
    { code: 17, kol: /野田/, naiyou: "野田" },
    { code: 18, kol: /北見/, naiyou: "北見" },
    { code: 19, kol: /笠松/, naiyou: "笠松" },
    { code: 20, kol: /金沢/, naiyou: "金沢" },
    { code: 21, kol: /荒尾/, naiyou: "荒尾" },
    { code: 22, kol: /宇都/, naiyou: "宇都" },
    { code: 23, kol: /佐賀/, naiyou: "佐賀" },
    { code: 24, kol: /中津/, naiyou: "中津" },
    { code: 25, kol: /高崎/, naiyou: "高崎" },
    { code: 26, kol: /高知/, naiyou: "高知" },
    { code: 27, kol: /足利/, naiyou: "足利" },
    { code: 28, kol: /上山/, naiyou: "上山" },
    { code: 29, kol: /水沢/, naiyou: "水沢" },
    { code: 30, kol: /三条/, naiyou: "三条" },
    { code: 31, kol: /紀井/, naiyou: "紀井" },
    { code: 32, kol: /益田/, naiyou: "益田" },
    { code: 33, kol: /盛岡/, naiyou: "盛岡" },
    { code: 34, kol: /名古/, naiyou: "名古" },
    { code: 37, kol: /園田/, naiyou: "園田" },
    { code: 38, kol: /福山/, naiyou: "福山" },
    { code: 39, kol: /姫路/, naiyou: "姫路" },
    { code: 42, kol: /門別/, naiyou: "門別" },
    { code: 43, kol: /弥富/, naiyou: "弥富" },
    { code: 44, kol: /小林/, naiyou: "小林" },
    { code: 45, kol: /西脇/, naiyou: "西脇" },
    { code: 46, kol: /境町/, naiyou: "境町" },
    { code: 47, kol: /小向/, naiyou: "小向" },
    { code: 50, kol: /栗東/, jrdb: /11|12|13|14|15|16|17|18|19|82/, naiyou: "栗東" },
    { code: 51, kol: /美.*南/, jrdb: /01|02|03|04|05|10/, naiyou: "美浦南" },
    { code: 52, kol: /美.*北/, jrdb: /06|07|08|09|62|68|70/, naiyou: "美浦北" },
    { code: 53, kol: /白井/, jrdb: "93", naiyou: "白井" },
    { code: 54, kol: /道営/, naiyou: "道営" },
    { code: 55, kol: /岩手/, naiyou: "岩手" },
    { code: 56, kol: /岩見/, naiyou: "岩見" },
    { code: 57, kol: /旭川/, naiyou: "旭川" },
    { code: 58, kol: /帯広/, naiyou: "帯広" },
    { code: 59, kol: /北見/, naiyou: "北見" },
    { code: 60, kol: /香港/, naiyou: "香港" },
    { code: 61, kol: /米国/, naiyou: "米国" },
    { code: 62, kol: /英国/, naiyou: "英国" },
    { code: 63, kol: /仏国/, naiyou: "仏国" },
    { code: 64, kol: /愛国/, naiyou: "愛国" },
    { code: 65, kol: /UAE/, naiyou: "UAE" },
    { code: 66, kol: /加国/, naiyou: "加国" },
    { code: 67, kol: /伊国/, naiyou: "伊国" },
    { code: 68, kol: /独国/, naiyou: "独国" },
    { code: 69, kol: /豪州/, naiyou: "豪州" },
    { code: 70, kol: /西独/, naiyou: "西独" },
    { code: 71, kol: /新国/, naiyou: "新国" },
    { code: 72, kol: /チリ/, naiyou: "チリ" },
    { code: 73, kol: /亜国/, naiyou: "亜国" },
    { code: 74, kol: /伯国/, naiyou: "伯国" },
    { code: 75, kol: /新嘉坡/, naiyou: "新嘉坡" },
    { code: 76, kol: /瑞典/, naiyou: "瑞典" },
    { code: 77, kol: /西班牙/, naiyou: "西班牙" },
    { code: 78, kol: /瑞西/, naiyou: "瑞西" },
    { code: 79, kol: /白耳義/, naiyou: "白耳義" },
    { code: 80, kol: /マカオ/, naiyou: "マカオ" },
    { code: 81, kol: /墺国/, naiyou: "墺国" },
    { code: 82, kol: /トルコ/, naiyou: "トルコ" },
    { code: 83, kol: /カター/, naiyou: "カタール" },
    { code: 85, kol: /韓国/, naiyou: "韓国" },
    { code: 86, kol: /ソウル/, naiyou: "ソウル" },
    { code: 87, kol: /プサン/, naiyou: "プサン" },
    { code: 88, kol: /ペルー/, naiyou: "ペルー" },
    { code: 89, kol: /サウジ/, naiyou: "サウジ" },
    { code: 90, kol: /兵庫/, naiyou: "兵庫" },
    { code: 91, kol: /栃木/, naiyou: "栃木" },
    { code: 92, kol: /バーレ/, naiyou: "バーレ" },
    { code: 94, kol: /南ア/, naiyou: "南ア" },
    { code: 96, kol: /墺国/, naiyou: "墺国" },
    { code: 97, kol: /瑞国/, naiyou: "瑞国" },
    { code: 98, kol: /星国/, naiyou: "星国" },
    { code: 99, kol: /北海/, naiyou: "北海" },
    { code: 35, kol: /札/, naiyou: "札幌(地方)" },
    { code: 36, kol: /函/, naiyou: "函館(地方)" },
    { code: 40, kol: /中/, naiyou: "中京(地方)" },
    { code: 41, kol: /新/, naiyou: "新潟(地方)" },
    { code: 100, jrdb: "81", naiyou: "美浦" },
    { code: 101, jrdb: "50", naiyou: "地方" },
    { code: ChoukyouBasho.Sonota, kol: /.+/, jrdb: "B1", naiyou: "他" }
  ]
);

export enum ChoukyouType {
  Hanro = 1,
  Shiba,
  Dirt,
  WoodChip,
  Polytrack,
  Shougai,
  Pool,
  Rentou,
  Gate,
  ShougaiShiken,
  Bokujou,
  Sonota
}

export const type = new Codes(
  [
    { code: ChoukyouType.Hanro, kol: /坂/, jrdb: /01|11/, naiyou: "坂路", tanshuku: "坂" },
    { code: ChoukyouType.ShougaiShiken, kol: /試/, jrdb: "61", naiyou: "障害試験", tanshuku: "障試" },
    { code: ChoukyouType.Shougai, kol: /障|[美北栗].*A/, jrdb: /08|18|42|43|44|45|46|47|48|49|70/, naiyou: "障害", tanshuku: "障" },
    { code: ChoukyouType.Shiba, kol: /芝/, jrdb: /04|16|22|24|26|28|30|32|34|36|38|40/, naiyou: "芝", tanshuku: "芝" },
    { code: ChoukyouType.Dirt, kol: /ダ|南.*[AD]|北.*[BC]|栗.*[BE]/, jrdb: /03|05|06|07|14|15|21|23|27|29|31|33|35|37|39|41|93/, naiyou: "ダート", tanshuku: "ダ" },
    { code: ChoukyouType.WoodChip, kol: /W|[美南].*B|栗.*C/, jrdb: /02|12|13/, naiyou: "ウッドチップ", tanshuku: "W" },
    { code: ChoukyouType.Polytrack, kol: /[ポP]/, jrdb: /10|17/, naiyou: "ポリトラック", tanshuku: "P" },
    { code: ChoukyouType.Pool, kol: /プール/, jrdb: /09|19/, naiyou: "プール", tanshuku: "プ" },
    { code: ChoukyouType.Rentou, kol: /連闘/, jrdb: "A1", naiyou: "連闘", tanshuku: "連闘" },
    { code: ChoukyouType.Gate, kol: /ゲ/, jrdb: /81|82/, naiyou: "ゲート", tanshuku: "ゲ" },
    { code: ChoukyouType.Bokujou, kol: /牧/, jrdb: "88", naiyou: "牧場", tanshuku: "牧" },
    { code: ChoukyouType.Sonota, kol: /.+/, jrdb: /50|B1/, naiyou: "その他", tanshuku: "他" },
  ]
);

export const course = new Codes(
  [
    { code: 1, kol: /A|[美北栗].*障/, jrdb: /05|08|70/, naiyou: "A" },
    { code: 2, kol: /B|[美南].*W/, jrdb: /02|06|14/, naiyou: "B" },
    { code: 3, kol: /C|[美南].*[芝ポP]|栗.*W/, jrdb: /04|07|10|12/, naiyou: "C" },
    { code: 4, kol: /D|栗.*[芝WポP]/, jrdb: /03|13|16|17/, naiyou: "D" },
    { code: 5, kol: /E/, jrdb: /15/, naiyou: "E" }
  ]
);

export const baba = new Codes(
  [
    { code: 0, kol: "良", naiyou: "良" },
    { code: 1, kol: "稍", naiyou: "稍重" },
    { code: 2, kol: "重", naiyou: "重" },
    { code: 3, kol: "不", naiyou: "不良" }
  ]
);

export const oikiri = new Codes(
  [
    { code: 1, kol: /一杯/, jrdb: "1", naiyou: "一杯" },
    { code: 2, kol: /強(目|め)/, jrdb: "2", naiyou: "強目" },
    { code: 3, kol: /馬(なり|ナリ)/, jrdb: "3", naiyou: "馬なり" },
  ]
);

export const ashiiro = new Codes(
  [
    { code: 1, kol: /余力/, naiyou: "余力" },
    { code: 2, kol: /バテる/, naiyou: "バテる" },
    { code: 3, kol: /楽走/, naiyou: "楽走" },
  ]
);

export const yajirushi = new Codes(
  [
    { code: 1, kol: "1", naiyou: "一変" },
    { code: 2, kol: "2", naiyou: "平行" },
    { code: 3, kol: "3", naiyou: "下降" },
    { code: 4, kol: "4", naiyou: "良化" },
    { code: 5, kol: "5", naiyou: "下降気味" }
  ]
);

export enum AwaseKekka {
  Senchaku = 1,
  Dounyuu,
  Okure
}

export const awaseKekka = new Codes(
  [
    { code: AwaseKekka.Senchaku, kol: /先着/, jrdb: "1", naiyou: "先着" },
    { code: AwaseKekka.Dounyuu, kol: /同入/, jrdb: "2", naiyou: "同入" },
    { code: AwaseKekka.Okure, kol: /遅れ/, jrdb: "3", naiyou: "遅れ" }
  ]
);

export const chakusa = new Codes(
  [
    { code: 1, kol: /ハナ/, naiyou: "ハナ" },
    { code: 2, kol: /アタマ/, naiyou: "アタマ" },
    { code: 3, kol: /クビ/, naiyou: "クビ" }
  ]
);