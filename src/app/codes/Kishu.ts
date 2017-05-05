import { Codes } from "./Codes";

export const touzaiBetsu = new Codes(
  [
    { code: 0, kol: "0", naiyou: "西" },
    { code: 1, kol: "1", naiyou: "東" },
    { code: 2, kol: "2", naiyou: "招待" }
  ]
);

export const minaraiKubun = new Codes(
  [
    { code: 1, kol: "1", jrdb: "1", naiyou: "1kg減", tanshuku:"☆" },
    { code: 2, kol: "2", jrdb: "2", naiyou: "2kg減", tanshuku:"△" },
    { code: 3, kol: "3", jrdb: "3", naiyou: "3kg減", tanshuku:"▲" }
  ]
);

export const kishuShikakuKubun = new Codes(
  [
    { code: 0, kol: "0", naiyou: "資格なし" },
    { code: 1, kol: "1", naiyou: "平地・障害" },
    { code: 2, kol: "2", naiyou: "平地" },
    { code: 3, kol: "3", naiyou: "障害" }
  ]
);

export const masshouFlag = new Codes(
  [
    { code: 0, kol: "0", naiyou: "現役" },
    { code: 1, kol: "1", naiyou: "抹消" },
    { code: 2, kol: "2", naiyou: "引退" }
  ]
);