const decoder = new TextDecoder("shift_jis");

// TextDecoder が不正なバイトに充てる U+FFFD、未定義の 0x80、外字領域 (0xF040-0xF9FC → 私用領域) は、
// 従来 (encoding-japanese) と同じ "?" にそろえる
const UNMAPPED = /[\x80�-]/g;

/** Shift_JIS (Windows-31J) のバイト列を文字列に変換する。変換できないバイトは "?" になる */
export function decodeSjis(bytes: Uint8Array): string {
  return decoder.decode(bytes).replace(UNMAPPED, "?");
}
