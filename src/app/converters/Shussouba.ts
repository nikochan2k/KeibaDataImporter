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

export const recordNinshiki = new Codes(
  [
    { code: 1, kol: "1", naiyou: "レコードÏ" }
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

export const kyuuyouRiyuuCode = new Codes(
  [
    { code: 1, jrdb: "01", naiyou: "放牧" },
    { code: 2, jrdb: "02", naiyou: "放牧(故障、骨折等)" },
    { code: 3, jrdb: "03", naiyou: "放牧(不安、ソエ等)" },
    { code: 4, jrdb: "04", naiyou: "放牧(病気)" },
    { code: 5, jrdb: "05", naiyou: "放牧(再審査)" },
    { code: 6, jrdb: "06", naiyou: "放牧(出走停止)" },
    { code: 7, jrdb: "07", naiyou: "放牧(手術)" },
    { code: 11, jrdb: "11", naiyou: "調整" },
    { code: 12, jrdb: "12", naiyou: "調整(故障、骨折等)" },
    { code: 13, jrdb: "13", naiyou: "調整(不安、ソエ等)" },
    { code: 14, jrdb: "14", naiyou: "調整(病気)" },
    {
      kol: (str) => {
        if (/放牧/.test(str)) {
          if (/故障|骨折/.test(str)) return 2;
          if (/不安|ソエ/.test(str)) return 3;
          if (/病気/.test(str)) return 4;
          if (/再審査/.test(str)) return 5;
          if (/出走停止/.test(str)) return 6;
          if (/手術/.test(str)) return 7;
          return 1;
        } else {
          if (/故障|骨折/.test(str)) return 12;
          if (/不安|ソエ/.test(str)) return 13;
          if (/病気/.test(str)) return 14;
          return 11;
        }
      }
    }
  ]
);