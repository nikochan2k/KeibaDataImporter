import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ImportProgress, type ImportProgressSink } from "../ImportProgress";
import { getLogger } from "../LogUtil";
import { Traversal } from "../Traversal";

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

/** 古いジョブは捨てる。直近これだけを覚えておく */
const MAX_JOBS = 50;

/**
 * 取り込みジョブを管理する。
 * Bridge などの状態が共有されていて、SQLite の書き込みも一本なので、同時に走らせるのはひとつだけ。
 */
@Injectable()
export class ImportJobService {
  private logger = getLogger(this);

  private jobs = new Map<string, ImportJob>();

  private running?: ImportJob;

  @Inject()
  private traversal: Traversal;

  @Inject()
  private progress: ImportProgress;

  /** 取り込みを許す最上位のディレクトリ。環境変数 IMPORT_ROOT で変える */
  public get root() {
    return fs.realpathSync(process.env.IMPORT_ROOT || process.cwd());
  }

  /** ジョブを開始して、すぐ返す。取り込みはバックグラウンドで進む */
  public start(requested: unknown): ImportJob {
    if (typeof requested !== "string" || requested.trim() === "") {
      throw new BadRequestException("path は必須です");
    }
    const target = this.resolve(requested);
    if (this.running) {
      throw new ConflictException(`取り込み中です (job: ${this.running.id})`);
    }

    const job: ImportJob = {
      id: randomUUID(),
      path: path.relative(this.root, target) || ".",
      status: "running",
      startedAt: new Date().toISOString(),
      filesDone: 0,
      errors: [],
    };
    this.running = job;
    this.jobs.set(job.id, job);
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
      throw new NotFoundException(`ジョブが見つかりません: ${id}`);
    }
    return job;
  }

  /** IMPORT_ROOT の外や、存在しないパスは受け付けない */
  private resolve(requested: string) {
    const root = this.root;
    let target: string;
    try {
      target = fs.realpathSync(path.resolve(root, requested));
    } catch {
      throw new BadRequestException(`"${requested}" が見つかりません`);
    }
    const relative = path.relative(root, target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new BadRequestException(`"${requested}" は取り込み対象の範囲外です`);
    }
    return target;
  }

  private async run(job: ImportJob, target: string) {
    const sink: ImportProgressSink = {
      fileStarted: (basename) => {
        job.currentFile = basename;
      },
      fileFinished: () => {
        job.filesDone++;
      },
      fileFailed: (file, message) => {
        job.filesDone++;
        job.errors.push({ file, message });
      },
    };
    this.progress.attach(sink);
    try {
      await this.traversal.traverse(target);
      job.status = "completed";
    } catch (e) {
      this.logger.error(e.stack || e);
      job.status = "failed";
      job.error = e?.message ?? String(e);
    } finally {
      this.progress.detach();
      delete job.currentFile;
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
      }
    }
  }
}
