import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import * as fs from "node:fs";
import { Container } from "typedi";
import { In } from "typeorm";
import { Baken, Kakutei } from "../src/app/converters/Common";
import * as $U from "../src/app/converters/Uma";
import { dataSource } from "../src/app/DataSource";
import { Choukyou } from "../src/app/entities/Choukyou";
import { ChoukyouTime } from "../src/app/entities/ChoukyouTime";
import { Kaisai } from "../src/app/entities/Kaisai";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { RaceHassouJoukyou } from "../src/app/entities/RaceHassouJoukyou";
import { RaceLapTime } from "../src/app/entities/RaceLapTime";
import { RaceSeiseki } from "../src/app/entities/RaceSeiseki";
import { Shussouba } from "../src/app/entities/Shussouba";
import { ShussoubaChoukyou } from "../src/app/entities/ShussoubaChoukyou";
import { ShussoubaHassouJoukyou } from "../src/app/entities/ShussoubaHassouJoukyou";
import { ShussoubaHyouka } from "../src/app/entities/ShussoubaHyouka";
import { ShussoubaSeiseki } from "../src/app/entities/ShussoubaSeiseki";
import { Uma } from "../src/app/entities/Uma";
import { KolKet5Kd3 } from "../src/app/reader/KOL/KD3/KolKet5Kd3";
import { KolKod2Kd3 } from "../src/app/reader/KOL/KD3/KolKod2Kd3";
import { KolKod3Kd3 } from "../src/app/reader/KOL/KD3/KolKod3Kd3";
import { KolOds2Kd3 } from "../src/app/reader/KOL/KD3/KolOds2Kd3";
import { KolSei3Kd3 } from "../src/app/reader/KOL/KD3/KolSei3Kd3";
import { KolChoukyouTool } from "../src/app/reader/KOL/KolChoukyouTool";
import { KolCom1 } from "../src/app/reader/KOL/KolCom1";
import { KolDen1 } from "../src/app/reader/KOL/KolDen1";
import { KolDen2 } from "../src/app/reader/KOL/KolDen2";
import { KolKet } from "../src/app/reader/KOL/KolKet";
import { KolKis } from "../src/app/reader/KOL/KolKis";
import { KolKod } from "../src/app/reader/KOL/KolKod";
import { KolKyu } from "../src/app/reader/KOL/KolKyu";
import { KolOds } from "../src/app/reader/KOL/KolOds";
import { KolRaceTool } from "../src/app/reader/KOL/KolRaceTool";
import { KolSei1 } from "../src/app/reader/KOL/KolSei1";
import { KolSei2 } from "../src/app/reader/KOL/KolSei2";
import { KolShu } from "../src/app/reader/KOL/KolShu";
import { KolUma } from "../src/app/reader/KOL/KolUma";
import {
  closeKolDb,
  field,
  importKolKind,
  isInsideSpec,
  type KolImportResult,
  kolKinds,
  kolRecords,
  kolSamples,
  parseKolSpec,
  put,
  resetKolDb,
} from "./spec/kol";

afterAll(closeKolDb);

// 見本ファイルの取り込みには時間がかかる (UMA, KOD3 など)
setDefaultTimeout(120_000);

/** 種別ごとの取り込み処理 */
const readers = {
  kyu: KolKyu,
  kis: KolKis,
  syu: KolShu,
  uma: KolUma,
  ket: KolKet,
  ket5: KolKet5Kd3,
  den1: KolDen1,
  den2: KolDen2,
  ods: KolOds,
  ods2: KolOds2Kd3,
  sei1: KolSei1,
  sei2: KolSei2,
  sei3: KolSei3Kd3,
  com1: KolCom1,
  kod: KolKod,
  kod2: KolKod2Kd3,
  kod3: KolKod3Kd3,
};

type Kind = keyof typeof readers;

interface Saver {
  save(buffer: Buffer): Promise<void>;
  getBufferLength(): number;
}

const readerOf = (kind: Kind) => Container.get(readers[kind]) as unknown as Saver;

/** 1 レコードだけ取り込む。ファイル単位の準備 (setup) と後始末 (teardown) も行う */
async function saveRecord(kind: Kind, record: Buffer) {
  const reader = readerOf(kind) as unknown as {
    setup(): Promise<void>;
    save(buffer: Buffer): Promise<void>;
    teardown(): Promise<void>;
  };
  await reader.setup();
  try {
    await reader.save(record);
  } finally {
    await reader.teardown();
  }
}

