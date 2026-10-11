import { Elysia } from "elysia";
import { importJobService } from "../api/ImportJobService";
import { assertLocal } from "./localOnly";

export const importRoutes = new Elysia({ prefix: "/api/imports" })
  .onBeforeHandle(({ server, request }) => {
    assertLocal(server?.requestIP(request)?.address, request.headers.get("host") ?? undefined);
  })
  /** 取り込みジョブを開始する。IMPORT_ROOT 配下の絶対パスを渡す */
  .post("/", ({ body, set }) => {
    set.status = 202;
    return importJobService.start((body as { path?: unknown } | undefined)?.path);
  })
  .get("/", () => importJobService.list())
  /** 取り込みログを from 番目から返す */
  .get("/:id/logs", ({ params, query }) => {
    const start = Number(query.from ?? 0);
    return importJobService.logsOf(params.id, Number.isInteger(start) && start > 0 ? start : 0);
  })
  .get("/:id", ({ params }) => importJobService.get(params.id));
