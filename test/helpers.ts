import "reflect-metadata";
import { bridge } from "../src/app/reader/Bridge";
import { JrdbBridge } from "../src/app/reader/JRDB/JrdbBridge";
import { encodeSjis } from "../src/app/util/Sjis";

export type Field = [number, string];

/** 仕様書(1始まり)の位置に値を置いて固定長の 1 レコードを作る */
export function record(fields: Field[], length: number) {
  const buf = Buffer.alloc(length, 0x20);
  for (const [pos, value] of fields) {
    encodeSjis(value).copy(buf, pos - 1);
  }
  buf.write("\r\n", length - 2);
  return buf;
}

export const base: Field[] = [
  [1, "06"],
  [3, "24"],
  [5, "3"],
  [6, "4"],
  [7, "11"],
  [9, "05"],
  [11, "12345678"],
  [19, "20240407"],
  [27, "テストホース"],
  [63, "1600"],
  [67, "1"],
  [68, "1"],
  [69, "1"],
  [70, "10"],
  [72, "13"],
  [74, "16"],
  [131, "16"],
  [141, "01"],
  [143, "0"],
  [144, "1334"],
  [148, "560"],
  [175, "   2.3"],
  [181, " 1"],
  [256, " 12"],
  [265, "ダイオウ"],
  [317, "  5"],
  [320, " 10"],
  [333, "480"],
  [336, "+ 2"],
  [339, "1"],
  [340, "1"],
  [371, "1535"],
];

/** 取り込み対象ファイルの日付(ファイル名の日付)を設定する。KYI や TYB のようにレコードに年月日がないデータで使う。 */
export function setFileDate(nen: number, gatsu: number, nichi: number) {
  const jrdbBridge = bridge as JrdbBridge;
  jrdbBridge.nen = nen;
  jrdbBridge.gatsu = gatsu;
  jrdbBridge.nichi = nichi;
}
