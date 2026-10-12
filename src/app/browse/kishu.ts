import { shozoku } from "../converters/Kishu";
import { seibetsu } from "../converters/Uma";
import { NotFoundError } from "../http/errors";
import {
  JINMEI_SUBQUERY,
  label,
  matchingKeyRange,
  RACE_COLUMNS,
  type RaceRow,
  select,
  toRaceSummary,
} from "./common";
import type { KishuStart, KishuSummary } from "./types";

/** 騎乗一覧の1ページの件数 */
export const KISHU_STARTS_PER_PAGE = 50;

interface KishuRow {
  Id: number;
  Meishou: string | null;
  Seinen: number | null;
  Seibetsu: number | null;
  Shozoku: number | null;
}

const KISHU_COLUMNS = `K.Id, ${JINMEI_SUBQUERY("K.Id")} AS Meishou, K.Seinengappi / 10000 AS Seinen, K.Seibetsu, K.Shozoku`;

function toKishuSummary(row: KishuRow): KishuSummary {
  return {
    id: row.Id,
    meishou: row.Meishou,
    seinen: row.Seinen,
    seibetsu: label(seibetsu, row.Seibetsu),
    shozoku: label(shozoku, row.Shozoku),
  };
}

/** 名前(姓名・略称・フリガナなど、どの表記でも)の前方一致で探す。異体字・全半角・空白の違いは MatchingKey で吸収し、インデックスが効くよう範囲で比較する */
export function searchKishu(query: string, limit = 50): KishuSummary[] {
  const rows: KishuRow[] = select(
    `SELECT ${KISHU_COLUMNS} FROM Kishu K
      WHERE K.Id IN (
        SELECT KM.KishuId FROM Jinmei J INNER JOIN KishuMei KM ON KM.JinmeiId = J.Id
          WHERE J.MatchingKey >= ? AND J.MatchingKey < ?)
      ORDER BY Meishou LIMIT ?`,
    [...matchingKeyRange(query), limit],
  );
  return rows.map(toKishuSummary);
}

/** 騎手の基本情報と、騎乗したレース(出走馬の Id の新しい順)の page ページ目 (1 始まり)。総件数も返す */
export function getKishu(
  id: number,
  page = 1,
): KishuSummary & { starts: KishuStart[]; startCount: number; perPage: number } {
  const found: KishuRow[] = select(`SELECT ${KISHU_COLUMNS} FROM Kishu K WHERE K.Id = ?`, [id]);
  if (found.length === 0) {
    throw new NotFoundError(`騎手が見つかりません: ${id}`);
  }

  const counted: { N: number }[] = select(
    `SELECT COUNT(*) AS N FROM Shussouba S
      LEFT JOIN ShussoubaSeiseki SS ON SS.Id = S.Id
      WHERE S.Id IN (SELECT Id FROM Shussouba WHERE KishuId = ? UNION SELECT Id FROM ShussoubaSeiseki WHERE KishuId = ?)
        AND COALESCE(SS.KishuId, S.KishuId) = ?`,
    [id, id, id],
  );

  const rows: (RaceRow & {
    Umaban: number;
    KakuteiChakujun: number | null;
    Time: number | null;
    Agari3F: number | null;
    UmaId: number | null;
    Bamei: string | null;
  })[] = select(
    `SELECT ${RACE_COLUMNS}, S.Umaban, SS.KakuteiChakujun, SS.Time, SS.Agari3F,
        KY.UmaId, U.KanaBamei AS Bamei
      FROM (
        SELECT S.Id FROM Shussouba S
          LEFT JOIN ShussoubaSeiseki SS ON SS.Id = S.Id
          WHERE S.Id IN (SELECT Id FROM Shussouba WHERE KishuId = ? UNION SELECT Id FROM ShussoubaSeiseki WHERE KishuId = ?)
            AND COALESCE(SS.KishuId, S.KishuId) = ?
          ORDER BY S.Id DESC LIMIT ? OFFSET ?
      ) P
      INNER JOIN Shussouba S ON S.Id = P.Id
      LEFT JOIN ShussoubaSeiseki SS ON SS.Id = S.Id
      INNER JOIN Race R ON R.Id = S.RaceId
      INNER JOIN Kaisai K ON K.Id = R.KaisaiId
      INNER JOIN Kyousouba KY ON KY.Id = S.KyousoubaId
      LEFT JOIN Uma U ON U.Id = KY.UmaId
      ORDER BY S.Id DESC`,
    [id, id, id, KISHU_STARTS_PER_PAGE, (page - 1) * KISHU_STARTS_PER_PAGE],
  );
  return {
    ...toKishuSummary(found[0]),
    startCount: counted[0].N,
    perPage: KISHU_STARTS_PER_PAGE,
    starts: rows.map((row) => ({
      ...toRaceSummary(row),
      umaban: row.Umaban,
      chakujun: row.KakuteiChakujun,
      time: row.Time,
      agari3F: row.Agari3F,
      umaId: row.UmaId,
      bamei: row.Bamei,
    })),
  };
}
