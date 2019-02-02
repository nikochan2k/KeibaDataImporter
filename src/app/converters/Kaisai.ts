import { Codes } from "./Codes";

// kol > jvdata
export const kyuujitsu = new Codes(
  [
    { code: 1, kol: "1", jvdata:"2", naiyou: "祝日" },
    { code: 2, kol: "2", naiyou: "振替休日" },
    { code: 3, kol: "3", naiyou: "国民の休日" }
  ]
);

// kol = jrdb > jvdata
export const youbi = new Codes(
  [
    { code: 1, kol: "1", jrdb: "土", jvdata:"1", naiyou: "土" },
    { code: 2, kol: "2", jrdb: "日", jvdata:"2", naiyou: "日" },
    { code: 3, kol: "3", jrdb: "月", jvdata:"4", naiyou: "月" },
    { code: 4, kol: "4", jrdb: "火", jvdata:"5", naiyou: "火" },
    { code: 5, kol: "5", jrdb: "水", jvdata:"6", naiyou: "水" },
    { code: 6, kol: "6", jrdb: "木", jvdata:"7", naiyou: "木" },
    { code: 7, kol: "7", jrdb: "金", jvdata:"8", naiyou: "金" }
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

export enum KaisaiKubun {
  Kantou = 1,
  Kansai,
  Local
}

export const kaisaiKubun = new Codes(
  [
    { code: KaisaiKubun.Kantou, jrdb: "1", naiyou: "関東" },
    { code: KaisaiKubun.Kansai, jrdb: "2", naiyou: "関西" },
    { code: KaisaiKubun.Local, jrdb: "3", naiyou: "ローカル" }
  ]
);

export const babaJoutai = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "絶好" },
    { code: 2, jrdb: "2", naiyou: "良" },
    { code: 3, jrdb: "3", naiyou: "稍荒" },
    { code: 4, jrdb: "4", naiyou: "荒" },
  ]
);

export const shibaShurui = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "野芝" },
    { code: 2, jrdb: "2", naiyou: "洋芝" },
    { code: 3, jrdb: "3", naiyou: "混生" },
  ]
);

export const tenatsu = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "転圧" },
  ]
);

export const touketsuBoushizai = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "凍結防止剤散布" },
  ]
);
