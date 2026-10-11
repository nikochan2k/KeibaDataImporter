import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app/AppModule";
import { dataSource } from "../src/app/DataSource";
import { seedBrowseFixture } from "./fixtures/browse";

let app: INestApplication;
let base: string;

async function get(path: string) {
  const response = await fetch(base + path);
  return { status: response.status, body: await response.json() };
}

beforeAll(async () => {
  dataSource.setOptions({ database: ":memory:" });
  await dataSource.initialize();
  await dataSource.synchronize();
  await seedBrowseFixture();

  app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(0, "127.0.0.1");
  base = await app.getUrl();
});

afterAll(async () => {
  await app.close();
  await dataSource.destroy();
});

describe("レース", () => {
  test("レースのある年月", async () => {
    expect((await get("/api/race-months")).body).toEqual([{ year: 2024, month: 4 }]);
  });

  test("開催のある日と競馬場", async () => {
    const { status, body } = await get("/api/race-days?year=2024&month=4");
    expect(status).toBe(200);
    expect(body.map((d) => [d.date, d.bashos.map((b) => b.bashoMei)])).toEqual([
      ["2024-04-07", ["阪神", "東京"]],
      ["2024-04-14", ["東京"]],
    ]);
    expect((await get("/api/race-days?year=2024&month=5")).body).toEqual([]);
  });

  test("日と競馬場でレースを選べる", async () => {
    const days = (await get("/api/race-days?year=2024&month=4")).body;
    const tokyo = days[0].bashos.find((b) => b.bashoMei === "東京");
    const races = (await get(`/api/races?date=2024-04-07&basho=${tokyo.basho}`)).body;
    expect(races.map((r) => [r.date, r.raceBangou])).toEqual([
      ["2024-04-07", 1],
      ["2024-04-07", 11],
    ]);
    expect((await get("/api/races?date=2024-04-07&basho=x")).status).toBe(400);
  });

  test("日付のレース一覧は、場所、レース番号の順", async () => {
    const { body } = await get("/api/races?date=2024-04-07");
    expect(body.map((r) => [r.bashoMei, r.raceBangou])).toEqual([
      ["阪神", 5],
      ["東京", 1],
      ["東京", 11],
    ]);
    const stakes = body[2];
    expect(stakes).toMatchObject({
      id: 11,
      date: "2024-04-07",
      meishou: "テストステークス",
      grade: "G1",
      kyori: 1600,
      dirtShiba: "芝",
      hassouJikan: "15:40",
    });
    expect(body[0].hassouJikan).toBe("12:30");
    expect(body[1].meishou).toBeNull();
  });

  test("レース詳細は着順の順に出走馬を返し、着順のない馬は最後", async () => {
    const { status, body } = await get("/api/races/11");
    expect(status).toBe(200);
    expect(body.meishou).toBe("テストステークス");
    expect(body.entries.map((e) => [e.umaban, e.bamei, e.chakujun])).toEqual([
      [2, "ブラボー", 1],
      [1, "アルファ", 2],
      [3, "チャーリー", null],
    ]);
    expect(body.entries[0]).toMatchObject({ time: 96.2, agari3F: 33.9, bataijuu: 480, zougen: -2 });
    // 騎手名は氏名(Seimei)を優先する
    expect(body.entries[1].kishuMei).toBe("武 豊");
    expect(body.entries[2].torikeshi).toBe(1);
  });

  test("不正な指定は 400、ないレースは 404", async () => {
    expect((await get("/api/races?date=2024-4-7")).status).toBe(400);
    expect((await get("/api/races")).status).toBe(400);
    expect((await get("/api/race-days?year=2024&month=13")).status).toBe(400);
    expect((await get("/api/races/abc")).status).toBe(400);
    expect((await get("/api/races/999")).status).toBe(404);
  });
});

describe("馬", () => {
  test("馬名の部分一致で探す", async () => {
    const { body } = await get(`/api/umas?q=${encodeURIComponent("ルファ")}`);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ bamei: "アルファ", seinen: 2020, seibetsu: "牡" });
  });

  test("生年が無ければ生年月日から出す", async () => {
    const { body } = await get(`/api/umas?q=${encodeURIComponent("ブラボー")}`);
    expect(body[0].seinen).toBe(2021);
  });

  test("% と _ は文字として探す", async () => {
    expect((await get(`/api/umas?q=${encodeURIComponent("%")}`)).body.map((u) => u.bamei)).toEqual([
      "100%ウマ_",
    ]);
    expect((await get(`/api/umas?q=${encodeURIComponent("_")}`)).body).toHaveLength(1);
    expect((await get("/api/umas?q=%20")).status).toBe(400);
  });

  test("馬の詳細は父母と、出走した全レースを新しい順に返す", async () => {
    const found = (await get(`/api/umas?q=${encodeURIComponent("アルファ")}`)).body[0];
    const { status, body } = await get(`/api/umas/${found.id}`);
    expect(status).toBe(200);
    expect(body.chichi.bamei).toBe("チチウマ");
    expect(body.haha.bamei).toBe("ハハウマ");
    expect(body.starts.map((s) => [s.date, s.raceBangou, s.chakujun])).toEqual([
      ["2024-04-14", 2, null],
      ["2024-04-07", 11, 2],
    ]);
    expect(body.starts[1]).toMatchObject({
      meishou: "テストステークス",
      umaban: 1,
      kishuMei: "武 豊",
    });
    expect((await get("/api/umas/99999")).status).toBe(404);
  });
});
