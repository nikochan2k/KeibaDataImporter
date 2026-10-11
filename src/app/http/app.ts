import * as fs from "node:fs";
import * as path from "node:path";
import { Elysia } from "elysia";
import { getLogger } from "../LogUtil";
import { browseRoutes } from "./browseRoutes";
import { HttpError, NotFoundError } from "./errors";
import { importRoutes } from "./importRoutes";

const logger = getLogger("http");

/** ビルド済みフロントエンド (bun run web:build の出力先)。環境変数 WEB_DIR で変える */
const DEFAULT_WEB_DIR = path.resolve(import.meta.dirname, "../../../web/dist");

/**
 * フロントエンドを静的配信する。
 * /api 以外の GET で、ファイルが見つからず拡張子もないものには index.html を返す(画面遷移用)。
 * ビルドされていなければ何もしない。
 */
function webRoutes(dir: string) {
  const index = path.join(dir, "index.html");
  if (!fs.existsSync(index)) {
    logger.warn(`${dir} がありません。bun run web:build でフロントエンドをビルドしてください`);
    return new Elysia();
  }
  return new Elysia().get("/*", ({ path: requested }) => {
    if (requested.startsWith("/api/")) {
      throw new NotFoundError(`${requested} はありません`);
    }
    const file = path.join(dir, path.normalize(decodeURIComponent(requested)));
    if (file.startsWith(dir + path.sep) && fs.statSync(file, { throwIfNoEntry: false })?.isFile()) {
      return Bun.file(file);
    }
    if (path.extname(requested) !== "") {
      throw new NotFoundError(`${requested} はありません`);
    }
    return Bun.file(index);
  });
}

/** API と画面をまとめたアプリ。テストからは app.handle(request) で呼ぶ */
export function createApp(webDir = process.env.WEB_DIR || DEFAULT_WEB_DIR) {
  return new Elysia()
    .onError(({ error, code, set }) => {
      if (error instanceof HttpError) {
        set.status = error.status;
        return { message: error.message };
      }
      if (code === "NOT_FOUND") {
        set.status = 404;
        return { message: "見つかりません" };
      }
      if (code === "PARSE" || code === "VALIDATION") {
        set.status = 400;
        return { message: "リクエストが正しくありません" };
      }
      logger.error(error);
      set.status = 500;
      return { message: "サーバーでエラーが発生しました" };
    })
    .use(importRoutes)
    .use(browseRoutes)
    .use(webRoutes(path.resolve(webDir)));
}
