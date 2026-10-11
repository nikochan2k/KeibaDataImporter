import { BadRequestException, Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { BrowseService } from "./BrowseService";

/** パスやクエリの整数を読む。不正なら 400 */
function toInt(text: unknown, name: string, min = 1, max = Number.MAX_SAFE_INTEGER) {
  const n = typeof text === "string" && /^\d+$/.test(text) ? Number(text) : Number.NaN;
  if (!Number.isSafeInteger(n) || n < min || max < n) {
    throw new BadRequestException(`${name} が正しくありません`);
  }
  return n;
}

@Controller("api")
export class BrowseController {
  @Inject()
  private browse: BrowseService;

  /** レースのある年月 */
  @Get("race-months")
  public raceMonths() {
    return this.browse.raceMonths();
  }

  /** 指定した月の、開催のある日と競馬場 */
  @Get("race-days")
  public raceDays(@Query("year") year: string, @Query("month") month: string) {
    return this.browse.raceDays(toInt(year, "year", 1900, 2999), toInt(month, "month", 1, 12));
  }

  /** 指定した日 (YYYY-MM-DD) のレース一覧。basho があればその競馬場だけ */
  @Get("races")
  public races(@Query("date") date?: string, @Query("basho") basho?: string) {
    const [year, month, day] = BrowseService.parseDate(date);
    return this.browse.racesOn(
      year,
      month,
      day,
      basho === undefined ? undefined : toInt(basho, "basho"),
    );
  }

  @Get("races/:id")
  public race(@Param("id") id: string) {
    return this.browse.race(toInt(id, "id"));
  }

  @Get("umas")
  public searchUma(@Query("q") q: string) {
    const query = typeof q === "string" ? q.trim() : "";
    if (query === "") {
      throw new BadRequestException("q は必須です");
    }
    return this.browse.searchUma(query);
  }

  @Get("umas/:id")
  public uma(@Param("id") id: string) {
    return this.browse.uma(toInt(id, "id"));
  }
}
