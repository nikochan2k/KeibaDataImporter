import { basho } from "../converters/Common";
import { BadRequestError } from "../http/errors";
import { label, RACE_COLUMNS, type RaceRow, select, toDate, toRaceSummary } from "./common";
import type { RaceDay, RaceMonth, RaceSummary } from "./types";

/** レースのある年月。新しい月が先 */
export function raceMonths(): RaceMonth[] {
  const rows: { Nen: number; Gatsu: number }[] = select(
    `SELECT DISTINCT K.Nen, K.Gatsu FROM Kaisai K
      WHERE EXISTS (SELECT 1 FROM Race R WHERE R.KaisaiId = K.Id) ORDER BY K.Nen DESC, K.Gatsu DESC`,
  );
  return rows.map((row) => ({ year: row.Nen, month: row.Gatsu }));
}

/** 指定した月の、開催のある日と、その日に開催のある競馬場 */
export function raceDays(year: number, month: number): RaceDay[] {
  const rows: { Nichi: number; Basho: number }[] = select(
    `SELECT DISTINCT K.Nichi, K.Basho FROM Kaisai K
      WHERE K.Nen = ? AND K.Gatsu = ? AND EXISTS (SELECT 1 FROM Race R WHERE R.KaisaiId = K.Id)
      ORDER BY K.Nichi, K.Basho`,
    [year, month],
  );
  const days: RaceDay[] = [];
  for (const row of rows) {
    const date = toDate(year, month, row.Nichi);
    if (days.at(-1)?.date !== date) {
      days.push({ date, bashos: [] });
    }
    days.at(-1)?.bashos.push({ basho: row.Basho, bashoMei: label(basho, row.Basho) });
  }
  return days;
}

/** 指定した日のレース一覧。競馬場を指定すればその競馬場だけ */
export function racesOn(
  year: number,
  month: number,
  day: number,
  bashoCode?: number,
): RaceSummary[] {
  const rows: RaceRow[] = select(
    `SELECT ${RACE_COLUMNS} FROM Race R
      INNER JOIN Kaisai K ON K.Id = R.KaisaiId
      WHERE K.Nen = ? AND K.Gatsu = ? AND K.Nichi = ? AND (? IS NULL OR K.Basho = ?)
      ORDER BY K.Basho, R.RaceBangou`,
    [year, month, day, bashoCode ?? null, bashoCode ?? null],
  );
  return rows.map(toRaceSummary);
}

/** 日付の文字列 (YYYY-MM-DD) を年月日にする。不正なら 400 */
export function parseDate(text: unknown): [number, number, number] {
  const matched = typeof text === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(text) : null;
  if (!matched) {
    throw new BadRequestError("date は YYYY-MM-DD で指定してください");
  }
  return [Number(matched[1]), Number(matched[2]), Number(matched[3])];
}
