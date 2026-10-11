import { describe, expect, test } from "bun:test";
import { createYielder } from "../src/app/util/Yield";

describe("createYielder", () => {
  test("await だけが続く同期的な処理の間も、タイマーが動く", async () => {
    let ticks = 0;
    const timer = setInterval(() => ticks++, 5);
    try {
      const yielder = createYielder(10);
      const end = Date.now() + 100;
      while (Date.now() < end) {
        await yielder();
      }
    } finally {
      clearInterval(timer);
    }
    expect(ticks).toBeGreaterThan(3);
  });

  test("譲らないと、同じ処理ではタイマーが動かない", async () => {
    let ticks = 0;
    const timer = setInterval(() => ticks++, 5);
    try {
      const end = Date.now() + 50;
      while (Date.now() < end) {
        await Promise.resolve();
      }
    } finally {
      clearInterval(timer);
    }
    expect(ticks).toBe(0);
  });
});
