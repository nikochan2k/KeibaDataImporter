import { describe, expect, test } from "bun:test";
import { Baken, Kakutei } from "../src/app/converters/Common";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { JrdbOddsHaitouTool } from "../src/app/reader/JRDB/JrdbOddsHaitouTool";
import { getRaceLapTimeId } from "../src/app/reader/RaceTool";

function odds(
  raceId: number,
  kakutei: Kakutei,
  baken: Baken,
  b1: number,
  b2?: number,
  b3?: number,
) {
  const o = {} as OddsHaitou;
  o.RaceId = raceId;
  o.Kakutei = kakutei;
  o.Baken = baken;
  o.Bangou1 = b1;
  o.Bangou2 = b2;
  o.Bangou3 = b3;
  return o;
}

describe("オッズ配当ID", () => {
  const tool = new JrdbOddsHaitouTool();

  test("確定の違い・レースの違いで衝突しない", () => {
    const ids = new Set<number>();
    for (let race = 100; race < 103; race++) {
      for (const k of [Kakutei.Kakutei, Kakutei.Yosou]) {
        for (let u = 1; u <= 18; u++) {
          ids.add(tool.calculateOddsHaitouId(odds(race, k, Baken.Tanshou, u)));
        }
      }
    }
    expect(ids.size).toBe(3 * 2 * 18);
  });

  test("最大の馬番でも次のレースと衝突しない", () => {
    const a = tool.calculateOddsHaitouId(odds(100, Kakutei.Kakutei, Baken.Sanrentan, 18, 18, 18));
    const b = tool.calculateOddsHaitouId(odds(101, Kakutei.Yosou, Baken.Tanshou, 1));
    expect(a).toBeLessThan(b);
  });
});

describe("ラップタイムID", () => {
  // 2^28 未満の最大のレースID
  const raceId = 2 ** 28 - 1;

  test("開始距離が同じでも、区間の長さが違えば衝突しない", () => {
    const ids = [600, 800, 1000].map((s) => getRaceLapTimeId(raceId, 0, s));
    expect(new Set(ids).size).toBe(3);
  });

  test("最大の区間でも安全な整数に収まり、次のレースと衝突しない", () => {
    const a = getRaceLapTimeId(raceId - 1, 2 ** 13 - 1, 2 ** 13 - 1 + 2 ** 11 - 1);
    const b = getRaceLapTimeId(raceId, 0, 1);
    expect(Number.isSafeInteger(a)).toBe(true);
    expect(a).toBeLessThan(b as number);
  });

  test("範囲外の区間は null", () => {
    expect(getRaceLapTimeId(raceId, -1600, 0)).toBeNull();
    expect(getRaceLapTimeId(raceId, 200, 200)).toBeNull();
    expect(getRaceLapTimeId(raceId, 0, 2048)).toBeNull();
    expect(getRaceLapTimeId(raceId, Number.NaN, 200)).toBeNull();
  });
});
