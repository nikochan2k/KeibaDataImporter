import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { ImportJobService } from "../src/app/api/ImportJobService";
import { ImportProgress } from "../src/app/ImportProgress";

let root: string;
let data: string;
let outside: string;
const saved = process.env.IMPORT_ROOT;
const seisekiJrdb = { source: "JRDB", kind: "成績データ" };
const umaKol = { source: "KOL", kind: "競走馬データ" };

beforeAll(() => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "import-job-"));
  root = path.join(base, "root");
  outside = path.join(base, "outside");
  fs.mkdirSync(path.join(root, "data"), { recursive: true });
  fs.mkdirSync(outside);
  process.env.IMPORT_ROOT = root;
  data = path.join(fs.realpathSync(root), "data");
});

afterAll(() => {
  if (saved === undefined) {
    delete process.env.IMPORT_ROOT;
  } else {
    process.env.IMPORT_ROOT = saved;
  }
  fs.rmSync(path.dirname(root), { recursive: true, force: true });
});

/** traverse の中身を差し替えられる ImportJobService を作る */
function create(traverse: (entry: string, progress: ImportProgress) => Promise<void>, total = 0) {
  const progress = new ImportProgress();
  const service = new ImportJobService();
  Object.assign(service, {
    progress,
    traversal: {
      countFiles: async () => total,
      traverse: (entry: string) => traverse(entry, progress),
    },
  });
  return service;
}

