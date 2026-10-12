import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { ImportJobService } from "../src/app/api/ImportJobService";
import { closeDb, openDb, readDb } from "../src/app/db/db";
import { base, record } from "./helpers";

let dir: string;
const saved = process.env.IMPORT_ROOT;

beforeAll(() => {
  delete process.env.IMPORT_ROOT;
  dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "import-worker-")));
  fs.mkdirSync(path.join(dir, "data"));
  fs.writeFileSync(path.join(dir, "data", "SED240407.txt"), record(base, 376));
  fs.writeFileSync(path.join(dir, "data", "memo.csv"), "対象外");
  openDb(path.join(dir, "keiba.sqlite"));
});

afterAll(() => {
  closeDb();
  if (saved !== undefined) {
    process.env.IMPORT_ROOT = saved;
  }
  fs.rmSync(dir, { recursive: true, force: true });
});

async function finished(service: ImportJobService, id: string) {
  while (service.get(id).status === "running") {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  return service.get(id);
}

describe("ワーカーでの取り込み", () => {
  test("ワーカーが書いた行が、メインスレッドの閲覧用の接続から見える", async () => {
    const service = new ImportJobService();
    const job = service.start(path.join(dir, "data"));
    const done = await finished(service, job.id);
    expect(done.error).toBeUndefined();
    expect(done.status).toBe("completed");
    expect(done.filesDone).toBe(1);
    expect(done.skippedCount).toBe(1);
    const row = readDb().query("SELECT count(*) AS n FROM Shussouba").get() as { n: number };
    expect(row.n).toBeGreaterThan(0);
  });
});
