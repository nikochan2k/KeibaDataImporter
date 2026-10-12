import { describe, expect, test } from "bun:test";
import { yieldToEventLoop } from "../src/app/util/Yield";

describe("yieldToEventLoop", () => {
  test("譲ると、同期的な処理が続いていてもタイマーが動く", async () => {
    let ticks = 0;
    const timer = setInterval(() => ticks++, 5);
    try {
      const end = Date.now() + 100;
      while (Date.now() < end) {
        await yieldToEventLoop();
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
