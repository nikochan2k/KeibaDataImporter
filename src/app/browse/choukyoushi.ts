import { touzaiBetsu } from "../converters/Common";
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
import type { ChoukyoushiStart, ChoukyoushiSummary } from "./types";

/** 出走一覧の1ページの件数 */
export const CHOUKYOUSHI_STARTS_PER_PAGE = 50;

interface ChoukyoushiRow {
  Id: number;
  Meishou: string | null;
  Seinen: number | null;
  Seibetsu: number | null;
  TouzaiBetsu: number | null;
}

const CHOUKYOUSHI_COLUMNS = `C.Id,
  (SELECT J.Meishou FROM ChoukyoushiMei CM INNER JOIN Jinmei J ON J.Id = CM.JinmeiId
    WHERE CM.ChoukyoushiId = C.Id ORDER BY CM.Kubun LIMIT 1) AS Meishou,
  C.Seinengappi / 10000 AS Seinen, C.Seibetsu, C.TouzaiBetsu`;

function toChoukyoushiSummary(row: ChoukyoushiRow): ChoukyoushiSummary {
  return {
    id: row.Id,
    meishou: row.Meishou,
    seinen: row.Seinen,
    seibetsu: label(seibetsu, row.Seibetsu),
    shozoku: label(touzaiBetsu, row.TouzaiBetsu),
  };
}

/** 名前(姓名・略称・フリガナなど、どの表記でも)の前方一致で探す。異体字・全半角・空白の違いは MatchingKey で吸収し、インデックスが効くよう範囲で比較する */
export function searchChoukyoushi(query: string, limit = 50): ChoukyoushiSummary[] {
  const rows: ChoukyoushiRow[] = select(
    `SELECT ${CHOUKYOUSHI_COLUMNS} FROM Choukyoushi C
      WHERE C.Id IN (
        SELECT CM.ChoukyoushiId FROM Jinmei J INNER JOIN ChoukyoushiMei CM ON CM.JinmeiId = J.Id
          WHERE J.MatchingKey >= ? AND J.MatchingKey < ?)
      ORDER BY Meishou LIMIT ?`,
    [...matchingKeyRange(query), limit],
  );
  return rows.map(toChoukyoushiSummary);
}

/** 調教師の基本情報と、管理馬の出走(出走馬の Id の新しい順)の page ページ目 (1 始まり)。総件数も返す。管理馬は競走馬(Kyousouba)の現在の調教師で決まる */
export function getChoukyoushi(
  id: number,
  page = 1,
): ChoukyoushiSummary & { starts: ChoukyoushiStart[]; startCount: number; perPage: number } {
  const found: ChoukyoushiRow[] = select(
    `SELECT ${CHOUKYOUSHI_COLUMNS} FROM Choukyoushi C WHERE C.Id = ?`,
    [id],
  );
  if (found.length === 0) {
    throw new NotFoundError(`調教師が見つかりません: ${id}`);
  }

  const counted: { N: number }[] = select(
    `SELECT COUNT(*) AS N FROM Shussouba
      WHERE KyousoubaId IN (SELECT Id FROM Kyousouba WHERE ChoukyoushiId = ?)`,
    [id],
  );

  const rows: (RaceRow & {
    Umaban: number;
    KakuteiChakujun: number | null;
    Time: number | null;
    Agari3F: number | null;
    UmaId: number | null;
    Bamei: string | null;
    KishuMei: string | null;
  })[] = select(
    `SELECT ${RACE_COLUMNS}, S.Umaban, SS.KakuteiChakujun, SS.Time, SS.Agari3F,
        KY.UmaId, U.KanaBamei AS Bamei,
        ${JINMEI_SUBQUERY("COALESCE(SS.KishuId, S.KishuId)")} AS KishuMei
      FROM (
        SELECT Id FROM Shussouba
          WHERE KyousoubaId IN (SELECT Id FROM Kyousouba WHERE ChoukyoushiId = ?)
          ORDER BY Id DESC LIMIT ? OFFSET ?
      ) P
      INNER JOIN Shussouba S ON S.Id = P.Id
      LEFT JOIN ShussoubaSeiseki SS ON SS.Id = S.Id
      INNER JOIN Race R ON R.Id = S.RaceId
      INNER JOIN Kaisai K ON K.Id = R.KaisaiId
      INNER JOIN Kyousouba KY ON KY.Id = S.KyousoubaId
      LEFT JOIN Uma U ON U.Id = KY.UmaId
      ORDER BY S.Id DESC`,
    [id, CHOUKYOUSHI_STARTS_PER_PAGE, (page - 1) * CHOUKYOUSHI_STARTS_PER_PAGE],
  );
  return {
    ...toChoukyoushiSummary(found[0]),
    startCount: counted[0].N,
    perPage: CHOUKYOUSHI_STARTS_PER_PAGE,
    starts: rows.map((row) => ({
      ...toRaceSummary(row),
      umaban: row.Umaban,
      chakujun: row.KakuteiChakujun,
      time: row.Time,
      agari3F: row.Agari3F,
      umaId: row.UmaId,
      bamei: row.Bamei,
      kishuMei: row.KishuMei,
    })),
  };
}