/**
 * 仕様書の項目にまたがって読んでいる読み取り。いずれも 1 つの値を複数の項目から組み立てるもので、誤りではない。
 */
const spanningReads: { [kind: string]: string[] } = {
  // 生年(4) + 月日(4) = 生年月日
  uma: ["77+8", "1480+8"],
  // 場所(6) + コース(2) の調教場所
  den2: ["273+8", "390+8", "507+8"],
  sei2: ["324+8"],
};

describe("KD3 の仕様書", () => {
  for (const kind of [...kolKinds, "ket"] as Kind[]) {
    describe(kind, () => {
      const spec = parseKolSpec(kind);

      test("項目表が読み取れ、項目が重ならない", () => {
        expect(spec.fields.length).toBeGreaterThan(0);
        expect(spec.fields[0].address).toBe(0);
        let prev = 0;
        for (const f of spec.fields) {
          // ODS2 の仕様書は、末尾の 2 項目のアドレスが 5 バイト間隔になっている(7 バイトの項目なので誤記)
          const typo = kind === "ods2" && 1138 <= f.no;
          if (!typo) {
            expect(f.address).toBeGreaterThanOrEqual(prev);
          }
          prev = f.address + f.bytes;
        }
      });

      test("項目表のレコード長が、取り込み処理のレコード長と一致する", () => {
        expect(readerOf(kind).getBufferLength()).toBe(spec.tableLength);
      });

      test("見本ファイルが、レコード長の整数倍で、各レコードが CR LF で終わる", () => {
        for (const file of kolSamples(kind)) {
          const data = fs.readFileSync(file);
          expect(data.length % spec.tableLength).toBe(0);
          for (let i = 0; i < data.length; i += spec.tableLength) {
            expect(data[i + spec.tableLength - 2]).toBe(0x0d);
            expect(data[i + spec.tableLength - 1]).toBe(0x0a);
          }
        }
      });
    });
  }
});

/** 取り込みに時間がかかる種別 (確定オッズ。1 ファイルで 10 万件近い OddsHaitou を保存する)。KOL_SPEC_FULL=1 で実行する */
const full = process.env.KOL_SPEC_FULL === "1";
const heavyKinds = ["kod2", "kod3"];

describe("KD3 見本ファイルの取り込み", () => {
  for (const kind of kolKinds as Kind[]) {
    const run = heavyKinds.includes(kind) && !full ? describe.skip : describe;
    run(kind, () => {
      const spec = parseKolSpec(kind);
      let result: KolImportResult;

      beforeAll(async () => {
        result = await importKolKind(kind);
      });

      test("エラーなく取り込める", () => {
        expect(result.errors).toEqual([]);
      });

      test("読んだ範囲が、仕様書の項目の中に収まる", () => {
        expect(result.reads.length).toBeGreaterThan(0);
        const spanning = spanningReads[kind] || [];
        const outside = result.reads
          .filter((r) => !isInsideSpec(spec, r.offset, r.length, true))
          .filter((r) => !spanning.includes(`${r.offset}+${r.length}`))
          // ODS2 の仕様書の誤記 (3 連複の最後から 3 番目・2 番目は 9020, 9027 が正しい。KOD2 の仕様書はそうなっている)
          .filter((r) => !(kind === "ods2" && [9020, 9027].includes(r.offset) && r.length === 7));
        expect(outside).toEqual([]);
      });
    });
  }
});

