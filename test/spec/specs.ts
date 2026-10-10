import * as fs from "fs";
import * as path from "path";
import * as iconv from "iconv-lite";

/** 仕様書の 1 項目。繰り返し(OCC)は 1 要素の長さ bytes と個数 occ で表す */
export interface Slot {
  name: string;
  /** 1 始まりの相対位置 */
  start: number;
  bytes: number;
  occ: number;
  /** 仕様書の相対位置が直前の項目の続きになっていない項目 */
  irregular?: boolean;
}

export interface Spec {
  slots: Slot[];
  /** 仕様書に書かれたレコード長 */
  recordLength: number | null;
  /** 項目表から計算したレコード長 */
  tableLength: number;
}

export const specDir = path.resolve(__dirname, "../../docs/jrdb-spec");

const isInt = (s: string | undefined) => s !== undefined && /^\d+$/.test(s);

/**
 * JRDB のデータ仕様書(Windows-932)から項目表を読み取ります。
 * 行は「項目名 [OCC] BYTE TYPE 相対」の並びで、OCC は省略されることがあります。
 * 相対位置が直前の項目の続きになる解釈を選ぶことで OCC の有無を判別します。
 * 払戻のように「項目名 OCC 相対 (1 件の長さ)*OCC=合計」と書かれ、
 * 次の行以降に相対位置のない子項目が続く繰り返しグループは、要素ごとに展開します。
 */
export function parseSpec(file: string): Spec {
  const text = iconv.decode(fs.readFileSync(path.join(specDir, file)), "Windows932");
  const slots: Slot[] = [];
  let next = 1;
  let recordLength: number | null = null;
  let group: { name: string; occ: number; rel: number; size: number; children: { name: string; bytes: number }[] } | null = null;

  const flushGroup = () => {
    if (!group) {
      return;
    }
    let pos = group.rel;
    for (let i = 0; i < group.occ; i++) {
      for (const c of group.children) {
        slots.push({ name: `${group.name}[${i + 1}].${c.name}`, start: pos, bytes: c.bytes, occ: 1 });
        pos += c.bytes;
      }
    }
    next = group.rel + group.size * group.occ;
    group = null;
  };

  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/レコード長[：:]\s*(\d+)/);
    if (m) {
      recordLength = parseInt(m[1]);
    }
    const t = line.trim().split(/[ \t]+/);
    if (t.length < 3 || /^[\*=\-]/.test(t[0])) {
      continue;
    }
    const g = line.match(/^(\S+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\*\s*(\d+)\s*=\s*(\d+)/);
    if (g && +g[3] === (group ? group.rel + group.size * group.occ : next) && +g[4] * +g[2] === +g[6]) {
      flushGroup();
      group = { name: g[1], occ: +g[2], rel: +g[3], size: +g[4], children: [] };
      continue;
    }
    if (group && t.length === 3 && isInt(t[1]) && /^\s/.test(line)) {
      group.children.push({ name: t[0], bytes: +t[1] });
      continue;
    }
    if (t.length < 4) {
      continue;
    }
    const cands: Slot[] = [];
    if (isInt(t[1]) && isInt(t[3])) {
      cands.push({ name: t[0], bytes: +t[1], occ: 1, start: +t[3] });
    }
    if (isInt(t[1]) && isInt(t[2]) && isInt(t[4])) {
      cands.push({ name: t[0], bytes: +t[2], occ: +t[1], start: +t[4] });
    }
    if (cands.length === 0) {
      continue;
    }
    flushGroup();
    const f = cands.find(c => c.start === next);
    if (f) {
      slots.push(f);
      next = f.start + f.bytes * f.occ;
    } else if (slots.length > 0 && cands[0].start > next - 1) {
      // 相対位置が連続しない項目(仕様書の誤記か予備の抜け)は、記載どおりの位置で採用して印を付ける
      const c = cands[cands.length - 1];
      slots.push({ ...c, irregular: true });
      next = c.start + c.bytes * c.occ;
    }
  }
  flushGroup();
  return { slots, recordLength, tableLength: next - 1 };
}

export type Place =
  | { kind: "exact"; slot: Slot }
  | { kind: "part"; slot: Slot }
  | { kind: "span"; slots: Slot[] }
  | { kind: "none" };

/** コードが読んだ範囲(0 始まりの offset と length)が、仕様書のどの項目にあたるかを返す */
export function locate(spec: Spec, offset: number, length: number): Place {
  const s = offset + 1;
  const e = s + length;
  const hit = spec.slots.filter(f => s < f.start + f.bytes * f.occ && f.start < e);
  if (hit.length === 0) {
    return { kind: "none" };
  }
  if (hit.length > 1) {
    return { kind: "span", slots: hit };
  }
  const f = hit[0];
  if (s < f.start || f.start + f.bytes * f.occ < e) {
    return { kind: "span", slots: hit };
  }
  const aligned = (s - f.start) % f.bytes === 0 && length === f.bytes;
  return aligned ? { kind: "exact", slot: f } : { kind: "part", slot: f };
}
