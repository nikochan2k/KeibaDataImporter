import * as fs from "node:fs";
import * as path from "node:path";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { NextFunction, Request, Response } from "express";
import { getLogger } from "./LogUtil";

const logger = getLogger("serveWeb");

/** ビルド済みフロントエンド (bun run web:build の出力先)。環境変数 WEB_DIR で変える */
const DEFAULT_WEB_DIR = path.resolve(import.meta.dirname, "../../web/dist");

/**
 * フロントエンドを静的配信する。
 * /api 以外の GET で、ファイルが見つからないものには index.html を返す(画面遷移用)。
 * ビルドされていなければ何もしない。
 */
export function serveWeb(
  app: NestExpressApplication,
  dir = process.env.WEB_DIR || DEFAULT_WEB_DIR,
) {
  const index = path.join(dir, "index.html");
  if (!fs.existsSync(index)) {
    logger.warn(`${dir} がありません。bun run web:build でフロントエンドをビルドしてください`);
    return false;
  }
  // biome-ignore lint/correctness/useHookAtTopLevel: Nest の静的配信の設定で、React のフックではない
  app.useStaticAssets(dir);
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" || req.path.startsWith("/api/") || path.extname(req.path) !== "") {
      next();
      return;
    }
    res.sendFile(index);
  });
  return true;
}
