import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { Baken, Kakutei } from "../src/app/converters/Common";
import { closeDb } from "../src/app/db/db";
import { countBy, findBy, findOneBy, IS_NULL } from "../src/app/db/helpers";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { Race } from "../src/app/entities/Race";
import { Shussouba } from "../src/app/entities/Shussouba";
import { ShussoubaHyouka } from "../src/app/entities/ShussoubaHyouka";
import { ShussoubaSeiseki } from "../src/app/entities/ShussoubaSeiseki";
import { ShussoubaYosou } from "../src/app/entities/ShussoubaYosou";
import { Bab } from "../src/app/reader/JRDB/Bab";
import { Bac } from "../src/app/reader/JRDB/Bac";
import { C$a } from "../src/app/reader/JRDB/C$a";
import { Cha } from "../src/app/reader/JRDB/Cha";
import { Cya } from "../src/app/reader/JRDB/Cya";
import { Cyb } from "../src/app/reader/JRDB/Cyb";
import { Hja } from "../src/app/reader/JRDB/Hja";
import { Hjc } from "../src/app/reader/JRDB/Hjc";
import { Joa } from "../src/app/reader/JRDB/Joa";
import { jrdbKaisaiShussoubaTool } from "../src/app/reader/JRDB/JrdbKaisaiShussoubaTool";
import { jrdbRaceTool } from "../src/app/reader/JRDB/JrdbRaceTool";
import { jrdbShussoubaTool } from "../src/app/reader/JRDB/JrdbShussoubaTool";
import { K$a } from "../src/app/reader/JRDB/K$a";
import { Kaa } from "../src/app/reader/JRDB/Kaa";
import { Kab } from "../src/app/reader/JRDB/Kab";
import { Kka } from "../src/app/reader/JRDB/Kka";
import { Kyg } from "../src/app/reader/JRDB/Kyg";
import { Kyh } from "../src/app/reader/JRDB/Kyh";
import { Kyi } from "../src/app/reader/JRDB/Kyi";
import { Ot } from "../src/app/reader/JRDB/Ot";
import { Ou } from "../src/app/reader/JRDB/Ou";
import { Ov } from "../src/app/reader/JRDB/Ov";
import { Ow } from "../src/app/reader/JRDB/Ow";
import { Oz } from "../src/app/reader/JRDB/Oz";
import { Sec } from "../src/app/reader/JRDB/Sec";
import { Sed } from "../src/app/reader/JRDB/Sed";
import { Skb } from "../src/app/reader/JRDB/Skb";
import { Sra } from "../src/app/reader/JRDB/Sra";
import { Srb } from "../src/app/reader/JRDB/Srb";
import { Tyb } from "../src/app/reader/JRDB/Tyb";
import { Ukc } from "../src/app/reader/JRDB/Ukc";
import { Zec } from "../src/app/reader/JRDB/Zec";
import { Zed } from "../src/app/reader/JRDB/Zed";
import { Zkb } from "../src/app/reader/JRDB/Zkb";
import { decodeSjis } from "../src/app/util/Sjis";
import { setFileDate } from "./helpers";
import { codeTables } from "./spec/code-tables";
import { specOf } from "./spec/docs";
import { locate, parseSpec, Spec, specDir } from "./spec/specs";
import { importSamples, Reads, sampleFiles } from "./spec/trace";

/**
 * JRDB の公式サイト(http://home.jrdb.com/program/data.html)にある仕様書と見本データ(docs/jrdb-spec)を使い、
 * 取り込み処理が仕様書どおりになっているかを確かめる。
 */

const readers: { [prefix: string]: new () => object } = {
  bab: Bab,
  bac: Bac,
  cha: Cha,
  csa: C$a,
  cya: Cya,
  cyb: Cyb,
  hja: Hja,
  hjc: Hjc,
  joa: Joa,
  kaa: Kaa,
  kab: Kab,
  kka: Kka,
  kyg: Kyg,
  kyh: Kyh,
  kyi: Kyi,
  ksa: K$a,
  ot: Ot,
  ou: Ou,
  ov: Ov,
  ow: Ow,
  oz: Oz,
  sec: Sec,
  sed: Sed,
  skb: Skb,
  sra: Sra,
  srb: Srb,
  tyb: Tyb,
  ukc: Ukc,
  zec: Zec,
  zed: Zed,
  zkb: Zkb,
};

/** 仕様書のレコード長の記載が、項目表と合っていないもの(仕様書側の誤り) */
const specErrata: { [doc: string]: number } = {
  "Bac/bac_doc.txt": 184, // 見出しは 176 だが、項目表も見本データも 184
};

