import { expect, test } from "bun:test";
import * as $CD from "../src/app/converters/Chakudosuu";
import * as $K from "../src/app/converters/Kishu";
import * as $R from "../src/app/converters/Race";
import * as $S from "../src/app/converters/Shussouba";
import * as $SJ from "../src/app/converters/ShussoubaJoutai";

test("追加したコード表", () => {
  expect($SJ.tokki.toCodeFromJrdb("945")).toBe(945);
  expect($SJ.tokki.toCodeFromJrdb("998")).toBe(998);
  expect($SJ.bagu.toCodeFromJrdb("000")).toBe(0);
  expect($SJ.bagu.toCodeFromJrdb("099")).toBe(99);
  expect($SJ.baguShubetsu.toCodeFromJrdb("031")).toBe(2);
  expect($K.minaraiKubun.toCodeFromJrdb("4")).toBe(4);
  expect($K.minaraiKubun.toCodeFromJrdb("9")).toBe(9);
  expect($R.joukenNenreiSeigen.toCodeFromJrdb("20")).toBe(9);
  expect($S.kehaiCode.toCodeFromJrdb("8")).toBe(8);
  expect($S.bataiCode.toCodeFromJrdb("7")).toBe(7);
});

test("ブリンカー", () => {
  expect($S.blinker.toCodeFromJrdb("1")).toBe(1);
  expect($S.blinker.toCodeFromJrdb("3")).toBe(3);
  expect($S.blinker.toCodeFromJrdb(" ")).toBeNull();
});

test("着度数の分類は、番号が重ならず、どれも内容がある", () => {
  const codes = [
    ...Object.values($CD.ChakudosuuBunrui).filter((v) => typeof v === "number"),
    ...[0, 1, 2].flatMap((t) => [0, 1, 2, 3].map((b) => $CD.babaBunrui(t, b))),
    ...[0, 1].flatMap((t) => $CD.chakudosuuKyori.map((_, i) => $CD.kyoriBunrui(t, i))),
    ...[0, 1, 2].flatMap((t) => Array.from({ length: 10 }, (_, b) => $CD.keibajouBunrui(t, b))),
  ];
  // ShibaRyou は馬場状態別の先頭と同じ番号
  expect(new Set(codes).size).toBe(codes.length - 1);
  for (const code of codes) {
    expect($CD.chakudosuuBunrui.toNaiyou(code)).toBeTruthy();
  }
  expect($CD.chakudosuuBunrui.toNaiyou($CD.keibajouBunrui(0, 4))).toBe("東京・芝");
  expect($CD.chakudosuuBunrui.toNaiyou($CD.kyoriBunrui(1, 8))).toBe("ダート・2801m 以上");
});
