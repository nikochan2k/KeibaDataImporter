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

  /** 指定した月の、開催のある日 */
  @Get("race-dates")
  public raceDates(@Query("year") year: string, @Query("month") month: string) {
    return this.browse.raceDates(toInt(year, "year", 1900, 2999), toInt(month, "month", 1, 12));
  }

  /** レースのある年 */
  @Get("race-years")
  public raceYears() {
    return this.browse.raceYears();
  }

  /** 指定した年に、レースのある競馬場 */
  @Get("race-bashos")
  public raceBashos(@Query("year") year: string) {
    return this.browse.raceBashos(toInt(year, "year", 1900, 2999));
  }

  /** レース一覧。date (YYYY-MM-DD) か、year と basho のどちらかで絞る */
  @Get("races")
  public races(
    @Query("date") date?: string,
    @Query("year") year?: string,
    @Query("basho") basho?: string,
  ) {
    if (date !== undefined) {
      const [y, month, day] = BrowseService.parseDate(date);
      return this.browse.racesOn(y, month, day);
    }
    return this.browse.racesAt(toInt(year, "year", 1900, 2999), toInt(basho, "basho"));
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
