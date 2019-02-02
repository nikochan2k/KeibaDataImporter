import { Codes } from "./Codes";

export const blinker = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "初装着" },
    { code: 2, jrdb: "2", naiyou: "再装着" },
    { code: 3, kol: "1", jrdb: "3", naiyou: "ブリンカー" }
  ]
);

export const norikawari = new Codes(
  [
    { code: 1, kol: "1", naiyou: "乗り替り", tanshuku: "乗Ï替" }
  ]
);

export const chakujunFuka = new Codes(
  [
    { code: 1, kol: "31", naiyou: "落馬" },
    { code: 2, kol: "32", jrdb: "4", jvdata:"5", naiyou: "失格" },
    { code: 3, kol: "33", jrdb: "3", jvdata:"4", naiyou: "競走中止", tanshuku: "中止" },
    { code: 4, kol: "34", jrdb: "1", jvdata:"1", naiyou: "出走取消", tanshuku: "取消" },
    { code: 5, kol: "35", jrdb: "2", jvdata:/2|3/, naiyou: "除外" },
    { code: 6, kol: "36", jrdb: "5", jvdata:"7", naiyou: "降着" },
    { code: 7, kol: "37", naiyou: "繰上" },
    { code: 10, kol: "40", naiyou: "不利" },
    { code: 11, jrdb: "6", jvdata:"6", naiyou: "落馬再騎乗", tanshuku: "再騎乗" }
  ]
);

export const torikeshiShubetsu = new Codes(
  [
    { code: 1, kol: /1|9/, jrdb: "1", naiyou: "出走取消" },
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
    { code: 0, kol: "0", jvdata:/H../, naiyou: "ハナ" },
    { code: 1, kol: "1", jvdata:/A../, naiyou: "アタマ" },
    { code: 2, kol: "2", jvdata:/K../, naiyou: "クビ" },
    { code: 3, kol: "3", jvdata:/.12/, naiyou: "1/2" },
    { code: 4, kol: "4", jvdata:/.14/, naiyou: "1/4" },
    { code: 5, kol: "5", jvdata:/.34/, naiyou: "3/4" },
    { code: 7, kol: "7", jvdata:/T../, naiyou: "大差" },
    { code: 8, kol: "8", jvdata:/D../, naiyou: "同着" }
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
        if (!str) {
          return null;
        } else if (/放牧/.test(str)) {
          if (/故障|骨折|屈腱炎/.test(str)) return 2;
          if (/手術|去勢/.test(str)) return 7;
          if (/出走停止/.test(str)) return 6;
          if (/再審査/.test(str)) return 5;
          if (/病|血|熱|蕁麻疹|鼻|肺|胃|腸|フレグモーネ/.test(str)) return 4;
          if (/不安|骨|節|股|蹄|肩|爪|トモ|ソエ|捻挫|傷|蟻洞|跛行/.test(str)) return 3;
          return 1;
        } else {
          if (/故障|骨折|屈腱炎/.test(str)) return 12;
          if (/病|血|熱|蕁麻疹|鼻|肺|胃|腸|フレグモーネ/.test(str)) return 14;
          if (/不安|骨|節|股|蹄|肩|爪|トモ|ソエ|捻挫|傷|蟻洞|跛行/.test(str)) return 13;
          return 11;
        }
      }
    }
  ]
);
export enum Ichi {
  Saiuchi = 0,
  Uchi,
  Naka,
  Soto,
  Ohsoto
}

export const ichi = new Codes(
  [
    { code: Ichi.Saiuchi, kol: "0", jrdb: "1", naiyou: "最内" },
    { code: Ichi.Uchi, kol: "1", jrdb: "2", naiyou: "内" },
    { code: Ichi.Naka, kol: "2", jrdb: "3", naiyou: "中" },
    { code: Ichi.Soto, kol: "3", jrdb: "4", naiyou: "外" },
    { code: Ichi.Ohsoto, kol: "4", jrdb: "5", naiyou: "大外" }
  ]
);

export const joushoudo = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "AA" },
    { code: 2, jrdb: "2", naiyou: "A" },
    { code: 3, jrdb: "3", naiyou: "B" },
    { code: 4, jrdb: "4", naiyou: "C" },
    { code: 5, jrdb: "5", naiyou: "D" }
  ]
);

