import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Baken, Kakutei } from "../src/app/converters/Common";
import { closeDb, openDb, runInTransaction } from "../src/app/db/db";
import { countBy, findBy, findOneBy, upsertAll } from "../src/app/db/helpers";
import { ChoukyouTime } from "../src/app/entities/ChoukyouTime";
import { Kishu } from "../src/app/entities/Kishu";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { jrdbOddsHaitouTool } from "../src/app/reader/JRDB/JrdbOddsHaitouTool";
import { tool } from "../src/app/reader/Tool";

beforeAll(async () => {
  openDb(":memory:");
});

afterAll(async () => {
  closeDb();
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

  test("skipNull のときは null で既存の値を消さない", async () => {
    const asIs = await findOneBy(Kishu, { JrdbKishuCode: 2 });
    await tool.saveOrUpdate(Kishu, asIs, Object.assign({} as Kishu, { Shozoku: null }), true);
    expect((await findOneBy(Kishu, { JrdbKishuCode: 2 })).Shozoku).toBe(2);
    const asIs2 = await findOneBy(Kishu, { JrdbKishuCode: 2 });
    await tool.saveOrUpdate(Kishu, asIs2, Object.assign({} as Kishu, { Shozoku: null }));
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

  test("空の配列は何もしない", () => {
    expect(() => upsertAll(ChoukyouTime, [])).not.toThrow();
  });
});