/** ジョブが走り終わるのを待つ */
async function finished(service: ImportJobService, id: string) {
  while (service.get(id).status === "running") {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  return service.get(id);
}

describe("ImportJobService", () => {
  test("取り込みの進捗がジョブに反映される", async () => {
    const service = create(async (_entry, progress) => {
      progress.fileStarted("a.txt", umaKol);
      progress.fileFinished("a.txt", umaKol);
      progress.fileStarted("b.txt", seisekiJrdb);
      progress.fileFailed("b.txt", "壊れています", seisekiJrdb);
    });
    const job = service.start(data);
    const done = await finished(service, job.id);
    expect(done.status).toBe("completed");
    expect(done.path).toBe(data);
    expect(done.filesDone).toBe(2);
    expect(done.errors).toEqual([{ file: "b.txt", message: "壊れています", ...seisekiJrdb }]);
    expect(done.currentFile).toBeUndefined();
    expect(done.current).toBeUndefined();
    expect(done.finishedAt).toBeDefined();
  });

  test("総ファイル数は数え終わるまで未定で、処理済みファイル数が進む", async () => {
    let release: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const service = create(async (_entry, progress) => {
      progress.entryProcessed("a.lzh");
      await gate;
      progress.entryProcessed("b.lzh");
    }, 3);
    const job = service.start(data);
    expect(job.totalFiles).toBeUndefined();
    expect(job.processedFiles).toBe(0);
    while (service.get(job.id).processedFiles < 1) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    expect(service.get(job.id).totalFiles).toBe(3);
    release();
    const done = await finished(service, job.id);
    expect(done.totalFiles).toBe(3);
    expect(done.processedFiles).toBe(2);
  });

  test("取り込み中は、いま何を取り込んでいるかが残る", async () => {
    let release: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const service = create(async (_entry, progress) => {
      progress.fileStarted("sed260101.txt", seisekiJrdb);
      await gate;
    });
    const job = service.start(data);
    while (!service.get(job.id).current) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    expect(service.get(job.id).current).toEqual(seisekiJrdb);
    release();
    expect((await finished(service, job.id)).current).toBeUndefined();
  });

  test("エラーが一定数に達したら取り込みを止める", async () => {
    const saved = process.env.IMPORT_MAX_ERRORS;
    process.env.IMPORT_MAX_ERRORS = "3";
    try {
      let reached = 0;
      const service = create(async (_entry, progress) => {
        for (let i = 0; i < 10 && !progress.stopReason; i++) {
          progress.fileFailed(`x${i}.txt`, "壊れています", umaKol);
          reached++;
        }
      });
      const job = service.start(data);
      const done = await finished(service, job.id);
      expect(reached).toBe(3);
      expect(done.status).toBe("failed");
      expect(done.errors).toHaveLength(3);
      expect(done.error).toContain("3 件");
    } finally {
      if (saved === undefined) {
        delete process.env.IMPORT_MAX_ERRORS;
      } else {
        process.env.IMPORT_MAX_ERRORS = saved;
      }
    }
  });

  test("zip / lzh を開けない失敗は、データ区分なしのエラーとして残る", async () => {
    const service = create(async (_entry, progress) => {
      progress.fileFailed("broken.lzh", "壊れています");
    });
    const job = service.start(data);
    const done = await finished(service, job.id);
    expect(done.status).toBe("completed");
    expect(done.filesDone).toBe(0);
    expect(done.errors).toEqual([{ file: "broken.lzh", message: "壊れています" }]);
  });

  test("読み飛ばしたファイルがジョブに残る", async () => {
    const service = create(async (_entry, progress) => {
      for (let i = 0; i < 150; i++) {
        progress.fileSkipped(`x${i}.txt`, "対象外");
      }
    });
    const job = service.start(data);
    const done = await finished(service, job.id);
    expect(done.status).toBe("completed");
    expect(done.filesDone).toBe(0);
    expect(done.skippedCount).toBe(150);
    expect(done.skipped).toHaveLength(100);
    expect(done.skipped[0]).toEqual({ file: "x0.txt", reason: "対象外" });
  });

  test("存在しない対象は失敗として残る", async () => {
    const service = create(async () => {
      throw new Error('"x"は見つかりません');
    });
    const job = service.start(data);
    expect((await finished(service, job.id)).error).toBe('"x"は見つかりません');
  });

  test("取り込みログを続きから取れる", async () => {
    const service = create(async (_entry, progress) => {
      progress.fileStarted("a.txt", umaKol);
      progress.fileFailed("a.txt", "壊れています", umaKol);
    });
    const job = service.start(data);
    await finished(service, job.id);
    const all = service.logsOf(job.id, 0);
    expect(all.entries.map((e) => e.level)).toEqual(["info", "info", "info", "error", "info"]);
    expect(all.next).toBe(5);
    const rest = service.logsOf(job.id, 3);
    expect(rest.entries).toHaveLength(2);
    expect(rest.entries[0].message).toContain("壊れています");
    expect(service.logsOf(job.id, all.next).entries).toEqual([]);
    expect(() => service.logsOf("xxx", 0)).toThrow(NotFoundException);
  });

  test("走っている間は次のジョブを始められない", async () => {
    let release: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const service = create(() => gate);
    const job = service.start(data);
    expect(() => service.start(data)).toThrow(ConflictException);
    release();
    await finished(service, job.id);
    const next = service.start(data);
    expect((await finished(service, next.id)).status).toBe("completed");
  });

  test("途中で失敗したジョブは failed になり、次のジョブを始められる", async () => {
    const service = create(async () => {
      throw new Error("読めません");
    });
    const job = service.start(data);
    const done = await finished(service, job.id);
    expect(done.status).toBe("failed");
    expect(done.error).toBe("読めません");
    expect(() => service.start(data)).not.toThrow();
  });

  test("進捗の受け取り先は、ジョブが終わると外れる", async () => {
    const service = create(async () => {});
    const job = service.start(data);
    await finished(service, job.id);
    const progress: ImportProgress = Reflect.get(service, "progress");
    progress.fileFinished("late.txt", umaKol);
    expect(service.get(job.id).filesDone).toBe(0);
  });

  test("IMPORT_ROOT の外と、存在しないパスは受け付けない", () => {
    const service = create(async () => {});
    expect(() => service.start(path.join(root, "../outside"))).toThrow(BadRequestException);
    expect(() => service.start(outside)).toThrow(BadRequestException);
    expect(() => service.start(path.join(root, "nope"))).toThrow(BadRequestException);
    expect(() => service.start("")).toThrow(BadRequestException);
    expect(() => service.start(undefined)).toThrow(BadRequestException);
    expect(() => service.start(123)).toThrow(BadRequestException);
  });

  test("シンボリックリンクで IMPORT_ROOT の外へ出られない", () => {
    fs.symlinkSync(outside, path.join(root, "escape"));
    const service = create(async () => {});
    expect(() => service.start(path.join(root, "escape"))).toThrow(BadRequestException);
  });

  test("相対パスは受け付けない", () => {
    const service = create(async () => {});
    expect(() => service.start("data")).toThrow(BadRequestException);
    expect(() => service.start("./data")).toThrow(BadRequestException);
  });

  test("IMPORT_ROOT 配下の絶対パスは受け付ける", async () => {
    const service = create(async () => {});
    const job = service.start(path.join(root, "data"));
    expect(job.path).toBe(data);
    await finished(service, job.id);
  });

  test("存在しないジョブは NotFound", () => {
    expect(() => create(async () => {}).get("xxx")).toThrow(NotFoundException);
  });
});

describe("IMPORT_ROOT 未設定", () => {
  test("どこの絶対パスでも受け付ける", async () => {
    delete process.env.IMPORT_ROOT;
    try {
      const service = create(async () => {});
      const job = service.start(outside);
      expect(job.path).toBe(fs.realpathSync(outside));
      await finished(service, job.id);
    } finally {
      process.env.IMPORT_ROOT = root;
    }
  });
});
