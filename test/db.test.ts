import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Baken, Kakutei } from "../src/app/converters/Common";
import { closeDb, openDb, runInTransaction } from "../src/app/db/db";
import { countBy, findBy, findOneBy } from "../src/app/db/helpers";
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
