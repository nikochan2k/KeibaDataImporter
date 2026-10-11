// 取り込み API が返す JSON の型。フロントエンドからも読み込むので、他のモジュールに依存させない。

export type ImportJobStatus = "running" | "completed" | "failed";

/** 取り込んでいるデータが何か。ファイル名では利用者に分からないので、区分と種類で示す */
export interface ImportTarget {
  /** データの提供元 (JRDB、KOL、JRA-VAN など) */
  source: string;
  /** データの種類 (成績、競走馬データなど) */
  kind: string;
}

export interface ImportJob {
  id: string;
  /** 取り込み対象(絶対パス) */
  path: string;
  status: ImportJobStatus;
  startedAt: string;
  finishedAt?: string;
  currentFile?: string;
  /** いま取り込んでいるデータ */
  current?: ImportTarget;
  /** 取り込むファイルの総数 (zip / lzh / 単独のデータファイル)。数え終わるまでは未定 */
  totalFiles?: number;
  /** 取り込みを終えたファイル数。totalFiles と同じ単位 */
  processedFiles: number;
  /** 取り込めたデータファイル数 (zip / lzh の中身を数える) */
  filesDone: number;
  errors: ImportError[];
  /** 取り込み対象と判断できず、読まなかったファイル(先頭の一部だけ)。総数は skippedCount */
  skipped: { file: string; reason: string }[];
  skippedCount: number;
  /** ジョブ自体が失敗したときの理由。エラーが多すぎて止めたときもここに入る */
  error?: string;
}

export interface ImportError extends Partial<ImportTarget> {
  file: string;
  message: string;
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
