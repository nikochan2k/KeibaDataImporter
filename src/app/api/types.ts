// 取り込み API が返す JSON の型。フロントエンドからも読み込むので、他のモジュールに依存させない。

export type ImportJobStatus = "running" | "completed" | "failed";

export interface ImportJob {
  id: string;
  /** 取り込み対象(IMPORT_ROOT からの相対パス) */
  path: string;
  status: ImportJobStatus;
  startedAt: string;
  finishedAt?: string;
  currentFile?: string;
  filesDone: number;
  errors: { file: string; message: string }[];
  /** ジョブ自体が失敗したときの理由 */
  error?: string;
}
