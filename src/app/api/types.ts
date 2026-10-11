// 取り込み API が返す JSON の型。フロントエンドからも読み込むので、他のモジュールに依存させない。

export type ImportJobStatus = "running" | "completed" | "failed";

export interface ImportJob {
  id: string;
  /** 取り込み対象(絶対パス) */
  path: string;
  status: ImportJobStatus;
  startedAt: string;
  finishedAt?: string;
  currentFile?: string;
  filesDone: number;
  errors: { file: string; message: string }[];
  /** 取り込み対象と判断できず、読まなかったファイル(先頭の一部だけ)。総数は skippedCount */
  skipped: { file: string; reason: string }[];
  skippedCount: number;
  /** ジョブ自体が失敗したときの理由 */
  error?: string;
}

export type ImportLogLevel = "info" | "warn" | "error";

export interface ImportLogEntry {
  at: string;
  level: ImportLogLevel;
  message: string;
}

/** 取り込みログの続き。次に読むときは from に next を渡す */
export interface ImportLogPage {
  entries: ImportLogEntry[];
  next: number;
}
