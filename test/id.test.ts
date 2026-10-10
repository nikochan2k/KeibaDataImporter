import "reflect-metadata";
import { describe, expect, test } from "bun:test";
import { Baken, Kakutei } from "../src/app/converters/Common";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { JrdbOddsHaitouTool } from "../src/app/reader/JRDB/JrdbOddsHaitouTool";

function odds(raceId: number, kakutei: Kakutei, baken: Baken, b1: number, b2?: number, b3?: number) {
  const o = new OddsHaitou();
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