describe("取り込み結果が見本ファイルと一致する", () => {
  const raceTool = () => Container.get(KolRaceTool);
  const repo = <T extends object>(e: new () => T) => dataSource.getRepository(e);

  describe("SEI1 (競走成績レースデータ)", () => {
    let records: Buffer[];

    beforeAll(async () => {
      await importKolKind("sei1");
      records = kolRecords("sei1", 3200);
    });

    test("払戻が券種ごとに保存される", async () => {
      // [券種, 先頭, 1 件の長さ, 件数, 最初の馬番(枠番)の長さ]
      const groups: [Baken, number, number, number, number][] = [
        [Baken.Tanshou, 2100, 8, 3, 2],
        [Baken.Fukushou, 2124, 8, 5, 2],
        [Baken.Wakuren, 2164, 10, 3, 1],
        [Baken.Umaren, 2194, 14, 3, 2],
        [Baken.Wide, 2236, 14, 7, 2],
        [Baken.Umatan, 2334, 14, 6, 2],
        [Baken.Sanrenpuku, 2418, 16, 3, 2],
        [Baken.Sanrentan, 2466, 19, 6, 2],
      ];
      for (const record of records) {
        const raceId = raceTool().getRaceId(record);
        for (const [baken, start, size, count, len] of groups) {
          let expected = 0;
          for (let i = 0; i < count; i++) {
            if (Number.parseInt(field(record, start + size * i, len), 10) > 0) {
              expected++;
            }
          }
          const actual = await repo(OddsHaitou).countBy({
            RaceId: raceId,
            Kakutei: Kakutei.Kakutei,
            Baken: baken,
          });
          expect(actual).toBe(expected);
        }
      }
    });

    test("単勝の払戻金が仕様書の項目と一致する", async () => {
      for (const record of records) {
        const raceId = raceTool().getRaceId(record);
        const row = await repo(OddsHaitou).findOneBy({
          RaceId: raceId,
          Kakutei: Kakutei.Kakutei,
          Baken: Baken.Tanshou,
          Bangou1: Number.parseInt(field(record, 2100, 2), 10),
        });
        expect(row?.Haitoukin).toBe(Number.parseInt(field(record, 2102, 6), 10));
      }
    });

    test("障害レースの上り時計 (1 哩, 半哩, 3F) が秒で保存される", async () => {
      const record = records.find((r) => field(r, 25, 1) === "1");
      expect(record).toBeDefined();
      // 例: "104.9-52.0-38.9-13.3"
      const [mile, half, three, one] = field(record as Buffer, 382, 20)
        .split("-")
        .map(Number.parseFloat);
      const raceId = raceTool().getRaceId(record as Buffer);
      const laps = await repo(RaceLapTime).findBy({ RaceId: raceId });
      expect(laps.map((l) => l.LapTime).sort((a, b) => a - b)).toEqual(
        [mile, half, three].sort((a, b) => a - b),
      );
      const seiseki = await repo(RaceSeiseki).findOneBy({ Id: raceId });
      expect(seiseki?.ShougaiHeikin1F).toBeCloseTo(one, 5);
    });

    test("馬単の 4 番目の人気は、4 番目の位置から読む", async () => {
      const record = Buffer.from(records[0]);
      // 同着で馬単の払戻が 4 通りあるレース
      put(record, 2376, 2, "01");
      put(record, 2378, 2, "02");
      put(record, 2380, 7, "0001234");
      put(record, 2387, 3, "007");
      put(record, 2910, 8, "20991231");
      await saveRecord("sei1", record);
      const row = await repo(OddsHaitou).findOneBy({
        RaceId: raceTool().getRaceId(record),
        Kakutei: Kakutei.Kakutei,
        Baken: Baken.Umatan,
        Bangou1: 1,
        Bangou2: 2,
      });
      expect(row?.Haitoukin).toBe(1234);
      expect(row?.Ninki).toBe(7);
    });

    test("発走状況の馬番は、すべての馬が保存される", async () => {
      await resetKolDb("sei1");
      const record = Buffer.from(records[0]);
      put(record, 1473, 80, "(04)(05) ダッシュ付かず ２馬身 不利");
      // 馬番のない発走状況でも取り込める
      put(record, 1553, 80, "全体に出遅れ気味");
      put(record, 2910, 8, "20991231");
      await saveRecord("sei1", record);
      const raceId = raceTool().getRaceId(record);
      const first = await repo(RaceHassouJoukyou).findOneBy({ Id: raceId * 8 + 1 });
      expect(first?.RaceId).toBe(raceId);
      const horses = await repo(ShussoubaHassouJoukyou).findBy({
        RaceHassouJoukyouId: raceId * 8 + 1,
      });
      expect(horses.map((h) => h.ShussoubaId).sort()).toEqual([raceId * 64 + 4, raceId * 64 + 5]);
      expect(await repo(RaceHassouJoukyou).findOneBy({ Id: raceId * 8 + 2 })).not.toBeNull();
    });

    test("曜日は、曜日コードの 2 桁目から読む", async () => {
      // 2007-10-09 は火曜日 (曜日コード 04)
      await resetKolDb("sei1");
      const record = Buffer.from(records[0]);
      put(record, 12, 8, "20071009");
      put(record, 20, 2, "04");
      await saveRecord("sei1", record);
      const kaisai = await repo(Kaisai).findOneBy({ Nen: 2007, Gatsu: 10, Nichi: 9 });
      expect(kaisai?.Youbi).toBe(4);
      expect(kaisai?.Kyuujitsu ?? null).toBeNull();
    });
  });

  describe("DEN1 (出馬表レースデータ)", () => {
    test("附加賞は 322 から読む", async () => {
      await resetKolDb("den1");
      const record = Buffer.from(kolRecords("den1", 848)[0]);
      put(record, 322, 9, "000378000");
      put(record, 351, 9, "999999999");
      put(record, 418, 8, "20991231");
      await saveRecord("den1", record);
      const race = await dataSource.getRepository("Race").findOneBy({
        Id: raceTool().getRaceId(record),
      });
      expect((race as { FukaShou?: number }).FukaShou).toBe(378000);
    });

    test("曜日は、曜日コードの 2 桁目から読む", async () => {
      await resetKolDb("den1");
      const record = Buffer.from(kolRecords("den1", 848)[0]);
      put(record, 12, 8, "20071009");
      put(record, 20, 2, "05");
      await saveRecord("den1", record);
      const kaisai = await repo(Kaisai).findOneBy({ Nen: 2007, Gatsu: 10, Nichi: 9 });
      expect(kaisai?.Youbi).toBe(5);
    });
  });

  describe("UMA (競走馬データ)", () => {
    test("過去走が 5 走に満たないレコードでも取り込める", async () => {
      const result = await importKolKind("uma");
      expect(result.errors).toEqual([]);
      const records = kolRecords("uma", 5166);
      const noRace = records.filter((r) => field(r, 1064 + 590 * 4 + 10, 2) === "");
      expect(noRace.length).toBeGreaterThan(0);
      const code = Number.parseInt(field(noRace[0], 0, 7), 10);
      expect(await repo(Uma).findOneBy({ KolUmaCode: code })).not.toBeNull();
    });

    test("過去走のレコード指数が保存される", async () => {
      const records = kolRecords("uma", 5166);
      const withIndex = records.find((r) => Number.parseInt(field(r, 1315, 3), 10) > 0);
      expect(withIndex).toBeDefined();
      const raceBuffer = (withIndex as Buffer).subarray(1064, 1064 + 151);
      const raceId = raceTool().getRaceId(raceBuffer);
      const umaban = Number.parseInt(field(withIndex as Buffer, 1216, 2), 10);
      const hyouka = await repo(ShussoubaHyouka).findOneBy({ Id: raceId * 64 + umaban });
      expect(hyouka?.KolRecordShisuu).toBe(
        Number.parseInt(field(withIndex as Buffer, 1315, 3), 10),
      );
    });

    test("過去走の騎手の東西別・所属が保存される", async () => {
      const records = kolRecords("uma", 5166);
      const target = records.find((r) => field(r, 1363, 1) !== "" && field(r, 1216, 2) !== "");
      expect(target).toBeDefined();
      const raceBuffer = (target as Buffer).subarray(1064, 1064 + 151);
      const raceId = raceTool().getRaceId(raceBuffer);
      const umaban = Number.parseInt(field(target as Buffer, 1216, 2), 10);
      const seiseki = await repo(ShussoubaSeiseki).findOneBy({ Id: raceId * 64 + umaban });
      expect(seiseki?.KishuTouzaiBetsu).toBe(Number.parseInt(field(target as Buffer, 1363, 1), 10));
    });
  });

  describe("SEI2 (競走成績出走馬データ)", () => {
    test("出走馬が未登録でも、出走馬と成績が登録される", async () => {
      const result = await importKolKind("sei2");
      expect(result.errors).toEqual([]);
      const records = kolRecords("sei2", 600);
      let checked = 0;
      for (const record of records) {
        const raceId = raceTool().getRaceId(record);
        const umaban = Number.parseInt(field(record, 23, 2), 10);
        const id = raceId * 64 + umaban;
        const shussouba = await repo(Shussouba).findOneBy({ Id: id });
        if (!shussouba) {
          continue;
        }
        const seiseki = await repo(ShussoubaSeiseki).findOneBy({ Id: id });
        expect(seiseki?.KakuteiChakujun ?? null).toBe(
          Number.parseInt(field(record, 274, 2), 10) || null,
        );
        checked++;
      }
      expect(checked).toBeGreaterThan(0);
    });
  });

  describe("ODS / KOD (オッズ)", () => {
    /** オッズが入っている(数値、または "*" = 上限以上)項目の数。"-" (発売なし) と空白は数えない */
    const countOdds = (record: Buffer, start: number, size: number, count: number) => {
      let n = 0;
      for (let i = 0; i < count; i++) {
        const s = field(record, start + size * i, size);
        if (s.startsWith("*") || Number(s) > 0) {
          n++;
        }
      }
      return n;
    };

    for (const [kind, kakutei] of [
      ["ods", Kakutei.Yosou],
      ["kod", Kakutei.Kakutei],
    ] as const) {
      test(`${kind}: 枠連は 36 通りを枠連として保存し、単勝と混ざらない`, async () => {
        await importKolKind(kind);
        const records = kolRecords(kind, 1504);
        for (const record of records) {
          const raceId = raceTool().getRaceId(record);
          const wakuren = await repo(OddsHaitou).countBy({
            RaceId: raceId,
            Kakutei: kakutei,
            Baken: Baken.Wakuren,
          });
          expect(wakuren).toBe(countOdds(record, 251, 5, 36));
          const tanshou = await repo(OddsHaitou).countBy({
            RaceId: raceId,
            Kakutei: kakutei,
            Baken: Baken.Tanshou,
          });
          expect(tanshou).toBe(countOdds(record, 161, 5, 18));
          const umaren = await repo(OddsHaitou).countBy({
            RaceId: raceId,
            Kakutei: kakutei,
            Baken: Baken.Umaren,
          });
          expect(umaren).toBe(countOdds(record, 431, 7, 153));
        }
      });
    }

    test.skipIf(!full)("kod2: ワイドは上限・下限の両方が保存される", async () => {
      await importKolKind("kod2");
      const records = kolRecords("kod2", 9043);
      const record = records[0];
      // 先頭 (01-02) のワイド "0010500106" 形式
      const raceId = raceTool().getRaceId(record);
      const lower = Number(field(record, 269, 5)) / 10;
      const upper = Number(field(record, 274, 5)) / 10;
      if (lower > 0 && upper > 0) {
        const row = await repo(OddsHaitou).findOneBy({
          RaceId: raceId,
          Kakutei: Kakutei.Kakutei,
          Baken: Baken.Wide,
          Bangou1: 1,
          Bangou2: 2,
        });
        expect(row?.Odds1).toBeCloseTo(lower, 5);
        expect(row?.Odds2).toBeCloseTo(upper, 5);
      }
    });
  });

  describe("SYU (種牡馬データ)", () => {
    test("種牡馬コードが保存される", async () => {
      await importKolKind("syu");
      const records = kolRecords("syu", 2010).slice(0, 30);
      for (const record of records) {
        const code = Number.parseInt(field(record, 0, 7), 10);
        const uma = await repo(Uma).findOneBy({ KolUmaCode: code });
        expect(uma).not.toBeNull();
        expect(uma?.Seibetsu).toBe($U.Seibetsu.Boba);
      }
    });
  });

  describe("KET5 (5代血統図)", () => {
    test("牡馬は牡馬、牝馬は牝馬として保存され、父母が正しくつながる", async () => {
      await importKolKind("ket5");
      const record = kolRecords("ket5", 4002)[0];
      const umaAt = async (offset: number) => {
        const code = Number.parseInt(field(record, offset, 7), 10);
        return repo(Uma).findOneBy({ KolUmaCode: code });
      };
      // エリア名が「父」で終わる 1〜3 代の祖先 (父, 父父, 父父父, 父母父, 母父, 母父父, 母母父)
      for (const offset of [50, 246, 638, 834, 442, 1030, 1226]) {
        expect((await umaAt(offset))?.Seibetsu).toBe($U.Seibetsu.Boba);
      }
      // 「母」で終わる祖先
      for (const offset of [148, 344, 540, 736, 932, 1128, 1324]) {
        expect((await umaAt(offset))?.Seibetsu).toBe($U.Seibetsu.Hinba);
      }
      // 母父母 (エリア13) の父は母父母父 (エリア26)、母は母父母母 (エリア27)
      const hch = await umaAt(1128);
      expect(hch?.ChichiUmaId).toBe((await umaAt(1922))?.Id);
      expect(hch?.HahaUmaId).toBe((await umaAt(1972))?.Id);
    });
  });

  describe("KET (3代血統図)", () => {
    test("仕様書どおりの位置から祖先を読み取る", async () => {
      await resetKolDb("ket");
      expect(readerOf("ket").getBufferLength()).toBe(839);
      const record = Buffer.alloc(839, 0x20);
      record.write("\r\n", 837, "latin1");
      put(record, 0, 7, "1000000");
      put(record, 7, 30, "ホンジンマ");
      // [輸入馬フラグの位置, 馬コード]
      const ancestors: { [name: string]: [number, number] } = {
        c: [37, 2000001],
        h: [121, 2000002],
        cc: [205, 2000003],
        ch: [247, 2000004],
        hc: [289, 2000005],
        hh: [331, 2000006],
        ccc: [373, 2000007],
        cch: [415, 2000008],
        chc: [457, 2000009],
        chh: [499, 2000010],
        hcc: [541, 2000011],
        hch: [583, 2000012],
        hhc: [625, 2000013],
        hhh: [667, 2000014],
      };
      const names = "アイウエオカキクケコサシスセ";
      Object.entries(ancestors).forEach(([key, [offset, code]], i) => {
        put(record, offset, 1, "1");
        put(record, offset + 1, 7, String(code));
        put(record, offset + 8, 34, `ソセン${names[i]}${names[i]}`);
        void key;
      });
      await saveRecord("ket", record);

      const byCode = (code: number) => repo(Uma).findOneBy({ KolUmaCode: code });
      for (const [key, [, code]] of Object.entries(ancestors)) {
        const uma = await byCode(code);
        expect(uma, key).not.toBeNull();
        // 末尾が c (父) の祖先は牡馬、h (母) は牝馬
        expect(uma?.Seibetsu, key).toBe(key.endsWith("c") ? $U.Seibetsu.Boba : $U.Seibetsu.Hinba);
      }
      const parent = async (key: string, side: "ChichiUmaId" | "HahaUmaId") =>
        (await byCode(ancestors[key][1]))?.[side];
      const id = async (key: string) => (await byCode(ancestors[key][1]))?.Id;
      // 母母の父は母母父(625)、母は母母母(667)
      expect(await parent("hh", "ChichiUmaId")).toBe(await id("hhc"));
      expect(await parent("hh", "HahaUmaId")).toBe(await id("hhh"));
      // 母父父は 541 から読む
      expect(await parent("hc", "ChichiUmaId")).toBe(await id("hcc"));
      expect(await parent("hc", "HahaUmaId")).toBe(await id("hch"));
      expect(await parent("h", "ChichiUmaId")).toBe(await id("hc"));
      expect(await parent("h", "HahaUmaId")).toBe(await id("hh"));
      expect(await parent("c", "ChichiUmaId")).toBe(await id("cc"));
      expect(await parent("c", "HahaUmaId")).toBe(await id("ch"));
    });

    test("祖先が空の血統図でも取り込める", async () => {
      await resetKolDb("ket");
      const record = Buffer.alloc(839, 0x20);
      record.write("\r\n", 837, "latin1");
      put(record, 0, 7, "1000099");
      put(record, 7, 30, "ミチノウマ");
      await saveRecord("ket", record);
      expect(await repo(Uma).findOneBy({ KolUmaCode: 1000099 })).not.toBeNull();
    });
  });

  describe("SEI3 (制裁その他データ)", () => {
    test("レースが未登録でも落ちない", async () => {
      await resetKolDb("kyu");
      const record = Buffer.from(kolRecords("sei3", 1050)[0]);
      put(record, 44, 960, "テスト制裁");
      await saveRecord("sei3", record);
    });
  });

  describe("調教", () => {
    /** 調教 1 件 (118 バイト) を作る。位置は仕様書の「調教」の項目を基準にした相対位置 */
    const slot = (opts: { date: string; course: string; times?: string[]; kaisuu?: string }) => {
      const b = Buffer.alloc(120, 0x20);
      put(b, 0, 1, "1");
      put(b, 1, 8, "助手");
      put(b, 9, 8, opts.date);
      put(b, 17, 8, opts.course);
      put(b, 25, 2, "良");
      const times = opts.times || [];
      [27, 33, 39, 45, 51, 57, 63].forEach((o, i) => {
        if (times[i]) {
          put(b, o, 6, times[i]);
        }
      });
      if (opts.kaisuu) {
        put(b, 39, 6, opts.kaisuu);
      }
      return b;
    };
    /** 出走馬Id は馬Id * 10 + n とする(n で別のレースを表す) */
    const saveChoukyou = (b: Buffer, umaId: number, n = 0) =>
      Container.get(KolChoukyouTool).saveChoukyou(b, 0, umaId * 10 + n, umaId, "テスト");

    beforeAll(async () => {
      await resetKolDb("kyu");
    });

    test("同じ馬が同じ日に 2 回調教しても、別の調教として保存される", async () => {
      const a = slot({ date: "20071005", course: "栗東  CW", times: [" 13.5", " 12.8"] });
      const b = slot({ date: "20071005", course: "栗東  CW", times: [" 14.1", " 12.0"] });
      await saveChoukyou(a, 101);
      await saveChoukyou(b, 101);
      const rows = await repo(Choukyou).findBy({ UmaId: 101 });
      expect(rows.length).toBe(2);
      expect(new Set(rows.map((r) => r.Id)).size).toBe(2);
      expect(rows.map((r) => r.Renban).sort()).toEqual([1, 2]);
    });

    test("同じ調教を別のファイルから読み直しても、同じ ID で 1 件のまま", async () => {
      const a = slot({ date: "20071005", course: "栗東  CW", times: [" 13.5", " 12.8"] });
      const b = slot({ date: "20071005", course: "栗東  CW", times: [" 14.1", " 12.0"] });
      await saveChoukyou(a, 104);
      await saveChoukyou(b, 104);
      await saveChoukyou(b, 104);
      await saveChoukyou(a, 104);
      const rows = await repo(Choukyou).findBy({ UmaId: 104 });
      expect(rows.length).toBe(2);
      expect(await repo(ChoukyouTime).countBy({ ChoukyouId: In(rows.map((r) => r.Id)) })).toBe(4);
    });

    test("同じ調教が 2 つのレースに出てくると、調教は 1 件で、出走馬ごとに結びつく", async () => {
      const a = slot({ date: "20071005", course: "栗東  CW", times: [" 13.5", " 12.8"] });
      await saveChoukyou(a, 107, 1);
      put(a, 76, 1, "4"); // 矢印はレースごとに違う
      await saveChoukyou(a, 107, 2);
      const rows = await repo(Choukyou).findBy({ UmaId: 107 });
      expect(rows.length).toBe(1);
      const links = await repo(ShussoubaChoukyou).findBy({ ChoukyouId: rows[0].Id });
      expect(links.map((l) => [l.ShussoubaId, l.Yajirushi]).sort()).toEqual([
        [1071, null],
        [1072, 4],
      ]);
    });

    test("ID は馬・日付・場所・種別・連番から決まる", async () => {
      await saveChoukyou(slot({ date: "20071005", course: "栗東  坂", kaisuu: "  2回" }), 105);
      const row = await repo(Choukyou).findOneBy({ UmaId: 105 });
      const days = Date.UTC(2007, 9, 5) / 86400000;
      // 栗東 = 50, 坂路 = 1, 連番 1
      expect(row?.Id).toBe(105 * 2 ** 30 + days * 2 ** 14 + 50 * 2 ** 6 + 1 * 2 ** 2 + 0);
      expect(row?.Renban).toBe(1);
    });

    test("日付のない調教は保存しない", async () => {
      await saveChoukyou(slot({ date: "", course: "栗東  CW" }), 106);
      expect(await repo(Choukyou).countBy({ UmaId: 106 })).toBe(0);
    });

    test("プールの調教には時計を保存しない", async () => {
      await saveChoukyou(
        slot({ date: "20071006", course: "プール", times: [" 13.5", " 12.8", "5周", " 11.7"] }),
        102,
      );
      const row = await repo(Choukyou).findOneBy({ UmaId: 102 });
      expect(row).not.toBeNull();
      expect(await repo(ChoukyouTime).countBy({ ChoukyouId: row?.Id })).toBe(0);
    });

    test("ウッドチップの調教は 8F〜1F の時計を保存する", async () => {
      await saveChoukyou(
        slot({
          date: "20071007",
          course: "栗東  CW",
          times: [" 95.6", " 79.9", " 65.0", " 51.0", " 38.2", " 24.9", " 12.1"],
        }),
        103,
      );
      const row = await repo(Choukyou).findOneBy({ UmaId: 103 });
      const times = await repo(ChoukyouTime).findBy({ ChoukyouId: row?.Id });
      expect(times.map((t) => t.F).sort()).toEqual([1, 3, 4, 5, 6, 7, 8]);
    });
  });
});
