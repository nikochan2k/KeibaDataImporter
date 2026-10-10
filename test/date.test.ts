import "reflect-metadata";
import { expect, test } from "bun:test";
import { Tool } from "../src/app/reader/Tool";

test("開催ID用の日数は整数でタイムゾーンに依存しない", () => {
  const tool = new Tool();
  expect(tool.getDaysFrom1970With(1970, 1, 2)).toBe(1);
  expect(tool.getDaysFrom1970With(2024, 3, 31)).toBe(19813);
  expect(Number.isInteger(tool.getDaysFrom1970With(2024, 10, 27))).toBe(true);
});
