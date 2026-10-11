import Encoding from "encoding-japanese";

/** Shift_JIS (Windows-31J) のバイト列を文字列に変換する */
export function decodeSjis(bytes: Uint8Array): string {
  return Encoding.convert(bytes, { to: "UNICODE", from: "SJIS", type: "string" });
}

/** 文字列を Shift_JIS (Windows-31J) のバイト列に変換する */
export function encodeSjis(text: string): Buffer {
  return Buffer.from(Encoding.convert(text, { to: "SJIS", from: "UNICODE", type: "arraybuffer" }));
}
