import { describe, expect, test } from "bun:test";
import { LhaReader } from "../src/app/util/LHA";

// JRA-VAN の MASSYOKI/M2981109.LZH と同じバイト列 (-lh0-: 無圧縮、JracDelk.dat 15 バイト)
const STORED_LZH = Buffer.from(
  "25c02d6c68302d0f0000000f000000f1535b2720010c4a72616344656c6b2e64617487164d0000303036383731393938313033310d0a00",
  "hex",
);

describe("LhaReader", () => {
  test("-lh0- (無圧縮) のエントリをそのまま取り出す", () => {
    const reader = new LhaReader(new Uint8Array(STORED_LZH));
    expect(Object.keys(reader.entries)).toEqual(["jracdelk.dat"]);
    const bytes = reader.extractSync("jracdelk.dat");
    expect(Buffer.from(bytes ?? []).toString("latin1")).toBe("0068719981031\r\n");
  });

  test("未対応の圧縮方式は例外にする", () => {
    const broken = new Uint8Array(STORED_LZH);
    broken.set(Buffer.from("-lh1-"), 2);
    const reader = new LhaReader(broken);
    expect(() => reader.extractSync("jracdelk.dat")).toThrow("未対応の圧縮方式");
  });
});
