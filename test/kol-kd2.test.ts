import "reflect-metadata";
import { afterAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import * as fs from "node:fs";
import { dataSource } from "../src/app/DataSource";
import { kd2Den1Layout, kd2Den2Layout, kd2Sei1Layout } from "../src/app/reader/KOL/KD2/Kd2Layout";
import { KolCom1Kd2 } from "../src/app/reader/KOL/KD2/KolCom1Kd2";
import { KolDen1Kd2 } from "../src/app/reader/KOL/KD2/KolDen1Kd2";
import { KolDen2Kd2 } from "../src/app/reader/KOL/KD2/KolDen2Kd2";
import { KolSei1Kd2 } from "../src/app/reader/KOL/KD2/KolSei1Kd2";
import { KolSei2Kd2 } from "../src/app/reader/KOL/KD2/KolSei2Kd2";
import { KolKet } from "../src/app/reader/KOL/KolKet";
import { KolKis } from "../src/app/reader/KOL/KolKis";
import { KolKod } from "../src/app/reader/KOL/KolKod";
import { KolKyu } from "../src/app/reader/KOL/KolKyu";
import { KolOds } from "../src/app/reader/KOL/KolOds";
import { KolShu } from "../src/app/reader/KOL/KolShu";
import { KolUma } from "../src/app/reader/KOL/KolUma";
import { Container } from "./container";
import {
  closeKolDb,
  importKolKind,
  isInsideSpec,
  type KolImportResult,
  kd2Kinds,
  kd2Layouts,
  kolSamples,
  parseKolSpec,
  toKd2Record,
} from "./spec/kol";

afterAll(closeKolDb);

setDefaultTimeout(120_000);

/** KD2 の種別ごとの取り込み処理 (KD2 と KD3 でレコードの並びが同じものは KD3 と共通) */
const readers = {
  kyu: KolKyu,
  kis: KolKis,
  syu: KolShu,
  uma: KolUma,
  ket: KolKet,
  den1: KolDen1Kd2,
  den2: KolDen2Kd2,
  ods: KolOds,
  sei1: KolSei1Kd2,
  sei2: KolSei2Kd2,
  com1: KolCom1Kd2,
  kod: KolKod,
};

describe("KD2 の仕様書", () => {
  for (const kind of kd2Kinds) {
    describe(kind, () => {
      const spec = parseKolSpec(kind, "KD2");

      test("項目表のレコード長が、取り込み処理のレコード長と一致する", () => {
        const reader = Container.get(readers[kind as keyof typeof readers]) as unknown as {
          getBufferLength(): number;
        };
        expect(reader.getBufferLength()).toBe(spec.tableLength);
      });
    });
  }

  test("KD3 と並びが同じ種別は、項目のアドレスと桁数がすべて同じ", () => {
    for (const kind of kd2Kinds.filter((k) => !kd2Layouts[k])) {
      // ODS, KOD は、先頭のレース情報に KD3 の Ｊｐｎフラグ の分だけずれがあるが、オッズの並び(161 以降)は同じ
      const from = kind === "ods" || kind === "kod" ? 161 : 0;
      const keys = (gen: "KD2" | "KD3") =>
        parseKolSpec(kind, gen)
          .fields.filter((f) => from <= f.address)
          .map((f) => `${f.address}+${f.bytes}`);
      expect(keys("KD2")).toEqual(keys("KD3"));
    }
  });

  // KD3 のアドレスを KD2 のアドレスに読み替える表が、KD2 の仕様書と合っているか
  for (const kind of Object.keys(kd2Layouts)) {
    describe(`${kind} の読み替え表`, () => {
      const layout = kd2Layouts[kind];
      const kd2 = parseKolSpec(kind, "KD2").fields;
      const kd3 = parseKolSpec(kind, "KD3").fields;

      test("KD3 の項目は、読み替えた位置に同じ桁数の KD2 の項目がある", () => {
        const wrong = kd3
          .filter((f) => layout.has(f.address))
          .filter((f) => f.name !== "予備フィールド" && f.name !== "予備フィールド２")
          .filter(
            (f) => !kd2.some((g) => g.address === layout.at(f.address) && g.bytes === f.bytes),
          )
          .map((f) => `${f.name}(${f.address}+${f.bytes})`);
        expect(wrong).toEqual([]);
      });

      test("KD2 の項目はすべて、KD3 の項目を読み替えた位置にあるか、予備フィールドである", () => {
        const mapped = new Set(
          kd3.filter((f) => layout.has(f.address)).map((f) => `${layout.at(f.address)}+${f.bytes}`),
        );
        const missing = kd2
          .filter((g) => !g.name.startsWith("予備フィールド"))
          .filter((g) => !mapped.has(`${g.address}+${g.bytes}`))
          .map((g) => `${g.name}(${g.address}+${g.bytes})`);
        expect(missing).toEqual([]);
      });

      test("読み替えの対象外の KD3 の項目は、KD2 にもない", () => {
        const kd2Names = new Set(kd2.map((g) => g.name));
        const stale = kd3
          .filter((f) => !layout.has(f.address))
          .filter((f) => !f.name.startsWith("予備フィールド") && f.name !== "データ区切り")
          // 項目名の最初の項目だけで見る (ラップタイムなどの繰り返しは項番が飛ぶので、名前が同じものがあれば重複)
          .filter((f) => kd2Names.has(f.name))
          .map((f) => `${f.name}(${f.address}+${f.bytes})`);
        expect(stale).toEqual([]);
      });
    });
  }
});

describe("KD2 のレコードの組み替え", () => {
  test("KD3 の見本から作ったレコードは、KD2 のレコード長で CR LF で終わる", () => {
    for (const kind of Object.keys(kd2Layouts)) {
      const length = parseKolSpec(kind, "KD2").tableLength;
      for (const file of kolSamples(kind, "KD2")) {
        const data = fs.readFileSync(file);
        expect(data.length).toBeGreaterThan(0);
        expect(data.length % length).toBe(0);
        for (let i = 0; i < data.length; i += length) {
          expect(data[i + length - 2]).toBe(0x0d);
          expect(data[i + length - 1]).toBe(0x0a);
        }
      }
    }
  });

  test("組み替えても、KD3 にある項目の値は変わらない", () => {
    const kd3 = parseKolSpec("sei1", "KD3");
    const record = Buffer.alloc(kd3.tableLength, 0x20);
    for (const f of kd3.fields) {
      record.write(String(f.address % 10).repeat(f.bytes), f.address, "latin1");
    }
    const out = toKd2Record("sei1", record);
    for (const f of kd3.fields) {
      if (kd2Sei1Layout.has(f.address) && !f.name.startsWith("予備フィールド")) {
        const address = kd2Sei1Layout.at(f.address);
        expect(out.subarray(address, address + f.bytes).toString("latin1")).toBe(
          String(f.address % 10).repeat(f.bytes),
        );
      }
    }
  });
});

/** 取り込み対象の KD2 のファイルで、読んだ範囲が仕様書に収まるか調べる種別 */
const importKinds = kd2Kinds.filter((k) => k !== "ket"); // 3代血統図の見本ファイルがない

const layoutOf = (kind: string) =>
  ({ den1: kd2Den1Layout, den2: kd2Den2Layout, sei1: kd2Sei1Layout })[
    kind as "den1" | "den2" | "sei1"
  ];

describe("KD2 形式のファイルの取り込み", () => {
  for (const kind of importKinds) {
    describe(kind, () => {
      const spec = parseKolSpec(kind, "KD2");
      let result: KolImportResult;

      test("エラーなく取り込める", async () => {
        result = await importKolKind(kind, "KD2");
        expect(result.errors).toEqual([]);
        expect(result.reads.length).toBeGreaterThan(0);
      });

      test("読んだ範囲が、KD2 の仕様書の項目の中に収まる", () => {
        // 生年(4) + 月日(4) = 生年月日 のように、1 つの値を複数の項目から組み立てるもの
        const spanning: string[] = [];
        if (kind === "uma") {
          spanning.push("77+8", "1480+8");
        } else if (kind === "den2") {
          spanning.push(...[273, 390, 507].map((o) => `${kd2Den2Layout.at(o)}+8`));
        } else if (kind === "sei2") {
          spanning.push("324+8");
        }
        const outside = result.reads
          .filter((r) => !isInsideSpec(spec, r.offset, r.length, true))
          .filter((r) => !spanning.includes(`${r.offset}+${r.length}`));
        expect(outside).toEqual([]);
      });

      test("KD3 の見本と同じ内容が取り込まれる", async () => {
        if (!layoutOf(kind) && !["sei2", "com1"].includes(kind)) {
          return;
        }
        const kd2 = await dump();
        await importKolKind(kind, "KD3");
        const kd3 = await dump();
        expect(differences(kd2, kd3)).toEqual(kd3OnlyColumns[kind] || []);
      });
    });
  }
});

type Dump = { [entity: string]: { [column: string]: unknown }[] };

/** 全テーブルの内容 */
async function dump(): Promise<Dump> {
  const out: Dump = {};
  for (const meta of dataSource.entityMetadatas) {
    out[meta.name] = (await dataSource.getRepository(meta.target).find()) as never;
  }
  return out;
}

/** a と b で内容が違う "テーブル.列" の一覧 (件数が違うテーブルは "テーブル(件数)") */
function differences(a: Dump, b: Dump) {
  const diffs = new Set<string>();
  for (const entity of Object.keys(a)) {
    if (a[entity].length !== b[entity].length) {
      diffs.add(`${entity}(${a[entity].length}/${b[entity].length})`);
      continue;
    }
    a[entity].forEach((row, i) => {
      for (const column of Object.keys({ ...row, ...b[entity][i] })) {
        if (JSON.stringify(row[column]) !== JSON.stringify(b[entity][i][column])) {
          diffs.add(`${entity}.${column}`);
        }
      }
    });
  }
  return [...diffs].sort();
}

/** KD3 にだけある項目 (KD2 では取り込まれない) の列 */
const kd3OnlyColumns: { [kind: string]: string[] } = {
  den2: [
    "Shussouba.KyuuyouRiyuu", // 休養理由
    "Shussouba.KyuuyouRiyuuCode",
    "Shussouba.TorikeshiShubetsu", // 予想２
    "ShussoubaHyouka(0/329)", // 調教短評・調教本数(KD2 にはないので行ができない)
    "ShussoubaYosou.KolYosou2", // 予想２
    "ShussoubaYosou.Kyakushitsu", // 出馬表レースデータの予想展開
  ],
};
