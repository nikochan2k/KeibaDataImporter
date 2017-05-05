import { Codes } from "./Codes";

export const yosou = new Codes(
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
      code: null,
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
      },
      naiyou: null
    }
  ]
);