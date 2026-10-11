import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { BadRequestError, ConflictError, NotFoundError } from "../http/errors";
import { type ImportProgress, type ImportProgressSink, importProgress } from "../ImportProgress";
import { getLogger } from "../LogUtil";
import { traversal as defaultTraversal, type Traversal } from "../Traversal";
import type {
  ImportJob,
  ImportLogEntry,
  ImportLogLevel,
  ImportLogPage,
  ImportTarget,
} from "./types";

/** 読み飛ばしたファイルは、ジョブごとにこれだけ覚えておく */
const MAX_SKIPPED = 100;

/** ジョブごとに覚えておくログの行数。あふれたら古い行から捨てる */
const MAX_LOGS = 1000;

/** 古いジョブは捨てる。直近これだけを覚えておく */
const MAX_JOBS = 50;

/** エラーがこの件数に達したら、取り込みを止める。環境変数 IMPORT_MAX_ERRORS で変えられる */
const DEFAULT_MAX_ERRORS = 20;

function maxErrors() {
  const value = Number(process.env.IMPORT_MAX_ERRORS);
  return Number.isInteger(value) && value > 0 ? value : DEFAULT_MAX_ERRORS;
}

function describe(target: ImportTarget) {
  return `${target.source} ${target.kind}`;
}

/**
 * 取り込みジョブを管理する。
 * Bridge などの状態が共有されていて、SQLite の書き込みも一本なので、同時に走らせるのはひとつだけ。
 */
export class ImportJobService {
  private logger = getLogger(this);

  private jobs = new Map<string, ImportJob>();

  private running?: ImportJob;

  /** ジョブごとのログ。dropped は捨てた行数で、行の通し番号はその続きから数える */
  private logs = new Map<string, { dropped: number; entries: ImportLogEntry[] }>();

  /** テストでは取り込み処理と進捗を差し替える */
  constructor(
    private traversal: Pick<Traversal, "countFiles" | "traverse"> = defaultTraversal,
    private progress: ImportProgress = importProgress,
  ) {}

  /** 取り込みを許す最上位のディレクトリ。環境変数 IMPORT_ROOT で決める。未設定なら制限しない */
  public get root() {
    const root = process.env.IMPORT_ROOT;
    return root ? fs.realpathSync(root) : undefined;
  }

  /** ジョブを開始して、すぐ返す。取り込みはバックグラウンドで進む */
  public start(requested: unknown): ImportJob {
    if (typeof requested !== "string" || requested.trim() === "") {
      throw new BadRequestError("path は必須です");
    }
    const target = this.resolve(requested);
    if (this.running) {
      throw new ConflictError(`取り込み中です (job: ${this.running.id})`);
    }

    const job: ImportJob = {
      id: randomUUID(),
      path: target,
      status: "running",
      startedAt: new Date().toISOString(),
      processedFiles: 0,
      filesDone: 0,
      errors: [],
      skipped: [],
      skippedCount: 0,
    };
    this.running = job;
    this.jobs.set(job.id, job);
    this.logs.set(job.id, { dropped: 0, entries: [] });
    this.log(job, "info", `取り込みを開始します: ${target}`);
    this.trim();
    void this.run(job, target);
    return job;
  }

  public list(): ImportJob[] {
    return [...this.jobs.values()].reverse();
  }

  public get(id: string): ImportJob {
    const job = this.jobs.get(id);
    if (!job) {
      throw new NotFoundError(`ジョブが見つかりません: ${id}`);
    }
    return job;
  }

  /** from 番目以降のログを返す。捨てられた行は飛ばす */
  public logsOf(id: string, from: number): ImportLogPage {
    this.get(id);
    const buffer = this.logs.get(id) ?? { dropped: 0, entries: [] };
    const start = Math.max(from, buffer.dropped);
    return {
      entries: buffer.entries.slice(start - buffer.dropped),
      next: buffer.dropped + buffer.entries.length,
    };
  }

  private log(job: ImportJob, level: ImportLogLevel, message: string) {
    const buffer = this.logs.get(job.id);
    if (!buffer) {
      return;
    }
    buffer.entries.push({ at: new Date().toISOString(), level, message });
    if (buffer.entries.length > MAX_LOGS) {
      buffer.entries.shift();
      buffer.dropped++;
    }
  }

  /** 絶対パスだけを受け付ける。存在しないパスや、IMPORT_ROOT が設定されていればその外も受け付けない */
  private resolve(requested: string) {
    if (!path.isAbsolute(requested)) {
      throw new BadRequestError(`"${requested}" は絶対パスで指定してください`);
    }
    let target: string;
    try {
      target = fs.realpathSync(requested);
    } catch {
      throw new BadRequestError(`"${requested}" が見つかりません`);
    }
    const root = this.root;
    if (root) {
      const relative = path.relative(root, target);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new BadRequestError(`"${requested}" は取り込み対象の範囲外です (${root} の配下のみ)`);
      }
    }
    return target;
  }

  private async run(job: ImportJob, target: string) {
    const limit = maxErrors();
    const sink: ImportProgressSink = {
      fileStarted: (basename, current) => {
        job.current = current;
        this.log(job, "info", `${describe(current)} を取り込んでいます (${basename})`);
      },
      fileFinished: (basename, current) => {
        job.filesDone++;
        this.log(job, "info", `${describe(current)} を取り込みました (${basename})`);
      },
      fileFailed: (file, message, current) => {
        if (current) {
          job.filesDone++;
        }
        job.errors.push({ file, entry: job.currentEntry, message, ...current });
        this.log(
          job,
          "error",
          `${current ? describe(current) : file} の取り込みに失敗しました (${file}): ${message}`,
        );
        if (job.errors.length >= limit) {
          this.progress.stop(`エラーが ${limit} 件に達したため、取り込みを止めました`);
        }
      },
      fileSkipped: (file, reason) => {
        job.skippedCount++;
        if (job.skipped.length < MAX_SKIPPED) {
          job.skipped.push({ file, reason });
          this.log(job, "warn", `${file} を読み飛ばしました: ${reason}`);
        }
      },
      entryStarted: (basename) => {
        job.currentEntry = basename;
      },
      entryProcessed: () => {
        job.processedFiles++;
      },
    };
    this.progress.attach(sink);
    try {
      job.totalFiles = await this.traversal.countFiles(target);
      this.log(job, "info", `取り込むファイルは ${job.totalFiles} 個です`);
      await this.traversal.traverse(target);
      if (this.progress.stopReason) {
        job.status = "failed";
        job.error = this.progress.stopReason;
        this.log(job, "error", job.error);
      } else {
        job.status = "completed";
        this.log(
          job,
          "info",
          `取り込みが終わりました (${job.filesDone} ファイル、エラー ${job.errors.length}、読み飛ばし ${job.skippedCount})`,
        );
      }
    } catch (e) {
      this.logger.error(e.stack || e);
      job.status = "failed";
      job.error = e?.message ?? String(e);
      this.log(job, "error", `取り込みに失敗しました: ${job.error}`);
    } finally {
      this.progress.detach();
      delete job.currentEntry;
      delete job.current;
      job.finishedAt = new Date().toISOString();
      this.running = undefined;
    }
  }

  private trim() {
    for (const id of this.jobs.keys()) {
      if (this.jobs.size <= MAX_JOBS) {
        break;
      }
      if (this.jobs.get(id) !== this.running) {
        this.jobs.delete(id);
        this.logs.delete(id);
      }
    }
  }
}

export const importJobService = new ImportJobService();
