import { Database } from "bun:sqlite";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Baken, Kakutei } from "../src/app/converters/Common";
import { seisanshaDao } from "../src/app/daos/SeisanshaDao";
import { closeDb, currentSqlite, openDb, runInTransaction } from "../src/app/db/db";
import {
  countBy,
  findBy,
  findOneBy,
  save,
  upsertAll,
  upsertLater,
  upsertMerged,
} from "../src/app/db/helpers";
import { ensureSchema } from "../src/app/db/schema";
import { ChoukyouTime } from "../src/app/entities/ChoukyouTime";
import { Kishu } from "../src/app/entities/Kishu";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { Seisanba } from "../src/app/entities/Seisanba";
import { Seisansha } from "../src/app/entities/Seisansha";
import { SeisanshaMei } from "../src/app/entities/SeisanshaMei";
import { jrdbOddsHaitouTool } from "../src/app/reader/JRDB/JrdbOddsHaitouTool";
import { tool } from "../src/app/reader/Tool";

beforeAll(async () => {
  openDb(":memory:");
});

afterAll(async () => {
  closeDb();
});

describe("スキーマ", () => {
  test("空のデータベースには表を作り、定義と違う表があればエラーにする", () => {
    const sqlite = new Database(":memory:");
    ensureSchema(sqlite, "test");
    // 作った表は定義と同じなので、もう一度確かめても通る
    ensureSchema(sqlite, "test");
    sqlite.exec('ALTER TABLE "Uma" DROP COLUMN "YunyuuNen"');
    sqlite.exec('CREATE TABLE "Old" ("Id" integer)');
    expect(() => ensureSchema(sqlite, "test")).toThrow("Uma の列が違う、Old は定義にない");
    sqlite.close();
  });
});

describe("生産者", () => {
  test("正式名と略称は同じ生産者の名前になり、略称だけでも候補がひとりならその生産者", async () => {
    const kol = await seisanshaDao.saveSeisanba(1001, {
      meishou: "社台ファーム",
      tanshuku: "社台Ｆ",
    });
    const seisanshaId = kol?.SeisanshaId;
    expect(findBy(SeisanshaMei, { SeisanshaId: seisanshaId }).length).toBe(2);
    // 略称だけの馬
    expect((await seisanshaDao.saveSeisanba(1002, { tanshuku: "社台Ｆ" }))?.SeisanshaId).toBe(
      seisanshaId,
    );
    // 同じ略称の別の生産者がいると、略称だけでは決められない
    await seisanshaDao.saveSeisanba(1003, { meishou: "社台ファーム白老", tanshuku: "社台Ｆ" });
    const ambiguous = await seisanshaDao.saveSeisanba(1004, { tanshuku: "社台Ｆ" });
    expect(ambiguous?.SeisanshaId).not.toBe(seisanshaId);
    // コードを持つ生産者は、正式名が同じで、まだコードのない生産者になる
    await seisanshaDao.saveSeisansha({ JvDataCode: "00000001", meishou: "社台ファーム" });
    expect(findOneBy(Seisansha, { JvDataCode: "00000001" })?.Id).toBe(seisanshaId);
    expect(countBy(Seisanba, { SeisanshaId: seisanshaId })).toBe(2);
  });
});

describe("トランザクション", () => {
  test("失敗するとロールバックされる", async () => {
    await expect(
      runInTransaction(async () => {
        await tool.saveOrUpdate(Kishu, null, Object.assign({} as Kishu, { JrdbKishuCode: 1 }));
        throw new Error("途中で失敗");
      }),
    ).rejects.toThrow("途中で失敗");
    expect(await countBy(Kishu)).toBe(0);
  });

  test("成功するとコミットされる", async () => {
    await runInTransaction(async () => {
      await tool.saveOrUpdate(Kishu, null, Object.assign({} as Kishu, { JrdbKishuCode: 2 }));
    });
    expect(await countBy(Kishu)).toBe(1);
  });
});

