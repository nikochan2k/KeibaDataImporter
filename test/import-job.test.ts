import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { ImportJobService } from "../src/app/api/ImportJobService";
import { ImportProgress } from "../src/app/ImportProgress";

let root: string;
let outside: string;
const saved = process.env.IMPORT_ROOT;

beforeAll(() => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "import-job-"));
  root = path.join(base, "root");
  outside = path.join(base, "outside");
  fs.mkdirSync(path.join(root, "data"), { recursive: true });
  fs.mkdirSync(outside);
  process.env.IMPORT_ROOT = root;
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
function create(traverse: (entry: string, progress: ImportProgress) => Promise<void>) {
  const progress = new ImportProgress();
  const service = new ImportJobService();
  Object.assign(service, {
    progress,
    traversal: { traverse: (entry: string) => traverse(entry, progress) },
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
      progress.fileStarted("a.txt");
      progress.fileFinished("a.txt");
      progress.fileStarted("b.txt");
      progress.fileFailed("b.txt", "壊れています");
    });
    const job = service.start("data");
    const done = await finished(service, job.id);
    expect(done.status).toBe("completed");
    expect(done.path).toBe("data");
    expect(done.filesDone).toBe(2);
    expect(done.errors).toEqual([{ file: "b.txt", message: "壊れています" }]);
    expect(done.currentFile).toBeUndefined();
    expect(done.finishedAt).toBeDefined();
  });

  test("走っている間は次のジョブを始められない", async () => {
    let release: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const service = create(() => gate);
    const job = service.start("data");
    expect(() => service.start("data")).toThrow(ConflictException);
    release();
    await finished(service, job.id);
    const next = service.start("data");
    expect((await finished(service, next.id)).status).toBe("completed");
  });

  test("途中で失敗したジョブは failed になり、次のジョブを始められる", async () => {
    const service = create(async () => {
      throw new Error("読めません");
    });
    const job = service.start("data");
    const done = await finished(service, job.id);
    expect(done.status).toBe("failed");
    expect(done.error).toBe("読めません");
    expect(() => service.start("data")).not.toThrow();
  });

  test("進捗の受け取り先は、ジョブが終わると外れる", async () => {
    const service = create(async () => {});
    const job = service.start("data");
    await finished(service, job.id);
    const progress: ImportProgress = Reflect.get(service, "progress");
    progress.fileFinished("late.txt");
    expect(service.get(job.id).filesDone).toBe(0);
  });

  test("IMPORT_ROOT の外と、存在しないパスは受け付けない", () => {
    const service = create(async () => {});
    expect(() => service.start("../outside")).toThrow(BadRequestException);
    expect(() => service.start(outside)).toThrow(BadRequestException);
    expect(() => service.start("nope")).toThrow(BadRequestException);
    expect(() => service.start("")).toThrow(BadRequestException);
    expect(() => service.start(undefined)).toThrow(BadRequestException);
    expect(() => service.start(123)).toThrow(BadRequestException);
  });

  test("シンボリックリンクで IMPORT_ROOT の外へ出られない", () => {
    fs.symlinkSync(outside, path.join(root, "escape"));
    const service = create(async () => {});
    expect(() => service.start("escape")).toThrow(BadRequestException);
  });

  test("IMPORT_ROOT 配下の絶対パスは受け付ける", async () => {
    const service = create(async () => {});
    const job = service.start(path.join(root, "data"));
    expect(job.path).toBe("data");
    await finished(service, job.id);
  });

  test("存在しないジョブは NotFound", () => {
    expect(() => create(async () => {}).get("xxx")).toThrow(NotFoundException);
  });
});