const specs = new Map<string, Spec>();
const specFor = (prefix: string) => {
  const doc = specOf[prefix];
  if (!specs.has(doc)) {
    specs.set(doc, parseSpec(doc));
  }
  return specs.get(doc);
};

let reads: Reads;
let logs: { level: string; category: string; message: string }[];
let unmapped: { prefix: string; caller: string; value: string }[];

beforeAll(async () => {
  // 3連単(OV)と前走データ(ZEC・ZKB)は件数が多く時間がかかる。形式は OT・SEC・SKB と同じなので、
  // 普段は省き、JRDB_SPEC_FULL=1 のときだけ取り込む
  const heavy = process.env.JRDB_SPEC_FULL ? [] : ["ov", "zec", "zkb"];
  ({ reads, logs, unmapped } = await importSamples(undefined, heavy));
}, 300000);

afterAll(async () => {
  closeDb();
});

describe("仕様書の項目表", () => {
  for (const doc of new Set(Object.values(specOf))) {
    test(`${doc}: 項目表の長さがレコード長と一致する`, () => {
      const spec = parseSpec(doc);
      expect(spec.slots.length).toBeGreaterThan(5);
      expect(spec.tableLength).toBe(specErrata[doc] ?? spec.recordLength);
    });
  }
});

describe("レコード長", () => {
  for (const [prefix, cls] of Object.entries(readers)) {
    test(`${prefix}: リーダーのレコード長が仕様書と一致する`, () => {
      const reader = new cls() as unknown as { getBufferLength(): number };
      expect(reader.getBufferLength()).toBe(specFor(prefix).tableLength);
    });
  }
});