export const classCode = new Codes(
  [
    { code: 1, jrdb: "01", naiyou: "芝G1" },
    { code: 2, jrdb: "02", naiyou: "芝G2" },
    { code: 3, jrdb: "03", naiyou: "芝G3" },
    { code: 4, jrdb: "04", naiyou: "芝OP A" },
    { code: 5, jrdb: "05", naiyou: "芝OP B" },
    { code: 6, jrdb: "06", naiyou: "芝OP C" },
    { code: 7, jrdb: "07", naiyou: "芝1600万A" },
    { code: 8, jrdb: "08", naiyou: "芝1600万B" },
    { code: 9, jrdb: "09", naiyou: "芝1600万C" },
    { code: 10, jrdb: "10", naiyou: "芝1000万A" },
    { code: 11, jrdb: "11", naiyou: "芝1000万B" },
    { code: 12, jrdb: "12", naiyou: "芝1000万C" },
    { code: 13, jrdb: "13", naiyou: "芝500万A" },
    { code: 14, jrdb: "14", naiyou: "芝500万B" },
    { code: 15, jrdb: "15", naiyou: "芝500万C" },
    { code: 16, jrdb: "16", naiyou: "芝未A" },
    { code: 17, jrdb: "17", naiyou: "芝未B" },
    { code: 18, jrdb: "18", naiyou: "芝未C" },
    { code: 21, jrdb: "21", naiyou: "ダG1" },
    { code: 22, jrdb: "22", naiyou: "ダG2" },
    { code: 23, jrdb: "23", naiyou: "ダG3" },
    { code: 24, jrdb: "24", naiyou: "ダOP A" },
    { code: 25, jrdb: "25", naiyou: "ダOP B" },
    { code: 26, jrdb: "26", naiyou: "ダOP C" },
    { code: 27, jrdb: "27", naiyou: "ダ1600万A" },
    { code: 28, jrdb: "28", naiyou: "ダ1600万B" },
    { code: 29, jrdb: "29", naiyou: "ダ1600万C" },
    { code: 30, jrdb: "30", naiyou: "ダ1000万A" },
    { code: 31, jrdb: "31", naiyou: "ダ1000万B" },
    { code: 32, jrdb: "32", naiyou: "ダ1000万C" },
    { code: 33, jrdb: "33", naiyou: "ダ500万A" },
    { code: 34, jrdb: "34", naiyou: "ダ500万B" },
    { code: 35, jrdb: "35", naiyou: "ダ500万C" },
    { code: 36, jrdb: "36", naiyou: "ダ未A" },
    { code: 37, jrdb: "37", naiyou: "ダ未B" },
    { code: 38, jrdb: "38", naiyou: "ダ未C" },
    { code: 51, jrdb: "51", naiyou: "障G1" },
    { code: 52, jrdb: "52", naiyou: "障G2" },
    { code: 53, jrdb: "53", naiyou: "障G3" },
    { code: 54, jrdb: "54", naiyou: "障OP A" },
    { code: 55, jrdb: "55", naiyou: "障OP B" },
    { code: 56, jrdb: "56", naiyou: "障OP C" },
    { code: 57, jrdb: "57", naiyou: "障500万A" },
    { code: 58, jrdb: "58", naiyou: "障500万B" },
    { code: 59, jrdb: "59", naiyou: "障500万C" },
    { code: 60, jrdb: "60", naiyou: "障未A" },
    { code: 61, jrdb: "61", naiyou: "障未B" },
    { code: 62, jrdb: "62", naiyou: "障未C" },
  ]
);

export const bataiCode = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "太い" },
    { code: 2, jrdb: "2", naiyou: "余裕" },
    { code: 3, jrdb: "3", naiyou: "良い" },
    { code: 4, jrdb: "4", naiyou: "普通" },
    { code: 5, jrdb: "5", naiyou: "細い" },
    { code: 6, jrdb: "6", naiyou: "張り" },
  ]
);

export const kehaiCode = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "状態良" },
    { code: 2, jrdb: "2", naiyou: "平凡" },
    { code: 3, jrdb: "3", naiyou: "不安定" },
    { code: 4, jrdb: "4", naiyou: "イレ込" },
    { code: 5, jrdb: "5", naiyou: "気合良" },
    { code: 6, jrdb: "6", naiyou: "気不足" },
  ]
);

export const kyakushitsu = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "逃げ" },
    { code: 2, jrdb: "2", naiyou: "先行" },
    { code: 3, jrdb: "3", naiyou: "差し" },
    { code: 4, jrdb: "4", naiyou: "追込" },
    { code: 5, jrdb: "5", naiyou: "好位差し" },
    { code: 6, jrdb: "6", naiyou: "自在" },
  ]
);
