import { NotFoundError } from "../http/errors";
import {
  JINMEI_SUBQUERY,
  matchingKeyRange,
  RACE_COLUMNS,
  type RaceRow,
  select,
  toRaceSummary,
} from "./common";
import type { BanushiStart, BanushiSummary } from "./types";

/** 出走一覧の1ページの件数 */
export const BANUSHI_STARTS_PER_PAGE = 50;

interface BanushiRow {
  Id: number;
  Meishou: string | null;
  Fukushoku: string | null;
}

const BANUSHI_COLUMNS = `B.Id,
  (SELECT SH.Meishou FROM BanushiMei BM INNER JOIN Shoyuu SH ON SH.Id = BM.ShoyuuId
    WHERE BM.BanushiId = B.Id ORDER BY BM.Kubun LIMIT 1) AS Meishou,
  B.Fukushoku`;

function toBanushiSummary(row: BanushiRow): BanushiSummary {
  return { id: row.Id, meishou: row.Meishou, fukushoku: row.Fukushoku };
}

/** 名前(正式名・略称・フリガナなど、どの表記でも)の前方一致で探す。異体字・全半角・空白の違いは MatchingKey で吸収し、インデックスが効くよう範囲で比較する */
export function searchBanushi(query: string, limit = 50): BanushiSummary[] {
  const rows: BanushiRow[] = select(
    `SELECT ${BANUSHI_COLUMNS} FROM Banushi B
      WHERE B.Id IN (
        SELECT BM.BanushiId FROM Shoyuu SH INNER JOIN BanushiMei BM ON BM.ShoyuuId = SH.Id
          WHERE SH.MatchingKey >= ? AND SH.MatchingKey < ?)
      ORDER BY Meishou LIMIT ?`,
    [...matchingKeyRange(query), limit],
  );
  return rows.map(toBanushiSummary);
}

/**
 * 馬主の出走。その馬主の馬(UmaBanushi)のうち、レースの日の時点の馬主が
 * その馬主である出走だけにする (馬主は変わるので)。Shussouba S・Race R・Kaisai K・Kyousouba KY・ShussoubaSeiseki SS・Uma U を結合する
 */
const STARTS_FROM = `
  FROM Shussouba S
    INNER JOIN Race R ON R.Id = S.RaceId
    INNER JOIN Kaisai K ON K.Id = R.KaisaiId
    INNER JOIN Kyousouba KY ON KY.Id = S.KyousoubaId
    LEFT JOIN ShussoubaSeiseki SS ON SS.Id = S.Id
    LEFT JOIN Uma U ON U.Id = KY.UmaId
  WHERE KY.UmaId IN (SELECT UmaId FROM UmaBanushi WHERE BanushiId = ?1)
    AND (SELECT UB.BanushiId FROM UmaBanushi UB
          WHERE UB.UmaId = KY.UmaId AND UB.Nengappi <= K.Nen * 10000 + K.Gatsu * 100 + K.Nichi
          ORDER BY UB.Nengappi DESC LIMIT 1) = ?1`;

/** 馬主の基本情報と、持ち馬の出走(出走馬の Id の新しい順)の page ページ目 (1 始まり)。総件数も返す */
export function getBanushi(
  id: number,
  page = 1,
): BanushiSummary & { starts: BanushiStart[]; startCount: number; perPage: number } {
  const found: BanushiRow[] = select(`SELECT ${BANUSHI_COLUMNS} FROM Banushi B WHERE B.Id = ?`, [
    id,
  ]);
  if (found.length === 0) {
    throw new NotFoundError(`馬主が見つかりません: ${id}`);
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
    [id, BANUSHI_STARTS_PER_PAGE, (page - 1) * BANUSHI_STARTS_PER_PAGE],
  );
  return {
    ...toBanushiSummary(found[0]),
    startCount: counted[0].N,
    perPage: BANUSHI_STARTS_PER_PAGE,
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
