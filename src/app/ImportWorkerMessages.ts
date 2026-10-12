import type { ImportProgressSink } from "./ImportProgress";

/** ワーカーへ渡す起動時の設定 */
export interface ImportWorkerData {
  /** 開くデータベースのファイル (マイグレーションは呼び出し側が済ませている) */
  file: string;
  /** 取り込む対象のパス */
  entry: string;
  /** ロガーを黙らせるか */
  quiet: boolean;
}

/** メインスレッドからワーカーへ */
export type ImportWorkerRequest = { type: "stop"; reason: string };

/** ImportProgressSink のどのメソッドを、どの引数で呼んだか */
export type ProgressCall = {
  [K in keyof ImportProgressSink]: { method: K; args: Parameters<ImportProgressSink[K]> };
}[keyof ImportProgressSink];

/** ワーカーからメインスレッドへ */
export type ImportWorkerEvent =
  | ({ type: "progress" } & ProgressCall)
  | { type: "done" }
  | { type: "failed"; message: string };
