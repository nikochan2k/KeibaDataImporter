/** 同期処理が続いても HTTP などの待ち行列が回るよう、イベントループに処理を譲る */
export function yieldToEventLoop() {
  return new Promise<void>((resolve) => setImmediate(resolve));
}

/**
 * 前回譲ってから interval ミリ秒たっていれば譲る。
 * bun:sqlite は同期なので、await だけではマイクロタスクで済んでしまい、他のリクエストに応答できない。
 */
export function createYielder(interval = 50) {
  let last = Date.now();
  return async () => {
    if (Date.now() - last >= interval) {
      await yieldToEventLoop();
      last = Date.now();
    }
  };
}
