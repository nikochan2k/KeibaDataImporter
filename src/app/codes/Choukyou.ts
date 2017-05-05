import { Codes } from "./Codes";

export const oikiri = new Codes(
  [
    { code: 0, kol: "0", naiyou: "前回" },
    { code: 1, kol: "1", naiyou: "追切り" }
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

export const bashoCourse = new Codes(
  [
    { code: 1, jrdb: "01", naiyou: "美浦坂路", tanshuku: "美坂" },
    { code: 2, jrdb: "02", naiyou: "南W", tanshuku: "南W" },
    { code: 3, jrdb: "03", naiyou: "南D", tanshuku: "南D" },
    { code: 4, jrdb: "04", naiyou: "南芝", tanshuku: "南芝" },
    { code: 5, jrdb: "05", naiyou: "南A", tanshuku: "南A" },
    { code: 6, jrdb: "06", naiyou: "北B", tanshuku: "北B" },
    { code: 7, jrdb: "07", naiyou: "北C", tanshuku: "北C" },
    { code: 8, jrdb: "08", naiyou: "美浦障害芝", tanshuku: "美障" },
    { code: 9, jrdb: "09", naiyou: "美浦プール", tanshuku: "美プ" },
    { code: 10, jrdb: "10", naiyou: "南ポリトラック", tanshuku: "南P" },
    { code: 11, jrdb: "11", naiyou: "栗東坂路", tanshuku: "栗坂" },
    { code: 12, jrdb: "12", naiyou: "CW", tanshuku: "CW" },
    { code: 13, jrdb: "13", naiyou: "DW", tanshuku: "DW" },
    { code: 14, jrdb: "14", naiyou: "栗B", tanshuku: "栗B" },
    { code: 15, jrdb: "15", naiyou: "栗E", tanshuku: "栗E" },
    { code: 16, jrdb: "16", naiyou: "栗芝", tanshuku: "栗芝" },
    { code: 17, jrdb: "17", naiyou: "栗ポリトラック", tanshuku: "栗P" },
    { code: 18, jrdb: "18", naiyou: "栗東障害", tanshuku: "栗障" },
    { code: 19, jrdb: "19", naiyou: "栗東プール", tanshuku: "栗プ" },
    { code: 21, jrdb: "21", naiyou: "札幌ダ", tanshuku: "札ダ" },
    { code: 22, jrdb: "22", naiyou: "札幌芝", tanshuku: "札芝" },
    { code: 23, jrdb: "23", naiyou: "函館ダ", tanshuku: "函ダ" },
    { code: 24, jrdb: "24", naiyou: "函館芝", tanshuku: "函芝" },
    { code: 25, jrdb: "25", naiyou: "函館W", tanshuku: "函W" },
    { code: 26, jrdb: "26", naiyou: "福島芝", tanshuku: "福芝" },
    { code: 27, jrdb: "27", naiyou: "福島ダ", tanshuku: "福ダ" },
    { code: 28, jrdb: "28", naiyou: "新潟芝", tanshuku: "新芝" },
    { code: 29, jrdb: "29", naiyou: "新潟ダ", tanshuku: "新ダ" },
    { code: 30, jrdb: "30", naiyou: "東京芝", tanshuku: "東芝" },
    { code: 31, jrdb: "31", naiyou: "東京ダ", tanshuku: "東ダ" },
    { code: 32, jrdb: "32", naiyou: "中山芝", tanshuku: "中芝" },
    { code: 33, jrdb: "33", naiyou: "中山ダ", tanshuku: "中ダ" },
    { code: 34, jrdb: "34", naiyou: "中京芝", tanshuku: "名芝" },
    { code: 35, jrdb: "35", naiyou: "中京ダ", tanshuku: "名ダ" },
    { code: 36, jrdb: "36", naiyou: "京都芝", tanshuku: "京芝" },
    { code: 37, jrdb: "37", naiyou: "京都ダ", tanshuku: "京ダ" },
    { code: 38, jrdb: "38", naiyou: "阪神芝", tanshuku: "阪芝" },
    { code: 39, jrdb: "39", naiyou: "阪神ダ", tanshuku: "阪ダ" },
    { code: 40, jrdb: "40", naiyou: "小倉芝", tanshuku: "小芝" },
    { code: 41, jrdb: "41", naiyou: "小倉ダ", tanshuku: "小ダ" },
    { code: 42, jrdb: "42", naiyou: "福島障害", tanshuku: "福障" },
    { code: 43, jrdb: "43", naiyou: "新潟障害", tanshuku: "新障" },
    { code: 44, jrdb: "44", naiyou: "東京障害", tanshuku: "東障" },
    { code: 45, jrdb: "45", naiyou: "中山障害", tanshuku: "中障" },
    { code: 46, jrdb: "46", naiyou: "中京障害", tanshuku: "名障" },
    { code: 47, jrdb: "47", naiyou: "京都障害", tanshuku: "京障" },
    { code: 48, jrdb: "48", naiyou: "阪神障害", tanshuku: "阪障" },
    { code: 49, jrdb: "49", naiyou: "小倉障害", tanshuku: "小障" },
    { code: 50, jrdb: "50", naiyou: "地方競馬", tanshuku: "地方" },
    { code: 61, jrdb: "61", naiyou: "障害試験", tanshuku: "障試" },
    { code: 62, jrdb: "62", naiyou: "北障害", tanshuku: "北障" },
    { code: 68, jrdb: "68", naiyou: "美障害ダ", tanshuku: "美障" },
    { code: 70, jrdb: "70", naiyou: "北A", tanshuku: "北A" },
    { code: 81, jrdb: "81", naiyou: "美ゲート", tanshuku: "美ゲ" },
    { code: 82, jrdb: "82", naiyou: "栗ゲート", tanshuku: "栗ゲ" },
    { code: 88, jrdb: "88", naiyou: "牧場", tanshuku: "牧場" },
    { code: 93, jrdb: "93", naiyou: "白井ダ", tanshuku: "白井" },
    { code: 101, jrdb: "A1", naiyou: "連闘", tanshuku: "連闘" },
    { code: 111, jrdb: "B1", naiyou: "その他", tanshuku: "他" }
  ]
)