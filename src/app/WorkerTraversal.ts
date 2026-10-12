import { Worker } from "node:worker_threads";
import { openedDbFile } from "./db/db";
import { importProgress } from "./ImportProgress";
import type {
  ImportWorkerData,
  ImportWorkerEvent,
  ImportWorkerRequest,
} from "./ImportWorkerMessages";
import { loggersSilenced } from "./LogUtil";
import { type Traversal, traversal } from "./Traversal";

/**
 * Traversal を、ワーカーで動かす。
 * bun:sqlite は同期なので、メインスレッドで取り込むと SQL を流している間は HTTP に応答できない。
 * 数えるだけの countFiles は非同期で済むので、メインスレッドのまま実行する。
 * メモリー上のデータベースは接続ごとに別物なので、そのときはメインスレッドで取り込む。
 */
export class WorkerTraversal implements Pick<Traversal, "countFiles" | "traverse"> {
  public countFiles(entry: string) {
    return traversal.countFiles(entry);
  }

  public traverse(entry: string): Promise<void> {
    const file = openedDbFile();
    if (!file || file === ":memory:") {
      return traversal.traverse(entry);
    }
    const workerData: ImportWorkerData = { file, entry, quiet: loggersSilenced() };
    return new Promise<void>((resolve, reject) => {
      const worker = new Worker(new URL("./ImportWorker.ts", import.meta.url), { workerData });
      let settled = false;
      const settle = (error?: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        void worker.terminate();
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };
      importProgress.onStop((reason) => {
        const request: ImportWorkerRequest = { type: "stop", reason };
        worker.postMessage(request);
      });
      worker.on("message", (event: ImportWorkerEvent) => {
        if (event.type === "progress") {
          Reflect.apply(importProgress[event.method], importProgress, event.args);
        } else if (event.type === "done") {
          settle();
        } else {
          settle(new Error(event.message));
        }
      });
      worker.on("error", (error) =>
        settle(error instanceof Error ? error : new Error(String(error))),
      );
      worker.on("exit", (code) =>
        settle(new Error(`取り込みのワーカーが終了しました (code: ${code})`)),
      );
    });
  }
}

export const workerTraversal = new WorkerTraversal();
