import type { Kd1Map } from "./Kd1Layout";

/** 空白で埋めて、末尾を CR LF にしたレコード */
export function newRecord(length: number) {
  const record = Buffer.alloc(length, 0x20);
  record[length - 2] = 0x0d;
  record[length - 1] = 0x0a;
  return record;
}

/** 表のとおりに、src の項目を dst に写す。src, dst の base は、レコードの中の先頭の位置 */
export function copyFields(
  src: Buffer,
  srcBase: number,
  dst: Buffer,
  dstBase: number,
  map: Kd1Map,
) {
  for (const [from, length, to] of map) {
    src.copy(dst, dstBase + to, srcBase + from, srcBase + from + length);
  }
  return dst;
}

/** 項目がすべて空白 (または 0) か */
export function isBlank(buffer: Buffer, offset: number, length: number) {
  return buffer.subarray(offset, offset + length).every((b) => b === 0x20 || b === 0x00);
}

/**
 * KD1 の出馬表・競走成績には曜日がない。KD2 の曜日コード(2 バイト, 01=土 02=日 03=月 ... 07=金)を年月日から作る。
 * 祝日などの区別(1 バイト目)は分からないので 0 にする。
 */
export function setYoubi(record: Buffer, dateAt = 12, youbiAt = 20) {
  const date = record.toString("latin1", dateAt, dateAt + 8);
  if (!/^\d{8}$/.test(date)) {
    return;
  }
  const day = new Date(+date.slice(0, 4), +date.slice(4, 6) - 1, +date.slice(6, 8)).getDay();
  record.write(`0${((day + 1) % 7) + 1}`, youbiAt, "latin1");
}

/** 出馬表の平・障。KD1 の出馬表にはないので、条件カットの 0 (サラ障害) から作る */
export function setHeichiShougai(record: Buffer, joukenCutAt = 97, heichiShougaiAt = 24) {
  const cut = record.toString("latin1", joukenCutAt, joukenCutAt + 1);
  if (/\d/.test(cut)) {
    record.write(cut === "0" ? "1" : "0", heichiShougaiAt, "latin1");
  }
}
