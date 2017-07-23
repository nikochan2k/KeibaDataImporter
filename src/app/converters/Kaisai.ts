import { Codes } from "./Codes";

export const kyuujitsu = new Codes(
  [
    { code: 1, kol: "1", naiyou: "祝日" },
    { code: 2, kol: "2", naiyou: "振替休日" },
    { code: 3, kol: "3", naiyou: "国民の休日" }
  ]
);

export const youbi = new Codes(
  [
    { code: 1, kol: "1", jrdb: "土", naiyou: "土" },
    { code: 2, kol: "2", jrdb: "日", naiyou: "日" },
    { code: 3, kol: "3", jrdb: "月", naiyou: "月" },
    { code: 4, kol: "4", jrdb: "火", naiyou: "火" },
    { code: 5, kol: "5", jrdb: "水", naiyou: "水" },
    { code: 6, kol: "6", jrdb: "木", naiyou: "木" },
    { code: 7, kol: "7", jrdb: "金", naiyou: "金" }
  ]
);

export const chuuouChihouGaikoku = new Codes(
  [
    { code: 0, kol: "0", naiyou: "中央" },
    { code: 1, kol: "1", naiyou: "南関東" },
    { code: 2, kol: "2", naiyou: "公営" },
    { code: 3, kol: "3", naiyou: "道営" },
    { code: 4, kol: "4", naiyou: "外国" }
  ]
);

export const kaisaiKubun = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "関東" },
    { code: 2, jrdb: "2", naiyou: "関西" },
    { code: 3, jrdb: "3", naiyou: "ローカル" }
  ]
);