describe("saveOrUpdate", () => {
  test("既存の行を更新する(引数は asIs, toBe の順)", async () => {
    const asIs = await findOneBy(Kishu, { JrdbKishuCode: 2 });
    await tool.saveOrUpdate(Kishu, asIs, Object.assign({} as Kishu, { Shozoku: 2 }));
    expect((await findOneBy(Kishu, { JrdbKishuCode: 2 })).Shozoku).toBe(2);
  });

  test("既定では null で既存の値を消さない。skipNull = false なら消す", async () => {
    const asIs = await findOneBy(Kishu, { JrdbKishuCode: 2 });
    await tool.saveOrUpdate(Kishu, asIs, Object.assign({} as Kishu, { Shozoku: null }));
    expect((await findOneBy(Kishu, { JrdbKishuCode: 2 })).Shozoku).toBe(2);
    const asIs2 = await findOneBy(Kishu, { JrdbKishuCode: 2 });
    await tool.saveOrUpdate(Kishu, asIs2, Object.assign({} as Kishu, { Shozoku: null }), false);
    expect((await findOneBy(Kishu, { JrdbKishuCode: 2 })).Shozoku).toBeNull();
  });
});

describe("オッズ配当", () => {
  test("再取り込みで値が更新される", async () => {
    const tool = jrdbOddsHaitouTool;
    const make = (odds: number) =>
      Object.assign({} as OddsHaitou, {
        RaceId: 100,
        Kakutei: Kakutei.Kakutei,
        Baken: Baken.Tanshou,
        Bangou1: 3,
        Odds1: odds,
      });
    await tool.saveOddsHaitou(make(5.5));
    await tool.saveOddsHaitou(make(7.7));
    const rows = await findBy(OddsHaitou);
    expect(rows.length).toBe(1);
    expect(rows[0].Odds1).toBeCloseTo(7.7);
  });
});

describe("upsertAll", () => {
  const time = (ChoukyouId: number, F: number, rest: Partial<ChoukyouTime> = {}) =>
    ({ ChoukyouId, F, ...rest }) as ChoukyouTime;

  test("複数行をまとめて追加し、既存の行は渡した項目だけ更新する", () => {
    upsertAll(ChoukyouTime, [
      time(1, 1, { Time: 12.3, Comment: "a" }),
      time(1, 2, { Time: 12.5, Comment: "b" }),
    ]);
    upsertAll(ChoukyouTime, [time(1, 1, { Time: 11.9 }), time(1, 3, { Time: 12.0 })]);
    expect(findBy(ChoukyouTime, { ChoukyouId: 1 }).sort((a, b) => a.F - b.F)).toEqual([
      { ChoukyouId: 1, F: 1, Time: 11.9, Comment: "a" },
      { ChoukyouId: 1, F: 2, Time: 12.5, Comment: "b" },
      { ChoukyouId: 1, F: 3, Time: 12.0, Comment: null },
    ]);
  });

  test("項目の組が違う行が混ざっていても、undefined の項目は書かない", () => {
    upsertAll(ChoukyouTime, [
      time(2, 1, { Time: 1, Comment: "x" }),
      time(2, 2, { Time: undefined, Comment: "y" }),
      time(2, 1, { Comment: undefined, Time: 2 }),
    ]);
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 2, F: 1 })).toEqual({
      ChoukyouId: 2,
      F: 1,
      Time: 2,
      Comment: "x",
    });
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 2, F: 2 })).toEqual({
      ChoukyouId: 2,
      F: 2,
      Time: null,
      Comment: "y",
    });
  });

  test("同じ主キーの行が続くときは、あとの値が残る", () => {
    upsertAll(ChoukyouTime, [
      time(3, 1, { Time: 1, Comment: "first" }),
      time(3, 1, { Time: 2, Comment: "last" }),
    ]);
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 3, F: 1 })).toEqual({
      ChoukyouId: 3,
      F: 1,
      Time: 2,
      Comment: "last",
    });
  });

  test("主キーだけの行は、既存の値を変えずに追加する", () => {
    upsertAll(ChoukyouTime, [time(3, 1), time(3, 9)]);
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 3, F: 1 })?.Comment).toBe("last");
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 3, F: 9 })).not.toBeNull();
  });

  test("変数の上限を超える行数でも、分けて保存する", () => {
    const rows = Array.from({ length: 20000 }, (_, i) => time(4, i, { Time: i, Comment: `c${i}` }));
    upsertAll(ChoukyouTime, rows);
    expect(countBy(ChoukyouTime, { ChoukyouId: 4 })).toBe(20000);
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 4, F: 19999 })?.Comment).toBe("c19999");
  });

  test("既定では null で既存の値を消さない。skipNull = false なら消す", () => {
    upsertAll(ChoukyouTime, [time(5, 1, { Time: 1, Comment: "keep" })]);
    upsertAll(ChoukyouTime, [time(5, 1, { Time: 2, Comment: null })]);
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 5, F: 1 })).toEqual({
      ChoukyouId: 5,
      F: 1,
      Time: 2,
      Comment: "keep",
    });
    upsertAll(ChoukyouTime, [time(5, 1, { Comment: null })], false);
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 5, F: 1 })?.Comment).toBeNull();
  });

  test("空の配列は何もしない", () => {
    expect(() => upsertAll(ChoukyouTime, [])).not.toThrow();
  });
});

