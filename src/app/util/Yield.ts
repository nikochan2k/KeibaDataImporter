/**
 * イベントループに処理を譲る。
 * 取り込みはワーカーで動くので HTTP の応答は妨げないが、メインスレッドからの停止の求めは、ここで受け取る。
 */
export function yieldToEventLoop() {
  return new Promise<void>((resolve) => setImmediate(resolve));
}
