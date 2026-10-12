/**
 * サーバーを単一の実行ファイルにする (bun build --compile)。
 *
 *   bun scripts/build-executable.ts [--target=bun-linux-x64] [--outfile=dist/keiba-data-importer]
 *
 * 先にフロントエンドを web/dist へビルドする。実行ファイルは web/dist を埋め込まず、
 * 実行ファイルの隣の web/dist を配信する (WEB_DIR で変えられる)。
 */
import * as fs from "node:fs";
import * as path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

const target = option("target");
const outfile = path.resolve(
  root,
  option("outfile") ?? `dist/keiba-data-importer${target?.includes("windows") ? ".exe" : ""}`,
);

function run(cmd: string[]) {
  const result = Bun.spawnSync(cmd, { cwd: root, stdout: "inherit", stderr: "inherit" });
  if (result.exitCode !== 0) {
    process.exit(result.exitCode ?? 1);
  }
}

run(["bun", "run", "build"]);

fs.mkdirSync(path.dirname(outfile), { recursive: true });
run([
  "bun",
  "build",
  "--compile",
  ...(target ? [`--target=${target}`] : []),
  // unzipper が S3 読み込み用に任意で require する。使わないので外す
  "--external",
  "@aws-sdk/client-s3",
  "src/app/server.ts",
  "src/app/ImportWorker.ts",
  "--outfile",
  outfile,
]);

// フロントエンドは実行ファイルの隣に置く
const webDist = path.join(path.dirname(outfile), "web", "dist");
fs.rmSync(webDist, { recursive: true, force: true });
fs.cpSync(path.join(root, "web", "dist"), webDist, { recursive: true });

console.log(`作成: ${outfile}`);
