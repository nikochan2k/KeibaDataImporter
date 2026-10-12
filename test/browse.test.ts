import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { closeDb, openDb } from "../src/app/db/db";
import { createApp } from "../src/app/http/app";
import { seedBrowseFixture } from "./fixtures/browse";

const app = createApp();

async function get(path: string) {
  const response = await app.handle(new Request(`http://localhost${path}`));
  return { status: response.status, body: await response.json() };
}

beforeAll(async () => {
  openDb(":memory:");
  await seedBrowseFixture();
});

afterAll(async () => {
  closeDb();
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
  test("馬名の前方一致で探す", async () => {
    expect((await get(`/api/umas?q=${encodeURIComponent("ルファ")}`)).body).toHaveLength(0);
    const { body } = await get(`/api/umas?q=${encodeURIComponent("アル")}`);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ bamei: "アルファ", seinen: 2020, seibetsu: "牡" });
  });

  test("生年が無ければ生年月日から出す", async () => {
    const { body } = await get(`/api/umas?q=${encodeURIComponent("ブラボー")}`);
    expect(body[0].seinen).toBe(2021);
  });

  test("% と _ は文字として探す", async () => {
    expect(
      (await get(`/api/umas?q=${encodeURIComponent("100%")}`)).body.map((u) => u.bamei),
    ).toEqual(["100%ウマ_"]);
    expect((await get(`/api/umas?q=${encodeURIComponent("100_")}`)).body).toHaveLength(0);
    expect((await get(`/api/umas?q=${encodeURIComponent("%")}`)).body).toHaveLength(0);
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

describe("騎手", () => {
  test("名前の前方一致で探す", async () => {
    expect((await get(`/api/kishus?q=${encodeURIComponent("豊")}`)).body).toHaveLength(0);
    const { body } = await get(`/api/kishus?q=${encodeURIComponent("武")}`);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: 7, meishou: "武 豊", seinen: 1969, shozoku: "関西" });
    expect((await get("/api/kishus?q=%20")).status).toBe(400);
  });

  test("騎手の詳細は騎乗した全レースを返す", async () => {
    const { status, body } = await get("/api/kishus/7");
    expect(status).toBe(200);
    expect(body.starts.map((s) => [s.date, s.raceBangou, s.bamei, s.chakujun])).toEqual([
      ["2024-04-07", 11, "アルファ", 2],
    ]);
    expect(body).toMatchObject({ startCount: 1, perPage: 50 });
    expect((await get("/api/kishus/7?page=2")).body.starts).toEqual([]);
    expect((await get("/api/kishus/7?page=0")).status).toBe(400);
    expect((await get("/api/kishus/99999")).status).toBe(404);
  });
});

describe("調教師", () => {
  test("名前の前方一致で探す", async () => {
    expect((await get(`/api/choukyoushis?q=${encodeURIComponent("芳")}`)).body).toHaveLength(0);
    const { body } = await get(`/api/choukyoushis?q=${encodeURIComponent("矢作")}`);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: 5, meishou: "矢作 芳人", seinen: 1960, shozoku: "関西" });
    expect((await get("/api/choukyoushis?q=%20")).status).toBe(400);
  });

  test("調教師の詳細は管理馬の出走を返す", async () => {
    const { status, body } = await get("/api/choukyoushis/5");
    expect(status).toBe(200);
    expect(body.starts.map((s) => [s.date, s.raceBangou, s.bamei, s.kishuMei])).toEqual([
      ["2024-04-14", 2, "アルファ", null],
      ["2024-04-07", 11, "アルファ", "武 豊"],
    ]);
    expect(body).toMatchObject({ startCount: 2, perPage: 50 });
    expect((await get("/api/choukyoushis/5?page=2")).body.starts).toEqual([]);
    expect((await get("/api/choukyoushis/5?page=0")).status).toBe(400);
    expect((await get("/api/choukyoushis/99999")).status).toBe(404);
  });
});

describe("馬主", () => {
  test("名前の前方一致で探す", async () => {
    expect((await get(`/api/banushis?q=${encodeURIComponent("レーシング")}`)).body).toHaveLength(0);
    const { body } = await get(`/api/banushis?q=${encodeURIComponent("サンデー")}`);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      meishou: "サンデーレーシング",
      fukushoku: "水色，赤山形一本輪",
    });
    expect((await get("/api/banushis?q=%20")).status).toBe(400);
  });

  test("馬主の詳細は、その時点で持っていた馬の出走だけを返す", async () => {
    const [a, b] = await Promise.all(
      ["サンデー", "キャロット"].map(
        async (q) => (await get(`/api/banushis?q=${encodeURIComponent(q)}`)).body[0].id,
      ),
    );
    const first = await get(`/api/banushis/${a}`);
    expect(first.status).toBe(200);
    expect(first.body.starts.map((s) => [s.date, s.raceBangou, s.bamei])).toEqual([
      ["2024-04-07", 11, "アルファ"],
    ]);
    expect(first.body).toMatchObject({ startCount: 1, perPage: 50 });
    expect((await get(`/api/banushis/${b}`)).body.starts.map((s) => s.date)).toEqual([
      "2024-04-14",
    ]);
    expect((await get(`/api/banushis/${a}?page=2`)).body.starts).toEqual([]);
    expect((await get(`/api/banushis/${a}?page=0`)).status).toBe(400);
    expect((await get("/api/banushis/99999")).status).toBe(404);
  });
});

describe("生産者", () => {
  test("名前の前方一致で探す", async () => {
    expect((await get(`/api/seisanshas?q=${encodeURIComponent("ファーム")}`)).body).toHaveLength(0);
    const { body } = await get(`/api/seisanshas?q=${encodeURIComponent("社台")}`);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ meishou: "社台ファーム", juusho: "北海道" });
    expect((await get("/api/seisanshas?q=%20")).status).toBe(400);
  });

  test("生産者の詳細は、生産馬の出走を返す", async () => {
    const { id } = (await get(`/api/seisanshas?q=${encodeURIComponent("社台")}`)).body[0];
    const res = await get(`/api/seisanshas/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.starts.map((s) => [s.date, s.bamei])).toEqual([
      ["2024-04-14", "アルファ"],
      ["2024-04-07", "アルファ"],
    ]);
    expect(res.body).toMatchObject({ startCount: 2, perPage: 50 });
    expect((await get(`/api/seisanshas/${id}?page=2`)).body.starts).toEqual([]);
    expect((await get(`/api/seisanshas/${id}?page=0`)).status).toBe(400);
    expect((await get("/api/seisanshas/99999")).status).toBe(404);
  });
});

describe("取り込み", () => {
  test("接続元が分からない (ローカルと確かめられない) ときは拒否する", async () => {
    const { status, body } = await get("/api/imports");
    expect(status).toBe(403);
    expect(body.message).toBe("取り込みはローカルからしか使えません");
  });
});
