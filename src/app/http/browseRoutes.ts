import { Elysia } from "elysia";
import { BrowseService, browseService } from "../browse/BrowseService";
import { BadRequestError } from "./errors";

/** パスやクエリの整数を読む。不正なら 400 */
function toInt(text: unknown, name: string, min = 1, max = Number.MAX_SAFE_INTEGER) {
  const n = typeof text === "string" && /^\d+$/.test(text) ? Number(text) : Number.NaN;
  if (!Number.isSafeInteger(n) || n < min || max < n) {
    throw new BadRequestError(`${name} が正しくありません`);
  }
  return n;
}

export const browseRoutes = new Elysia({ prefix: "/api" })
  /** レースのある年月 */
  .get("/race-months", () => browseService.raceMonths())
  /** 指定した月の、開催のある日と競馬場 */
  .get("/race-days", ({ query }) =>
    browseService.raceDays(
      toInt(query.year, "year", 1900, 2999),
      toInt(query.month, "month", 1, 12),
    ),
  )
  /** 指定した日 (YYYY-MM-DD) のレース一覧。basho があればその競馬場だけ */
  .get("/races", ({ query }) => {
    const [year, month, day] = BrowseService.parseDate(query.date);
    return browseService.racesOn(
      year,
      month,
      day,
      query.basho === undefined ? undefined : toInt(query.basho, "basho"),
    );
  })
  .get("/races/:id", ({ params }) => browseService.race(toInt(params.id, "id")))
  .get("/shussouba/:id/preview", ({ params }) =>
    browseService.shussoubaPreview(toInt(params.id, "id")),
  )
  .get("/umas", ({ query }) => {
    const q = typeof query.q === "string" ? query.q.trim() : "";
    if (q === "") {
      throw new BadRequestError("q は必須です");
    }
    return browseService.searchUma(q);
  })
  .get("/umas/:id", ({ params }) => browseService.uma(toInt(params.id, "id")));