describe("save", () => {
  test("null で既存の値を消さない", () => {
    save(ChoukyouTime, { ChoukyouId: 6, F: 1, Time: 1, Comment: "keep" });
    save(ChoukyouTime, { ChoukyouId: 6, F: 1, Time: 2, Comment: null });
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 6, F: 1 })).toEqual({
      ChoukyouId: 6,
      F: 1,
      Time: 2,
      Comment: "keep",
    });
  });
});

describe("upsertLater", () => {
  const time = (ChoukyouId: number, F: number, rest: Partial<ChoukyouTime> = {}) =>
    ({ ChoukyouId, F, ...rest }) as ChoukyouTime;
  /** 溜めた行を書き出さずに、データベースの行数を数える */
  const stored = (id: number) =>
    (
      currentSqlite()
        .query("SELECT COUNT(*) AS n FROM ChoukyouTime WHERE ChoukyouId = ?")
        .get(id) as { n: number }
    ).n;

  test("トランザクションの外では、その場で書く", () => {
    upsertLater(ChoukyouTime, time(10, 1, { Time: 1 }));
    expect(stored(10)).toBe(1);
  });

  test("トランザクションの中では溜めて、COMMIT で書く", async () => {
    await runInTransaction(async () => {
      upsertLater(ChoukyouTime, time(11, 1, { Time: 1 }));
      upsertLater(ChoukyouTime, time(11, 2, { Time: 2 }));
      expect(stored(11)).toBe(0);
    });
    expect(stored(11)).toBe(2);
  });

  test("同じ主キーの行は項目ごとにマージされ、あとの値が勝つ", async () => {
    await runInTransaction(async () => {
      upsertLater(ChoukyouTime, time(12, 1, { Time: 1, Comment: "a" }));
      upsertLater(ChoukyouTime, time(12, 1, { Time: 2 }));
      upsertLater(ChoukyouTime, time(12, 1, { Comment: null }), true);
    });
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 12, F: 1 })).toEqual({
      ChoukyouId: 12,
      F: 1,
      Time: 2,
      Comment: "a",
    });
  });

  test("同じ表を読む直前に書き出されて、溜めた行が見える", async () => {
    await runInTransaction(async () => {
      upsertLater(ChoukyouTime, time(13, 1, { Time: 1 }));
      expect(findOneBy(ChoukyouTime, { ChoukyouId: 13, F: 1 })?.Time).toBe(1);
      upsertLater(ChoukyouTime, time(13, 2, { Time: 2 }));
      expect(countBy(ChoukyouTime, { ChoukyouId: 13 })).toBe(2);
    });
  });

  test("主キーを全部指定した読み取りは、その行が溜まっていなければ書き出さない", async () => {
    await runInTransaction(async () => {
      upsertLater(ChoukyouTime, time(16, 1, { Time: 1 }));
      expect(findOneBy(ChoukyouTime, { ChoukyouId: 16, F: 2 })).toBeNull();
      expect(stored(16)).toBe(0);
      expect(findOneBy(ChoukyouTime, { ChoukyouId: 16, F: 1 })?.Time).toBe(1);
      expect(stored(16)).toBe(1);
    });
  });

  test("ROLLBACK では捨てられる", async () => {
    await expect(
      runInTransaction(async () => {
        upsertLater(ChoukyouTime, time(14, 1, { Time: 1 }));
        throw new Error("途中で失敗");
      }),
    ).rejects.toThrow("途中で失敗");
    expect(stored(14)).toBe(0);
    await runInTransaction(async () => {});
    expect(stored(14)).toBe(0);
  });

  test("行数が上限を超えると途中で書き出す", async () => {
    await runInTransaction(async () => {
      for (let f = 1; f <= 5000; f++) {
        upsertLater(ChoukyouTime, time(15, f, { Time: f }));
      }
      expect(stored(15)).toBe(5000);
    });
  });

  test("主キーが空の行は例外にする", async () => {
    await expect(
      runInTransaction(async () => {
        upsertLater(ChoukyouTime, { F: 1 } as ChoukyouTime);
      }),
    ).rejects.toThrow("ChoukyouTime.ChoukyouId");
  });
});

