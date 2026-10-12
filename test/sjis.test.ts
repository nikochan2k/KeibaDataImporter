import { describe, expect, test } from "bun:test";
import Encoding from "encoding-japanese";
import { decodeSjis } from "../src/app/util/Sjis";
import { encodeSjis } from "./encode-sjis";

const bytes = (...b: number[]) => Uint8Array.from(b);

describe("decodeSjis", () => {
  test("ASCII・半角カナ・全角", () => {
    expect(decodeSjis(bytes(0x41, 0x5c, 0x7e))).toBe("A\\~");
    expect(decodeSjis(bytes(0xb1, 0xb2, 0xdf))).toBe("ｱｲﾟ");
    expect(decodeSjis(bytes(0x82, 0xa0, 0x83, 0x41, 0x88, 0x9f))).toBe("あア亜");
  });

  test("Windows-31J の拡張文字 (NEC特殊文字・NEC選定IBM拡張・IBM拡張)", () => {
    expect(decodeSjis(bytes(0x87, 0x40, 0x87, 0x54, 0x87, 0x8a))).toBe("①Ⅰ㈱"); // NEC特殊文字
    expect(decodeSjis(bytes(0xed, 0x40, 0xee, 0xec))).toBe("纊黑"); // NEC選定IBM拡張
    expect(decodeSjis(bytes(0xfa, 0x40, 0xfa, 0x58, 0xfa, 0x59, 0xfc, 0x4b))).toBe("ⅰ㈱№黑"); // IBM拡張
    expect(decodeSjis(bytes(0x81, 0x60, 0x81, 0x7c, 0x81, 0x91))).toBe("\uff5e\uff0d\uffe0"); // ～－￠ (全角形)
  });

  test("変換できないバイトは ?", () => {
    expect(decodeSjis(bytes(0x80))).toBe("?");
    expect(decodeSjis(bytes(0xa0))).toBe("?");
    expect(decodeSjis(bytes(0xfd))).toBe("?");
    expect(decodeSjis(bytes(0x82))).toBe("?"); // 先頭バイトだけ
    expect(decodeSjis(bytes(0x81, 0xad))).toBe("?"); // 未定義
    expect(decodeSjis(bytes(0xf0, 0x40))).toBe("?"); // 外字
  });

  test("有効な2バイト文字はすべて従来の変換 (encoding-japanese) と一致する", () => {
    const mismatches: string[] = [];
    for (let a = 0x81; a <= 0xfc; a++) {
      for (let b = 0x40; b <= 0xfc; b++) {
        const input = bytes(a, b);
        const actual = decodeSjis(input);
        if (actual.includes("?") || actual.includes("\x7f")) {
          continue;
        }
        const expected = Encoding.convert(input, { to: "UNICODE", from: "SJIS", type: "string" });
        if (actual !== expected) {
          mismatches.push(`${a.toString(16)}${b.toString(16)}`);
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  test("encodeSjis と往復できる", () => {
    const text = "ＡＢＣ①㈱～纊ｱ亜";
    expect(decodeSjis(encodeSjis(text))).toBe(text);
  });
});
