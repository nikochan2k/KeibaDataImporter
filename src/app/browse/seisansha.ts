import { NotFoundError } from "../http/errors";
import {
  JINMEI_SUBQUERY,
  matchingKeyRange,
  RACE_COLUMNS,
  type RaceRow,
  select,
  toRaceSummary,
} from "./common";
import type { SeisanshaStart, SeisanshaSummary } from "./types";

/** 出走一覧の1ページの件数 */
export const SEISANSHA_STARTS_PER_PAGE = 50;

interface SeisanshaRow {
  Id: number;
  Meishou: string | null;
  Juusho: string | null;
}

const SEISANSHA_COLUMNS = `B.Id,
  (SELECT SH.Meishou FROM SeisanshaMei BM INNER JOIN Shoyuu SH ON SH.Id = BM.ShoyuuId
    WHERE BM.SeisanshaId = B.Id ORDER BY BM.Kubun LIMIT 1) AS Meishou,
  B.Juusho`;

function toSeisanshaSummary(row: SeisanshaRow): SeisanshaSummary {
  return { id: row.Id, meishou: row.Meishou, juusho: row.Juusho };
}

/** 名前(正式名・略称・フリガナなど、どの表記でも)の前方一致で探す。異体字・全半角・空白の違いは MatchingKey で吸収し、インデックスが効くよう範囲で比較する */
export function searchSeisansha(query: string, limit = 50): SeisanshaSummary[] {
  const rows: SeisanshaRow[] = select(
    `SELECT ${SEISANSHA_COLUMNS} FROM Seisansha B
      WHERE B.Id IN (
        SELECT BM.SeisanshaId FROM Shoyuu SH INNER JOIN SeisanshaMei BM ON BM.ShoyuuId = SH.Id
          WHERE SH.MatchingKey >= ? AND SH.MatchingKey < ?)
      ORDER BY Meishou LIMIT ?`,
    [...matchingKeyRange(query), limit],
  );
  return rows.map(toSeisanshaSummary);
}

/**
 * 生産者の出走。その生産者が生産した馬(Seisanba)の出走。
 * Shussouba S・Race R・Kaisai K・Kyousouba KY・ShussoubaSeiseki SS・Uma U を結合する
 */
const STARTS_FROM = `
  FROM Shussouba S
    INNER JOIN Race R ON R.Id = S.RaceId
    INNER JOIN Kaisai K ON K.Id = R.KaisaiId
    INNER JOIN Kyousouba KY ON KY.Id = S.KyousoubaId
    LEFT JOIN ShussoubaSeiseki SS ON SS.Id = S.Id
    LEFT JOIN Uma U ON U.Id = KY.UmaId
  WHERE KY.UmaId IN (SELECT UmaId FROM Seisanba WHERE SeisanshaId = ?1)`;

/** 生産者の基本情報と、生産馬の出走(出走馬の Id の新しい順)の page ページ目 (1 始まり)。総件数も返す */
export function getSeisansha(
  id: number,
  page = 1,
): SeisanshaSummary & { starts: SeisanshaStart[]; startCount: number; perPage: number } {
  const found: SeisanshaRow[] = select(
    `SELECT ${SEISANSHA_COLUMNS} FROM Seisansha B WHERE B.Id = ?`,
    [id],
  );
  if (found.length === 0) {
    throw new NotFoundError(`生産者が見つかりません: ${id}`);
  }

  const counted: { N: number }[] = select(`SELECT COUNT(*) AS N ${STARTS_FROM}`, [id]);

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
      ${STARTS_FROM}
      ORDER BY S.Id DESC LIMIT ?2 OFFSET ?3`,
    [id, SEISANSHA_STARTS_PER_PAGE, (page - 1) * SEISANSHA_STARTS_PER_PAGE],
  );
  return {
    ...toSeisanshaSummary(found[0]),
    startCount: counted[0].N,
    perPage: SEISANSHA_STARTS_PER_PAGE,
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
