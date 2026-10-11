import { describe, expect, test } from "bun:test";
import {
  readDouble,
  readInt,
  readJikan,
  readSignedInt,
  readStr,
  readTime,
} from "../src/app/reader/Reader";
import { encodeSjis } from "../src/app/util/Sjis";

const buf = (s: string) => encodeSjis(s);

describe("Reader", () => {
  test("readStr は全角を半角にし、空白だけなら null", () => {
    expect(readStr(buf("ＡＢＣ１２"), 0, 10)).toBe("ABC12");
    expect(readStr(buf("      "), 0, 6)).toBeNull();
  });

  test("readTime は MSSf を秒に変換する", () => {
    expect(readTime(buf("1234"), 0, 4)).toBeCloseTo(83.4);
    expect(readTime(buf("0583"), 0, 4)).toBeCloseTo(58.3);
    expect(readTime(buf("2000"), 0, 4)).toBeCloseTo(120);
    expect(readTime(buf("    "), 0, 4)).toBeNull();
  });

  test("readSignedInt は符号と数字の間の空白を許す", () => {
    expect(readSignedInt(buf("+ 2"), 0, 3)).toBe(2);
    expect(readSignedInt(buf("- 2"), 0, 3)).toBe(-2);
    expect(readSignedInt(buf("-12"), 0, 3)).toBe(-12);
    expect(readSignedInt(buf("   "), 0, 3)).toBeNull();
  });

  test("readDouble は 0 を残す", () => {
    expect(readDouble(buf("  0.0"), 0, 5)).toBe(0);
    expect(readInt(buf("   "), 0, 3)).toBeNull();
  });
});

describe("readJikan", () => {
  test("HHMM を HH:MM にする", () => {
    expect(readJikan(buf("1535"), 0)).toBe("15:35");
    expect(readJikan(buf("    "), 0)).toBeNull();
    expect(readJikan(buf("0000"), 0)).toBeNull();
    expect(readJikan(buf("15  "), 0)).toBeNull();
  });
});
