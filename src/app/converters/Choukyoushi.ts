import { Codes } from "./Codes";

export const touzaiBetsu = new Codes(
  [
    { code: 1, kol: "1", jrdb: "栗東", naiyou: "西" },
    { code: 2, kol: /2|3/, jrdb: "美浦", naiyou: "東" }
  ]
);

export const ritsuHokuNanBetsu = new Codes(
  [
    { code: 1, kol: "1", naiyou: "栗東", tanshuku: "栗" },
    { code: 2, kol: "2", naiyou: "美浦南", tanshuku: "南" },
    { code: 3, kol: "3", naiyou: "美浦北", tanshuku: "北" }
  ]
);
