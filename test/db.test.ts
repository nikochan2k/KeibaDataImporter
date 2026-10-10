import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Container } from "typedi";
import { Baken, Kakutei } from "../src/app/converters/Common";
import { dataSource } from "../src/app/DataSource";
import { Kishu } from "../src/app/entities/Kishu";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { runInTransaction } from "../src/app/OrmManager";
import { JrdbOddsHaitouTool } from "../src/app/reader/JRDB/JrdbOddsHaitouTool";
import { Tool } from "../src/app/reader/Tool";

beforeAll(async () => {
  dataSource.setOptions({ database: ":memory:" });
  await dataSource.initialize();
  await dataSource.synchronize();
});

afterAll(async () => {
  await dataSource.destroy();
});

describe("トランザクション", () => {
  test("失敗するとロールバックされる", async () => {
    const tool = Container.get(Tool);
    await expect(
      runInTransaction(async () => {
        await tool.saveOrUpdate(Kishu, null, Object.assign(new Kishu(), { JrdbKishuCode: 1 }));
        throw new Error("途中で失敗");
      }),
    ).rejects.toThrow("途中で失敗");
    expect(await dataSource.manager.count(Kishu)).toBe(0);
  });

  test("成功するとコミットされる", async () => {
    const tool = Container.get(Tool);
    await runInTransaction(async () => {
      await tool.saveOrUpdate(Kishu, null, Object.assign(new Kishu(), { JrdbKishuCode: 2 }));
    });
    expect(await dataSource.manager.count(Kishu)).toBe(1);
  });
});

describe("saveOrUpdate", () => {
  test("既存の行を更新する(引数は asIs, toBe の順)", async () => {
    const tool = Container.get(Tool);
    const asIs = await dataSource.manager.findOneBy(Kishu, { JrdbKishuCode: 2 });
    await tool.saveOrUpdate(Kishu, asIs, Object.assign(new Kishu(), { Shozoku: 2 }));
    expect((await dataSource.manager.findOneBy(Kishu, { JrdbKishuCode: 2 })).Shozoku).toBe(2);
  });

  test("skipNull のときは null で既存の値を消さない", async () => {
    const tool = Container.get(Tool);
    const asIs = await dataSource.manager.findOneBy(Kishu, { JrdbKishuCode: 2 });
    await tool.saveOrUpdate(Kishu, asIs, Object.assign(new Kishu(), { Shozoku: null }), true);
    expect((await dataSource.manager.findOneBy(Kishu, { JrdbKishuCode: 2 })).Shozoku).toBe(2);
    const asIs2 = await dataSource.manager.findOneBy(Kishu, { JrdbKishuCode: 2 });
    await tool.saveOrUpdate(Kishu, asIs2, Object.assign(new Kishu(), { Shozoku: null }));
    expect((await dataSource.manager.findOneBy(Kishu, { JrdbKishuCode: 2 })).Shozoku).toBeNull();
  });
});

describe("オッズ配当", () => {
  test("再取り込みで値が更新される", async () => {
    const tool = Container.get(JrdbOddsHaitouTool);
    const make = (odds: number) =>
      Object.assign(new OddsHaitou(), {
        RaceId: 100,
        Kakutei: Kakutei.Kakutei,
        Baken: Baken.Tanshou,
        Bangou1: 3,
        Odds1: odds,
      });
    await tool.saveOddsHaitou(make(5.5));
    await tool.saveOddsHaitou(make(7.7));
    const rows = await dataSource.manager.find(OddsHaitou);
    expect(rows.length).toBe(1);
    expect(rows[0].Odds1).toBeCloseTo(7.7);
  });
});
