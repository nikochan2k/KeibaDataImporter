import { basho } from "../converters/Common";
import * as $R from "../converters/Race";
import { jinmeiMatchingKey } from "../daos/JinmeiDao";
import { readDb } from "../db/db";
import type { RaceSummary } from "./types";

/**
 * 人名・名義の前方一致検索の範囲。検索語を取り込み時と同じ MatchingKey にして(異体字・全半角・空白を揃える)、
 * MatchingKey の範囲検索にする。上端は UTF-8 で最大の文字を足す
 */
export function matchingKeyRange(query: string): [string, string] {
  const key = jinmeiMatchingKey(query);
  return [key, `${key}\u{10ffff}`];
}

/** 数値コードを表示用の名前にする。値がなければ null */
export function label(codes: { toNaiyou(code: number): string }, code: number | null) {
  return code == null ? null : codes.toNaiyou(code) || null;
}

/** 開催の日付を YYYY-MM-DD にする */
export function toDate(nen: number, gatsu: number, nichi: number) {
  return `${nen}-${String(gatsu).padStart(2, "0")}-${String(nichi).padStart(2, "0")}`;
}

/** YYYYMMDD の数値を YYYY-MM-DD にする */
export function fromNengappi(n: number) {
  return toDate(Math.floor(n / 10000), Math.floor(n / 100) % 100, n % 100);
}

/** 閲覧用の接続で読む。? に params を順に当てる。書き込みはしない */
export function select<T>(sql: string, params: (string | number | null)[] = []): T[] {
  return readDb()
    .query(sql)
    .all(...params) as T[];
}

/** 人名は区分によって表記が違うので、正式な氏名(Seimei)を優先する */
export const JINMEI_SUBQUERY = (kishuId: string) => `
  (SELECT J.Meishou FROM KishuMei KM INNER JOIN Jinmei J ON J.Id = KM.JinmeiId
    WHERE KM.KishuId = ${kishuId} ORDER BY KM.Kubun LIMIT 1)`;

const RACE_MEI_SUBQUERY = `
  (SELECT T.Meishou FROM RaceMei M INNER JOIN TokubetsuMei T ON T.Id = M.TokubetsuMeiId
    WHERE M.RaceId = R.Id ORDER BY M.Id LIMIT 1)`;

export interface RaceRow {
  Id: number;
  Nen: number;
  Gatsu: number;
  Nichi: number;
  Basho: number;
  RaceBangou: number;
  Meishou: string | null;
  Grade: number | null;
  HeichiShougai: number | null;
  DirtShiba: number | null;
  Kyori: number | null;
  Tousuu: number | null;
  HassouJikan: string | null;
}

/** Race R と Kaisai K を結合したクエリで RaceRow を得るための列 */
export const RACE_COLUMNS = `
  R.Id, K.Nen, K.Gatsu, K.Nichi, K.Basho, R.RaceBangou, R.Grade, R.HeichiShougai, R.DirtShiba,
  R.Kyori, R.Tousuu, COALESCE(R.HassouJikan, R.YoteiHassouJikan) AS HassouJikan,
  ${RACE_MEI_SUBQUERY} AS Meishou`;

export function toRaceSummary(row: RaceRow): RaceSummary {
  return {
    id: row.Id,
    date: toDate(row.Nen, row.Gatsu, row.Nichi),
    basho: row.Basho,
    bashoMei: label(basho, row.Basho),
    raceBangou: row.RaceBangou,
    meishou: row.Meishou,
    grade: label($R.grade, row.Grade),
    heichiShougai: label($R.heichiShougai, row.HeichiShougai),
    dirtShiba: label($R.dirtShiba, row.DirtShiba),
    kyori: row.Kyori,
    tousuu: row.Tousuu,
    hassouJikan: row.HassouJikan,
  };
}