describe("見本データの取り込み", () => {
  test("エラーが出ない", () => {
    expect(logs.filter((l) => l.level === "ERROR")).toEqual([]);
  });

  test("警告は、見本データ自体の不整合による 1 件だけ", () => {
    // KYG040627 の 1 件だけ、体型総合２が "2  " と左詰めで入っていて特記コードにならない
    const warns = logs.filter((l) => l.level === "WARN");
    expect(warns.map((w) => w.message)).toEqual(["未定義の状態コード: kubun=0, code=2"]);
  });

  test("読んだ範囲が、すべて仕様書の項目の中に収まる", () => {
    const problems: string[] = [];
    for (const [prefix, list] of reads) {
      const spec = specFor(prefix);
      const seen = new Set<string>();
      for (const r of list) {
        const key = `${r.offset}:${r.length}:${r.caller}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        const place = locate(spec, r.offset, r.length);
        if (place.kind === "none" || place.kind === "span") {
          problems.push(`${prefix} ${r.caller} 位置${r.offset + 1} 長さ${r.length}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  test("仕様書にないコードは、既知のもの以外に現れない", () => {
    // 値 0 は「なし」を表すので変換しない。そのほかの未対応の値を集計する
    const counts = new Map<string, number>();
    for (const u of unmapped) {
      // 競走記号は、全部の変換器を順に試して合致しないものが null になる(正常)
      if (
        u.caller.startsWith("JrdbRaceTool.ts") &&
        u.caller !== "JrdbRaceTool.ts:50" &&
        u.caller !== "JrdbRaceTool.ts:76"
      ) {
        continue;
      }
      if (/^0+$/.test(u.value)) {
        continue;
      }
      const key = `${u.prefix} ${u.caller} ${JSON.stringify(u.value)}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const unexpected = [...counts.keys()].filter(
      (k) =>
        // 障害(3)の芝ダ区分、重賞(4)・特別(5)のグレードは、別の項目で持つので null で正しい
        !/JrdbRaceTool\.ts:(50|76)/.test(k) &&
        // 調教コース A1(連闘) は調教場所を持たない(種類で持つ)
        !/cha Cha\.ts:17 "A1"/.test(k) &&
        // 地方の調教師の所属(東西の区分がない)
        !/Ky\$\.ts:69 /.test(k) &&
        // 産地名の「追分」(コード表にない地名)
        !/ukc Ukc\.ts:35 /.test(k) &&
        // 見本データに現れる、コード表にない印(7, 8)や距離適性(4, 7)
        !/ky[ghi] Ky\$\.ts:(123|146|209) /.test(k) &&
        // 見本データ自体の不整合
        !/kyg JrdbShussoubaTool\.ts:22 "2 {2}"/.test(k),
    );
    expect(unexpected).toEqual([]);
  });
});

describe("コード表", () => {
  for (const table of codeTables()) {
    test(`${table.name}(${table.file}) の全コードを変換できる`, () => {
      const missing: string[] = [];
      for (const c of table.codes) {
        if (table.noCode?.includes(c.code)) {
          continue;
        }
        for (const input of table.convert ? table.convert(c.code) : [c.code]) {
          if (!table.converters.some((conv) => conv.toCodeFromJrdb(input) != null)) {
            missing.push(c.code);
          }
        }
      }
      expect(missing).toEqual([]);
    });
  }
});

/** 見本データの 1 レコードから、仕様書の項目名で値を取り出す */
function fieldReader(prefix: string) {
  const spec = specFor(prefix);
  return (rec: Buffer, name: string, index = 0) => {
    const slots = spec.slots.filter((s) => s.name === name);
    const slot = slots[0];
    if (!slot) {
      throw new Error(`仕様書に項目がありません: ${name}`);
    }
    const start = slot.start - 1 + index * slot.bytes;
    return decodeSjis(rec.subarray(start, start + slot.bytes)).trim();
  };
}

function records(prefix: string, dir: string) {
  const spec = specFor(prefix);
  const file = Object.entries(sampleFiles()).find(([name]) =>
    name.toLowerCase().startsWith(prefix),
  )[1];
  let data = fs.readFileSync(path.join(specDir, dir, path.basename(file)));
  if (data.length % spec.tableLength !== 0) {
    // TYB・HJC の見本は改行が LF だけなので、仕様書どおりの CR LF にそろえる
    const lines = data
      .toString("latin1")
      .split(/\r?\n/)
      .filter((l) => l.length > 0);
    data = Buffer.from(lines.map((l) => `${l}\r\n`).join(""), "latin1");
  }
  const list: Buffer[] = [];
  for (let i = 0; i * spec.tableLength < data.length; i++) {
    list.push(data.subarray(i * spec.tableLength, (i + 1) * spec.tableLength));
  }
  return list;
}

const time = (v: string) => {
  const i = parseInt(v, 10);
  return i > 0 ? ((i / 1000) | 0) * 60 + (i % 1000) / 10 : null;
};

const findShussouba = async (rec: Buffer) => {
  const raceId = jrdbRaceTool.getRaceIdBy(rec, jrdbKaisaiShussoubaTool);
  const info = await jrdbShussoubaTool.getShussoubaInfo(rec, 8, raceId);
  return { raceId, shussouba: info.shussouba };
};

describe("仕様書の値と取り込み結果の突き合わせ", () => {
  test("SED: 全レコードの着順・タイム・馬体重・ＩＤＭ・距離・頭数が仕様書の項目どおり", async () => {
    const f = fieldReader("sed");
    let checked = 0;
    for (const rec of records("sed", "Sed")) {
      const { raceId, shussouba } = await findShussouba(rec);
      expect(shussouba).toBeTruthy();
      const seiseki = await findOneBy(ShussoubaSeiseki, { Id: shussouba.Id });
      const chaku = parseInt(f(rec, "着順"), 10);
      expect(seiseki.KakuteiChakujun).toBe(1 <= chaku && chaku <= 28 ? chaku : null);
      expect(seiseki.Time).toBe(time(f(rec, "タイム")));
      const bataijuu = parseInt(f(rec, "馬体重"), 10);
      expect(seiseki.Bataijuu).toBe(0 < bataijuu ? bataijuu : null);
      const hyouka = await findOneBy(ShussoubaHyouka, { Id: shussouba.Id });
      expect(hyouka.Idm).toBe(f(rec, "ＩＤＭ") === "" ? null : parseInt(f(rec, "ＩＤＭ"), 10));
      const race = await findOneBy(Race, { Id: raceId });
      expect(race.Kyori).toBe(parseInt(f(rec, "距離"), 10));
      expect(race.Tousuu).toBe(parseInt(f(rec, "頭数"), 10));
      checked++;
    }
    expect(checked).toBe(324);
  });

  test("KYI: 全レコードの枠番・負担重量・ＩＤＭが仕様書の項目どおり", async () => {
    const f = fieldReader("kyi");
    // KYI の見本は 2015-07-12 のファイル。レコードに年月日がないので、取り込み時と同じ日付にする
    setFileDate(2015, 7, 12);
    let checked = 0;
    for (const rec of records("kyi", "Kyi")) {
      const raceId = jrdbRaceTool.getRaceId(rec);
      const info = await jrdbShussoubaTool.getShussoubaInfo(rec, 8, raceId);
      expect(info.shussouba).toBeTruthy();
      const shussouba = await findOneBy(Shussouba, { Id: info.shussouba.Id });
      expect(shussouba.Wakuban).toBe(parseInt(f(rec, "枠番"), 10));
      expect(shussouba.Kinryou).toBe(parseInt(f(rec, "負担重量"), 10) / 10);
      const yosou = await findOneBy(ShussoubaYosou, { Id: shussouba.Id });
      expect(yosou.Idm).toBe(parseFloat(f(rec, "ＩＤＭ")));
      checked++;
    }
    expect(checked).toBe(498);
  });

  test("HJC: 全馬券種の払戻が仕様書の項目どおり", async () => {
    const f = fieldReader("hjc");
    setFileDate(2024, 9, 29);
    const groups: [string, number, Baken][] = [
      ["単勝払戻", 3, Baken.Tanshou],
      ["複勝払戻", 5, Baken.Fukushou],
      ["枠連払戻", 3, Baken.Wakuren],
      ["馬連払戻", 3, Baken.Umaren],
      ["ワイド払戻", 7, Baken.Wide],
      ["馬単払戻", 6, Baken.Umatan],
      ["３連複払戻", 3, Baken.Sanrenpuku],
      ["３連単払戻", 6, Baken.Sanrentan],
    ];
    const spec = specFor("hjc");
    let checked = 0;
    const mismatches: string[] = [];
    for (const rec of records("hjc", "Hjc")) {
      const raceId = jrdbRaceTool.getRaceId(rec);
      for (const [group, occ, baken] of groups) {
        for (let i = 1; i <= occ; i++) {
          const combo = spec.slots.find(
            (s) => s.name.startsWith(`${group}[${i}].`) && !s.name.endsWith("払戻金"),
          );
          const kin = spec.slots.find((s) => s.name === `${group}[${i}].払戻金`);
          const comboRaw = decodeSjis(rec.subarray(combo.start - 1, combo.start - 1 + combo.bytes));
          const comboText = comboRaw.trim();
          const kinText = decodeSjis(rec.subarray(kin.start - 1, kin.start - 1 + kin.bytes)).trim();
          if (comboText === "" || !(0 < parseInt(kinText, 10))) {
            continue;
          }
          // 枠連は枠番 1 桁を 2 つ並べる。それ以外は馬番 2 桁ずつ
          const n = baken === Baken.Wakuren ? 2 : combo.bytes / 2;
          const w = combo.bytes / n;
          const nums = Array.from({ length: n }, (_, k) => parseInt(comboRaw.substr(k * w, w), 10));
          if (nums.some(Number.isNaN)) {
            mismatches.push(`${group}[${i}] 組合せが読めません: "${comboRaw}"`);
            continue;
          }
          const rows = findBy(OddsHaitou, {
            RaceId: raceId,
            Baken: baken,
            Kakutei: Kakutei.Kakutei,
            Bangou1: nums[0],
            Bangou2: nums[1] ?? IS_NULL,
            Bangou3: nums[2] ?? IS_NULL,
          });
          if (rows.length !== 1 || rows[0].Haitoukin !== parseInt(kinText, 10)) {
            mismatches.push(
              `${group}[${i}] 組合せ=${comboText} 払戻金=${kinText} 取り込み=${rows.map((r) => r.Haitoukin).join(",")}`,
            );
          }
          checked++;
        }
      }
    }
    expect(mismatches).toEqual([]);
    expect(checked).toBe(288);
    void f;
  });

  test("OZ: 連勝オッズは、8頭立以下で枠連、9頭立以上で馬連になる", async () => {
    setFileDate(2002, 9, 8);
    const f = fieldReader("oz");
    let wakuren = 0;
    let umaren = 0;
    for (const rec of records("oz", "Oz")) {
      const raceId = jrdbRaceTool.getRaceId(rec);
      const tousuu = parseInt(f(rec, "登録頭数"), 10);
      const expected = (tousuu * (tousuu - 1)) / 2;
      const count = (baken: Baken) =>
        countBy(OddsHaitou, {
          RaceId: raceId,
          Kakutei: Kakutei.Yosou,
          Baken: baken,
        });
      if (tousuu <= 8) {
        expect(await count(Baken.Wakuren)).toBe(expected);
        expect(await count(Baken.Umaren)).toBe(0);
        wakuren++;
      } else {
        expect(await count(Baken.Umaren)).toBe(expected);
        expect(await count(Baken.Wakuren)).toBe(0);
        umaren++;
      }
    }
    expect(wakuren).toBeGreaterThan(0);
    expect(umaren).toBeGreaterThan(0);
  });
});
