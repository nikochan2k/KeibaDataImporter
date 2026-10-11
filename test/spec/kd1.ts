import * as fs from "node:fs";
import * as path from "node:path";
import * as iconv from "iconv-lite";
import type { KolField, KolSpec } from "./kol";

export const kd1SpecFile = path.resolve(__dirname, "../../docs/kol-spec/KD1/spec/k-siyou3.txt");

/** 仕様書の見出しの名前 → 種別 */
export const kd1Sections = {
  sei: "競走成績",
  sei2: "競走成績２",
  den: "出馬表",
  uma: "競走馬",
  kis: "騎手",
  kyu: "厩舎",
  syu: "種牡馬",
  ket: "３代血統図",
};

export type Kd1Kind = keyof typeof kd1Sections;

export interface Kd1Spec extends KolSpec {
  /** 見出しに書かれたレコード長 */
  headerLength: number;
}

const half = (s: string) =>
  s
    .replace(/　/g, "")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .trim();

/**
 * KD1 のデータ仕様書(テキスト, Windows-932)から項目表を読み取ります。
 * 表は「|項番|項目名|桁数|ADDR|規|備考|」の行で、グループの見出し(項番が空の行)や、備考の続きの行は読み飛ばします。
 */
export function parseKd1Spec(kind: Kd1Kind): Kd1Spec {
  const text = iconv.decode(fs.readFileSync(kd1SpecFile), "Windows932").replace(/\r/g, "");
  const fields: KolField[] = [];
  let headerLength = 0;
  let inSection = false;
  for (const line of text.split("\n")) {
    const header = line.match(/^(.+)\(([\d,]+)byte\)$/);
    if (header) {
      inSection = header[1] === kd1Sections[kind];
      if (inSection) {
        headerLength = +header[2].replace(/,/g, "");
      }
      continue;
    }
    if (!inSection || !line.startsWith("|")) {
      continue;
    }
    const cells = line.slice(1, -1).split("|").map(half);
    if (cells.length < 5 || !/^\d+$/.test(cells[0]) || !/^\d+$/.test(cells[2])) {
      continue;
    }
    if (!/^\d+$/.test(cells[3])) {
      continue;
    }
    fields.push({
      no: +cells[0],
      name: cells[1],
      bytes: +cells[2],
      address: +cells[3],
      note: cells[cells.length - 1],
    });
  }
  const last = fields[fields.length - 1];
  return { fields, tableLength: last ? last.address + last.bytes : 0, headerLength };
}
