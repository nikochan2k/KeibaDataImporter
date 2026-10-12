import { seibetsu } from "../converters/Uma";
import type { Choukyou } from "../entities/Choukyou";
import { NotFoundError } from "../http/errors";
import { groupTimes, toPreviewChoukyou } from "./choukyou";
import {
  JINMEI_SUBQUERY,
  label,
  RACE_COLUMNS,
  type RaceRow,
  select,
  toRaceSummary,
} from "./common";
import type { PedigreeAncestor, PreviewChoukyou, UmaStart, UmaSummary } from "./types";

/** 血統表に出す祖先の代数 */
const PEDIGREE_GENERATIONS = 5;

/** 前方一致を IxUma3 / IxUma4 の範囲検索にするための上端。UTF-8 で最大の文字を足す */
function prefixUpperBound(prefix: string) {
  return `${prefix}\u{10ffff}`;
}

/** 馬名(カナ・英字)の前方一致で探す。LIKE は大文字小文字を区別せずインデックスが効かないので範囲で比較する */
export function searchUma(query: string, limit = 50): UmaSummary[] {
  const rows: {
    Id: number;
    KanaBamei: string | null;
    EigoBamei: string | null;
    Seinen: number | null;
    Seibetsu: number | null;
  }[] = select(
    `SELECT Id, KanaBamei, EigoBamei, COALESCE(Seinen, Seinengappi / 10000) AS Seinen, Seibetsu FROM Uma
      WHERE (KanaBamei >= ? AND KanaBamei < ?) OR (EigoBamei >= ? AND EigoBamei < ?)
      ORDER BY KanaBamei LIMIT ?`,
    [query, prefixUpperBound(query), query, prefixUpperBound(query), limit],
  );
  return rows.map((row) => ({
    id: row.Id,
    bamei: row.KanaBamei,
    eigoBamei: row.EigoBamei,
    seinen: row.Seinen,
    seibetsu: label(seibetsu, row.Seibetsu),
  }));
}

