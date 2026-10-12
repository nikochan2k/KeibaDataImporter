import { Elysia } from "elysia";
import { getBanushi, searchBanushi } from "../browse/banushi";
import { parseDate, raceDays, raceMonths, racesOn } from "../browse/calendar";
import { getChoukyoushi, searchChoukyoushi } from "../browse/choukyoushi";
import { getKishu, searchKishu } from "../browse/kishu";
import { racePreview, shussoubaPreview } from "../browse/preview";
import { getRace } from "../browse/race";
import { getUma, searchUma } from "../browse/uma";
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
  .get("/race-months", () => raceMonths())
  /** 指定した月の、開催のある日と競馬場 */
  .get("/race-days", ({ query }) =>
    raceDays(toInt(query.year, "year", 1900, 2999), toInt(query.month, "month", 1, 12)),
  )
  /** 指定した日 (YYYY-MM-DD) のレース一覧。basho があればその競馬場だけ */
  .get("/races", ({ query }) => {
    const [year, month, day] = parseDate(query.date);
    return racesOn(
      year,
      month,
      day,
      query.basho === undefined ? undefined : toInt(query.basho, "basho", 0),
    );
  })
  .get("/races/:id", ({ params }) => getRace(toInt(params.id, "id")))
  .get("/races/:id/preview", ({ params }) => racePreview(toInt(params.id, "id")))
  .get("/shussouba/:id/preview", ({ params }) => shussoubaPreview(toInt(params.id, "id")))
  .get("/umas", ({ query }) => {
    const q = typeof query.q === "string" ? query.q.trim() : "";
    if (q === "") {
      throw new BadRequestError("q は必須です");
    }
    return searchUma(q);
  })
  .get("/umas/:id", ({ params }) => getUma(toInt(params.id, "id")))
  .get("/kishus", ({ query }) => {
    const q = typeof query.q === "string" ? query.q.trim() : "";
    if (q === "") {
      throw new BadRequestError("q は必須です");
    }
    return searchKishu(q);
  })
  .get("/kishus/:id", ({ params, query }) =>
    getKishu(toInt(params.id, "id"), query.page === undefined ? 1 : toInt(query.page, "page")),
  )
  .get("/choukyoushis", ({ query }) => {
    const q = typeof query.q === "string" ? query.q.trim() : "";
    if (q === "") {
      throw new BadRequestError("q は必須です");
    }
    return searchChoukyoushi(q);
  })
  .get("/choukyoushis/:id", ({ params, query }) =>
    getChoukyoushi(
      toInt(params.id, "id"),
      query.page === undefined ? 1 : toInt(query.page, "page"),
    ),
  )
  .get("/banushis", ({ query }) => {
    const q = typeof query.q === "string" ? query.q.trim() : "";
    if (q === "") {
      throw new BadRequestError("q は必須です");
    }
    return searchBanushi(q);
  })
  .get("/banushis/:id", ({ params, query }) =>
    getBanushi(toInt(params.id, "id"), query.page === undefined ? 1 : toInt(query.page, "page")),
  );
