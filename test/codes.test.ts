import { expect, test } from "bun:test";
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
