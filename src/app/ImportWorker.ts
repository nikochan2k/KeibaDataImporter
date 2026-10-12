import { parentPort, workerData } from "node:worker_threads";
import { closeDb, openDb } from "./db/db";
import { type ImportProgressSink, importProgress } from "./ImportProgress";
import type {
  ImportWorkerData,
  ImportWorkerEvent,
  ImportWorkerRequest,
} from "./ImportWorkerMessages";
import { silenceLoggers } from "./LogUtil";

/**
 * 取り込みを別のスレッドで動かす。メインスレッドの HTTP の応答を、SQLite の同期処理が止めないようにするため。
 * 進捗はメインスレッドへ送り、止める求めはメインスレッドから受ける。
 */
const port = parentPort;
if (!port) {
  throw new Error("ImportWorker は Worker として起動してください");
}
const data: ImportWorkerData = workerData;

function post(event: ImportWorkerEvent) {
  port?.postMessage(event);
}

const forwardTo =
  (method: keyof ImportProgressSink) =>
  (...args: unknown[]) =>
    post({ type: "progress", method, args } as ImportWorkerEvent);

const sink: ImportProgressSink = {
  fileStarted: forwardTo("fileStarted"),
  fileFinished: forwardTo("fileFinished"),
  fileFailed: forwardTo("fileFailed"),
  fileSkipped: forwardTo("fileSkipped"),
  entryStarted: forwardTo("entryStarted"),
  entryProcessed: forwardTo("entryProcessed"),
};

// 停止の求めはファイルの切れ目で届く (Importer と Traversal がイベントループに譲る)
port.on("message", (request: ImportWorkerRequest) => {
  importProgress.stop(request.reason);
});

// ロガーはモジュールを読み込むときに作られるので、黙らせてから読む
if (data.quiet) {
  silenceLoggers();
}
const { traversal } = await import("./Traversal");

try {
  openDb(data.file, { migrate: false });
  importProgress.attach(sink);
  await traversal.traverse(data.entry);
  post({ type: "done" });
} catch (e) {
  post({ type: "failed", message: e?.message ?? String(e) });
} finally {
  importProgress.detach();
  closeDb();
}
