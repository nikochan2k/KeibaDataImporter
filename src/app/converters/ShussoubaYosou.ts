import { Codes } from "./Codes";

export const yosou = new Codes(
  [
    { code: 1, kol: "0", jrdb: "1", naiyou: "◎" },
    { code: 2, kol: "1", jrdb: "2", naiyou: "○" },
    { code: 3, kol: "2", jrdb: "3", naiyou: "▲" },
    { code: 4, jrdb: "4", naiyou: "注" },
    { code: 5, kol: "3", jrdb: /5|6/, naiyou: "△" },
    { code: 6, kol: "4", naiyou: "×" }
  ]
);