describe("upsertMerged", () => {
  const time = (ChoukyouId: number, F: number, rest: Partial<ChoukyouTime> = {}) =>
    ({ ChoukyouId, F, ...rest }) as ChoukyouTime;
  const stored = (id: number) =>
    (
      currentSqlite()
        .query("SELECT COUNT(*) AS n FROM ChoukyouTime WHERE ChoukyouId = ?")
        .get(id) as { n: number }
    ).n;

  test("溜めたまま、保存後と同じ行を返す", async () => {
    upsertAll(ChoukyouTime, [time(20, 1, { Time: 1, Comment: "a" })]);
    const returned: unknown[] = [];
    await runInTransaction(async () => {
      // 保存済みの行に重ねる。null は既存の値を消さない
      returned.push(upsertMerged(ChoukyouTime, time(20, 1, { Time: 2, Comment: null })));
      // 溜めた行にさらに重ねる
      returned.push(upsertMerged(ChoukyouTime, time(20, 1, { Comment: "b" })));
      // 保存されていない行は、ない項目が null
      returned.push(upsertMerged(ChoukyouTime, time(20, 2, { Time: 5 })));
      expect(stored(20)).toBe(1);
    });
    expect(returned).toEqual([
      { ChoukyouId: 20, F: 1, Time: 2, Comment: "a" },
      { ChoukyouId: 20, F: 1, Time: 2, Comment: "b" },
      { ChoukyouId: 20, F: 2, Time: 5, Comment: null },
    ]);
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 20, F: 1 })).toEqual(returned[1] as never);
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 20, F: 2 })).toEqual(returned[2] as never);
  });

  test("skipNull = false なら null で消す", async () => {
    upsertAll(ChoukyouTime, [time(21, 1, { Time: 1, Comment: "a" })]);
    let returned: unknown;
    await runInTransaction(async () => {
      returned = upsertMerged(ChoukyouTime, time(21, 1, { Comment: null }), false);
    });
    expect(returned).toEqual({ ChoukyouId: 21, F: 1, Time: 1, Comment: null });
    expect(findOneBy(ChoukyouTime, { ChoukyouId: 21, F: 1 })).toEqual(returned as never);
  });

  test("トランザクションの外では、その場で書く", () => {
    const row = upsertMerged(ChoukyouTime, time(22, 1, { Time: 1 }));
    expect(row).toEqual({ ChoukyouId: 22, F: 1, Time: 1, Comment: null });
    expect(stored(22)).toBe(1);
  });
});
