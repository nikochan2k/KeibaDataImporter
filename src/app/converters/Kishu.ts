import { Codes } from "./Codes";

export const minaraiKubun = new Codes(
  [
    { code: 1, kol: "1", jrdb: "1", jvdata: "1", naiyou: "1kg減", tanshuku: "☆" },
    { code: 2, kol: "2", jrdb: "2", jvdata: "2", naiyou: "2kg減", tanshuku: "△" },
    { code: 3, kol: "3", jrdb: "3", jvdata: "3", naiyou: "3kg減", tanshuku: "▲" },
    { code: 0, kol: /.*/, jrdb: /.*/, naiyou: "" },
  ]
);

export const kijouShikakuKubun = new Codes(
  [
    { code: 0, kol: "0", naiyou: "資格なし" },
    { code: 1, kol: "2", jrdb: "2", jvdata: "2", naiyou: "平地", tanshuku: "平" },
    { code: 2, kol: "3", jrdb: "3", jvdata: "3", naiyou: "障害", tanshuku: "障" },
    { code: 4, kol: "1", jrdb: "1", jvdata: "1", naiyou: "平地・障害", tanshuku: "平・障" },
  ]
);

export const seibetsu = new Codes(
  [
    { code: 1, jvdata: "1", naiyou: "男性" },
    { code: 2, jvdata: "2", naiyou: "女性" },
  ]
);