/** 馬の基本情報と、出走した全レース(新しい順) */
export function getUma(id: number): UmaSummary & {
  chichi: { id: number; bamei: string | null } | null;
  haha: { id: number; bamei: string | null } | null;
  pedigree: (PedigreeAncestor | null)[];
  starts: UmaStart[];
  choukyou: PreviewChoukyou[];
} {
  const found: {
    Id: number;
    KanaBamei: string | null;
    EigoBamei: string | null;
    Seinen: number | null;
    Seibetsu: number | null;
    ChichiId: number | null;
    ChichiBamei: string | null;
    HahaId: number | null;
    HahaBamei: string | null;
  }[] = select(
    `SELECT U.Id, U.KanaBamei, U.EigoBamei, COALESCE(U.Seinen, U.Seinengappi / 10000) AS Seinen, U.Seibetsu,
        C.Id AS ChichiId, C.KanaBamei AS ChichiBamei, H.Id AS HahaId, H.KanaBamei AS HahaBamei
      FROM Uma U
      LEFT JOIN Uma C ON C.Id = U.ChichiUmaId
      LEFT JOIN Uma H ON H.Id = U.HahaUmaId
      WHERE U.Id = ?`,
    [id],
  );
  if (found.length === 0) {
    throw new NotFoundError(`馬が見つかりません: ${id}`);
  }
  const uma = found[0];

  const rows: (RaceRow & {
    Umaban: number;
    KakuteiChakujun: number | null;
    Time: number | null;
    Agari3F: number | null;
    KishuMei: string | null;
  })[] = select(
    `SELECT ${RACE_COLUMNS}, S.Umaban, SS.KakuteiChakujun, SS.Time, SS.Agari3F,
        ${JINMEI_SUBQUERY("COALESCE(SS.KishuId, S.KishuId)")} AS KishuMei
      FROM Kyousouba KY
      INNER JOIN Shussouba S ON S.KyousoubaId = KY.Id
      INNER JOIN Race R ON R.Id = S.RaceId
      INNER JOIN Kaisai K ON K.Id = R.KaisaiId
      LEFT JOIN ShussoubaSeiseki SS ON SS.Id = S.Id
      WHERE KY.UmaId = ?
      ORDER BY K.Nen DESC, K.Gatsu DESC, K.Nichi DESC, R.RaceBangou DESC`,
    [id],
  );
  const choukyouRows: (Choukyou & { HonOikiri: number | null; AwaseBamei: string | null })[] =
    select(
      `SELECT C.*, AU.KanaBamei AS AwaseBamei,
          (SELECT MAX(SC.HonOikiri) FROM ShussoubaChoukyou SC WHERE SC.ChoukyouId = C.Id) AS HonOikiri
        FROM Choukyou C
        LEFT JOIN Uma AU ON AU.Id = C.AwaseUmaId
        WHERE C.UmaId = ? ORDER BY C.Nengappi DESC, C.Renban DESC`,
      [id],
    );
  const times = groupTimes(
    select(
      `SELECT T.ChoukyouId, T.F, T.Time FROM ChoukyouTime T
        INNER JOIN Choukyou C ON C.Id = T.ChoukyouId
        WHERE C.UmaId = ? ORDER BY T.ChoukyouId, T.F DESC`,
      [id],
    ),
  );
  return {
    id: uma.Id,
    bamei: uma.KanaBamei,
    eigoBamei: uma.EigoBamei,
    seinen: uma.Seinen,
    seibetsu: label(seibetsu, uma.Seibetsu),
    chichi: uma.ChichiId == null ? null : { id: uma.ChichiId, bamei: uma.ChichiBamei },
    haha: uma.HahaId == null ? null : { id: uma.HahaId, bamei: uma.HahaBamei },
    pedigree: pedigree(uma.Id),
    starts: rows.map((row) => ({
      ...toRaceSummary(row),
      umaban: row.Umaban,
      chakujun: row.KakuteiChakujun,
      time: row.Time,
      agari3F: row.Agari3F,
      kishuMei: row.KishuMei,
    })),
    choukyou: choukyouRows.map((c) =>
      toPreviewChoukyou(c, {
        honOikiri: c.HonOikiri === 1,
        yajirushi: null,
        awase: c.AwaseBamei,
        times: times.get(c.Id) ?? [],
      }),
    ),
  };
}

/**
 * 5代までの祖先。二分木を配列にした並びで、位置 k は父=2n・母=2n+1 の n=k+2 番目 (父, 母, 父父, 父母, 母父, 母母, 父父父, ...)。
 * 分かっていない祖先とその先は null
 */
function pedigree(id: number): (PedigreeAncestor | null)[] {
  type Row = {
    Id: number;
    KanaBamei: string | null;
    ChichiUmaId: number | null;
    HahaUmaId: number | null;
  };
  const fetch = (ids: number[]): Map<number, Row> => {
    if (ids.length === 0) {
      return new Map();
    }
    const rows: Row[] = select(
      `SELECT Id, KanaBamei, ChichiUmaId, HahaUmaId FROM Uma WHERE Id IN (${ids.map(() => "?").join(",")})`,
      ids,
    );
    return new Map(rows.map((row) => [row.Id, row]));
  };
  const result: (PedigreeAncestor | null)[] = [];
  let slots: (Row | null)[] = [fetch([id]).get(id) ?? null];
  for (let depth = 1; depth <= PEDIGREE_GENERATIONS; depth++) {
    const parentIds = slots.flatMap((child) => [child?.ChichiUmaId, child?.HahaUmaId]);
    const rows = fetch(parentIds.filter((value): value is number => value != null));
    slots = parentIds.map((parentId) => (parentId == null ? null : (rows.get(parentId) ?? null)));
    for (const parent of slots) {
      result.push(parent == null ? null : { id: parent.Id, bamei: parent.KanaBamei });
    }
  }
  return result;
}
