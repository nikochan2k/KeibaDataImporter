import { expect, test } from "bun:test";
import { RaceTool } from "../src/app/reader/RaceTool";

test("1区間目の長さ", () => {
  expect(RaceTool.firstLapDistance(1600, 12.3)).toBe(200);
  expect(RaceTool.firstLapDistance(1700, 6.5)).toBe(100);
  expect(RaceTool.firstLapDistance(1150, 9.0)).toBe(150);
  expect(RaceTool.firstLapDistance(null, 6.5)).toBe(100);
  expect(RaceTool.firstLapDistance(null, 12.0)).toBe(200);
});
