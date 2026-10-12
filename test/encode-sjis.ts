import Encoding from "encoding-japanese";

/** 文字列を Shift_JIS (Windows-31J) のバイト列に変換する。テストデータの組み立て用 */
export function encodeSjis(text: string): Buffer {
  return Buffer.from(Encoding.convert(text, { to: "SJIS", from: "UNICODE", type: "arraybuffer" }));
}
