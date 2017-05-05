import { Codes } from "./Codes";

export const blinker = new Codes(
  [
    { code: 1, kol: "1", naiyou: "ブリンカー" }
  ]
);

export const norikawari = new Codes(
  [
    { code: 1, kol: "1", naiyou: "乗り替り", tanshuku: "乗Ï替" }
  ]
);

export const yosou = new Codes(
  [
    { code: 0, kol: "0", naiyou: "◎" },
    { code: 1, kol: "1", naiyou: "○" },
    { code: 2, kol: "2", naiyou: "▲" },
    { code: 3, kol: "3", naiyou: "△" },
    { code: 4, kol: "4", naiyou: "×" }
  ]
);

export const chakujunFuka = new Codes(
  [
    { code: 1, kol: "31", naiyou: "落馬" },
    { code: 2, kol: "32", jrdb: "4", naiyou: "失格" },
    { code: 3, kol: "33", jrdb: "3", naiyou: "中止" },
    { code: 4, kol: "34", jrdb: "1", naiyou: "取消" },
    { code: 5, kol: "35", jrdb: "2", naiyou: "除外" },
    { code: 6, kol: "36", jrdb: "5", naiyou: "降着" },
    { code: 7, kol: "37", naiyou: "繰上" },
    { code: 10, kol: "40", naiyou: "不利" },
    { code: 11, jrdb: "6", naiyou: "再騎乗" }
  ]
);

export const torikeshiShubetsu = new Codes(
  [
    { code: 1, kol: "1", naiyou: "出走取消" },
    { code: 2, kol: "2", naiyou: "出走除外" },
    { code: 3, kol: "3", naiyou: "競走除外" },
    { code: 4, kol: "4", naiyou: "競走中止" },
    { code: 5, kol: "5", naiyou: "放馬" },
    { code: 6, kol: "6", naiyou: "発走除外" }
  ]
);

export const chakura2 = new Codes(
  [
    { code: 0, kol: "0", naiyou: "ハナ" },
    { code: 1, kol: "1", naiyou: "アタマ" },
    { code: 2, kol: "2", naiyou: "クビ" },
    { code: 3, kol: "3", naiyou: "1/2" },
    { code: 4, kol: "4", naiyou: "1/4" },
    { code: 5, kol: "5", naiyou: "3/4" },
    { code: 7, kol: "7", naiyou: "大差" },
    { code: 8, kol: "8", naiyou: "同着" }
  ]
);

export const yonCornerIchiDori = new Codes(
  [
    { code: 0, kol: "0", jrdb: "1", naiyou: "最内" },
    { code: 1, kol: "1", jrdb: "2", naiyou: "内" },
    { code: 2, kol: "2", jrdb: "3", naiyou: "中" },
    { code: 3, kol: "3", jrdb: "4", naiyou: "外" },
    { code: 4, kol: "4", jrdb: "5", naiyou: "大外" }
  ]
);